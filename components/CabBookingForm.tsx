"use client"

import { useState, useEffect, useRef, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import Script from "next/script"
import Cookies from "js-cookie" // Use cookies for login state, matching Navbar2

interface TimeSlot {
  id: string
  time: string
  available: boolean
}

declare global {
  interface Window {
    initGoogleAutocomplete: () => void
    google: {
      maps: {
        places: {
          Autocomplete: new (
            inputField: HTMLInputElement,
            opts?: {
              componentRestrictions?: { country: string }
              types?: string[]
            },
          ) => {
            addListener: (eventName: string, callback: () => void) => void
            getPlace: () => {
              formatted_address?: string
              name?: string
              address_components?: any[]
            }
          }
        }
      }
    }
  }
}

import './CabBookingForm.css';
export default function CabBookingForm() {
  // All useState declarations at the top!
  const pickupDateRef = useRef<HTMLInputElement>(null);
  const returnDateRef = useRef<HTMLInputElement>(null);
  const pickupTimeRef = useRef<HTMLInputElement>(null);
  // All useState declarations at the top!
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showPopup, setShowPopup] = useState(false); // <-- single source of truth
  // Helper to check login state from cookie (matching Navbar2)
const checkLoginState = () => {
  let loggedIn = false;
  const userStr = Cookies.get('user');
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      loggedIn = user.isLoggedIn === true;
    } catch {}
  }
  return loggedIn;
};

useEffect(() => {
  setLoading(true);
  // Wait 200ms to allow login to write to localStorage
  const timeout = setTimeout(() => {
    setIsLoggedIn(checkLoginState());
    setLoading(false);
  }, 200);
  return () => clearTimeout(timeout);
}, []);

// Listen for localStorage changes (login/logout in other tabs or after login)
useEffect(() => {
  const handleStorage = () => {
    setIsLoggedIn(checkLoginState());
  };
  window.addEventListener('storage', handleStorage);
  return () => window.removeEventListener('storage', handleStorage);
}, []);

// If user logs in while popup is open, close the popup
useEffect(() => {
  if (isLoggedIn && showPopup) {
    setShowPopup(false);
  }
}, [isLoggedIn, showPopup]);

// Defensive: forcibly close popup if login state flips true
useEffect(() => {
  if (isLoggedIn && showPopup) {
    setShowPopup(false);
    console.log('[DEBUG] Forced popup close due to login state.');
  }
}, [isLoggedIn]);

  const router = useRouter()
  const [tripType, setTripType] = useState("oneWay")
  const [pickupLocation, setPickupLocation] = useState("")
  const [dropLocation, setDropLocation] = useState("")
  const [pickupDate, setPickupDate] = useState("")
  const [Returndate, setReturndate] = useState("")
  const [pickupTime, setPickupTime] = useState("")
  const [error, setError] = useState("")
  const [locationError, setLocationError] = useState("")
  const [calculatedDistance, setCalculatedDistance] = useState<number | null>(null)
  const [scriptLoaded, setScriptLoaded] = useState(false)

  const [availableTimeSlots, setAvailableTimeSlots] = useState<TimeSlot[]>([])
  const [isLoadingTimeSlots, setIsLoadingTimeSlots] = useState(false)

  
  const [userName, setUserName] = useState("")
  const [mobileNumber, setMobileNumber] = useState("")

  const pickupRef = useRef<HTMLInputElement>(null)
  const dropRef = useRef<HTMLInputElement>(null)
  const pickupAutocompleteRef = useRef<any>(null)
  const dropAutocompleteRef = useRef<any>(null)

  const apiKey = "AIzaSyCelDo4I5cPQ72TfCTQW-arhPZ7ALNcp8w"
  const today = new Date().toISOString().split("T")[0]

  // Check if place is in India
  const isPlaceInIndia = (place: any) => {
    if (!place.address_components) return false

    for (const component of place.address_components) {
      if (component.types.includes("country") && component.short_name === "IN") {
        return true
      }
    }
    return false
  }

  // Initialize Google Autocomplete
  const initializeAutocomplete = () => {
    if (typeof window !== "undefined" && window.google && window.google.maps && window.google.maps.places) {
      if (pickupRef.current) {
        pickupAutocompleteRef.current = new window.google.maps.places.Autocomplete(pickupRef.current, {
          componentRestrictions: { country: "in" },
          types: ["geocode", "establishment"],
          fields: ["formatted_address", "name", "address_components"],
        })
        pickupAutocompleteRef.current.addListener("place_changed", () => {
          const place = pickupAutocompleteRef.current.getPlace()
          if (isPlaceInIndia(place)) {
            setPickupLocation(place?.formatted_address || place?.name || "")
            setLocationError("")
          } else {
            setPickupLocation("")
            setLocationError("We currently only provide services within India")
          }
        })
      }

      if (dropRef.current) {
        dropAutocompleteRef.current = new window.google.maps.places.Autocomplete(dropRef.current, {
          componentRestrictions: { country: "in" },
          types: ["geocode", "establishment"],
          fields: ["formatted_address", "name", "address_components"],
        })
        dropAutocompleteRef.current.addListener("place_changed", () => {
          const place = dropAutocompleteRef.current.getPlace()
          if (isPlaceInIndia(place)) {
            setDropLocation(place?.formatted_address || place?.name || "")
            setLocationError("")
          } else {
            setDropLocation("")
            setLocationError("We currently only provide services within India")
          }
        })
      }
    }
  }

  // Set up global initialization function
  useEffect(() => {
    window.initGoogleAutocomplete = initializeAutocomplete
    return () => {
      delete window.initGoogleAutocomplete
    }
  }, [])

  // Initialize when script loads
  useEffect(() => {
    if (scriptLoaded) {
      initializeAutocomplete()
    }
  }, [scriptLoaded])

  // Add custom styles for Google autocomplete dropdown
  useEffect(() => {
    const customStyles = document.createElement("style")
    customStyles.textContent = `
      .pac-container {
        border-radius: 8px;
        margin-top: 4px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        background-color: rgba(30, 41, 59, 0.95);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        padding: 8px;
        z-index: 10000;
      }
      
      .pac-item {
        padding: 8px 10px;
        cursor: pointer;
        border-top: none;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        color: rgba(255, 255, 255, 0.8);
        font-size: 14px;
        transition: all 0.2s ease;
      }
      
      .pac-item:hover {
        background-color: rgba(20, 184, 166, 0.6);
        color: white;
      }
      
      .pac-item-selected {
        background-color: rgba(20, 184, 166, 0.8);
        color: white;
      }
      
      .pac-item-query {
        color: rgba(255, 255, 255, 0.9);
        font-size: 14px;
        font-weight: 500;
        padding-right: 3px;
      }
      
      .pac-matched {
        color: #16a34a;
        font-weight: 600;
      }
      
      .pac-secondary-text {
        color: rgba(255, 255, 255, 0.6);
        font-size: 12px;
      }
      
      .pac-logo:after {
        background-color: rgba(30, 41, 59, 0.95);
        padding: 4px 8px;
        height: 28px;
        opacity: 0.4;
        filter: grayscale(0.8);
        transition: opacity 0.3s ease;
      }
      
      .pac-container:not(:hover) .pac-logo:after {
        opacity: 0.2;
      }
      
      .pac-container:hover .pac-logo:after {
        opacity: 0.4;
      }
      
      .pac-icon {
        display: none;
      }
      
      .pac-item:before {
        content: "📍";
        margin-right: 10px;
      }
    `
    document.head.appendChild(customStyles)

    return () => {
      document.head.removeChild(customStyles)
    }
  }, [])

  const fetchTimeSlots = async (date: string) => {
    setIsLoadingTimeSlots(true)
    try {
      console.log("Fetching time slots for date:", date)
    } catch (error) {
      console.error("Error fetching time slots:", error)
    } finally {
      setIsLoadingTimeSlots(false)
    }
  }

  const handleDateSelection = (date: string, type: "pickup" | "return") => {
    if (type === "pickup") {
      setPickupDate(date)
      fetchTimeSlots(date)
    } else {
      setReturndate(date)
    }
  }

  const openDatePicker = (id: string) => {
    const dateInput = document.getElementById(id) as HTMLInputElement
    if (dateInput) {
      try {
        if (typeof dateInput.showPicker === "function") {
          dateInput.showPicker()
        }
      } catch (error) {
        console.log("Date picker not supported in this browser")
      }
    }
  }

  const openTimePicker = (id: string) => {
    const timeInput = document.getElementById(id) as HTMLInputElement
    if (timeInput) {
      try {
        if (typeof timeInput.showPicker === "function") {
          timeInput.showPicker()
        }
      } catch (error) {
        console.log("Time picker not supported in this browser")
      }
    }
  }

  const formatTime = (time: string) => {
    if (!time) return ""
    const [hours, minutes] = time.split(":")
    const date = new Date()
    date.setHours(Number.parseInt(hours), Number.parseInt(minutes))
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  }

  const calculateDistance = async (origin: string, destination: string) => {
    try {
      console.log("Calculating distance between:", origin, "and", destination)

      const response = await fetch("http://localhost:8080/api/cab1", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          tripType: tripType === "oneWay" ? "oneWay" : tripType === "roundTrip" ? "roundTrip" : "rentalTrip",
          pickupLocation: origin,
          dropLocation: destination,
          date: pickupDate || "",
          Returndate: Returndate || "",
          time: pickupTime || "",
          distance: "0",
        }),
      })

      const data = await response.json()
      console.log("Distance API response:", data)

      if (data && data.distance && data.distance > 0) {
        const distance = data.distance
        console.log("✅ Using API calculated distance:", distance)
        setCalculatedDistance(distance)
        return distance
      } else {
        console.warn(`Backend API failed to return valid distance. Using default value.`)
        const defaultDistance = 100
        setCalculatedDistance(defaultDistance)
        return defaultDistance
      }
    } catch (error) {
      console.error("Error calculating distance:", error)
      const defaultDistance = 100
      setCalculatedDistance(defaultDistance)
      return defaultDistance
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!pickupLocation) {
      setError("Please enter pickup location");
      return;
    }
    if (!dropLocation) {
      setError("Please enter drop location");
      return;
    }
    if (!pickupDate) {
      setError("Please select pickup date");
      return;
    }
    if (tripType === "roundTrip" && !Returndate) {
      setError("Please select return date");
      return;
    }
    if (!pickupTime) {
      setError("Please select pickup time");
      return;
    }

    try {
      const distance = await calculateDistance(pickupLocation, dropLocation);
      if (isLoggedIn) {
        // Go directly to search results if logged in
        const searchParams = new URLSearchParams({
          pickup: pickupLocation,
          drop: dropLocation,
          date: pickupDate,
          time: pickupTime,
          tripType: tripType,
          Returndate: Returndate || "",
          distance: distance ? distance.toString() : "0",
        });
        router.push(`/search?${searchParams.toString()}`);
      } else {
        // Only show popup if not logged in (double check state)
        if (!isLoggedIn) setShowPopup(true);
      }
    } catch (error) {
      console.error("Error submitting booking:", error);
      setError("Failed to submit booking. Please try again.");
    }
  }

  const handleFinalSubmit = () => {
    if (!userName.trim()) {
      setError("Please enter your name")
      return
    }

    if (!mobileNumber.trim()) {
      setError("Please enter your mobile number")
      return
    }

    if (!/^\d{10}$/.test(mobileNumber)) {
      setError("Please enter a valid 10-digit mobile number")
      return
    }

    const searchParams = new URLSearchParams({
      pickup: pickupLocation,
      drop: dropLocation,
      date: pickupDate,
      time: pickupTime,
      tripType: tripType,
      Returndate: Returndate || "",
      distance: calculatedDistance ? calculatedDistance.toString() : "0",
      name: userName,
      mobile: mobileNumber,
    })

    router.push(`/search?${searchParams.toString()}`)
  }

  return (
    <>
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initGoogleAutocomplete`}
        strategy="afterInteractive"
        onLoad={() => setScriptLoaded(true)}
        onError={() => console.error("Failed to load Google Maps script")}
      />

      <form
        onSubmit={handleSubmit}
        className="w-full max-w-6xl mx-auto bg-black/30 backdrop-blur-sm rounded-lg shadow-lg p-6"
      >
        <div className="space-y-6">
          {/* Trip Type Selection */}
          <div className="flex space-x-6">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="tripType"
                value="oneWay"
                checked={tripType === "oneWay"}
                onChange={(e) => setTripType(e.target.value)}
                className="form-radio text-emerald-500 focus:ring-emerald-500"
                required
              />
              <span className="text-white">One Way</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="tripType"
                value="roundTrip"
                checked={tripType === "roundTrip"}
                onChange={(e) => setTripType(e.target.value)}
                className="form-radio text-emerald-500 focus:ring-emerald-500"
                required
              />
              <span className="text-white">Round Trip</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="tripType"
                value="rental-trip"
                checked={tripType === "rental-trip"}
                onChange={(e) => setTripType(e.target.value)}
                className="form-radio text-emerald-500 focus:ring-emerald-500"
                required
              />
              <span className="text-white">Rental Trip</span>
            </label>
          </div>

          {/* Location and Time Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Pickup Location */}
            <div>
              <label className="block text-sm font-medium text-white mb-1">Pickup Location</label>
              <div className="relative">
                <input
                  ref={pickupRef}
                  type="text"
                  placeholder="Enter pickup location"
                  value={pickupLocation}
                  onChange={(e) => setPickupLocation(e.target.value)}
                  className="w-full p-3 pl-10 border border-white/20 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white/20 text-white placeholder-white/70"
                  required
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Drop Location */}
            <div>
              <label className="block text-sm font-medium text-white mb-1">Drop Location</label>
              <div className="relative">
                <input
                  ref={dropRef}
                  type="text"
                  placeholder="Enter drop location"
                  value={dropLocation}
                  onChange={(e) => setDropLocation(e.target.value)}
                  className="w-full p-3 pl-10 border border-white/20 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white/20 text-white placeholder-white/70"
                  required
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Pickup Date */}
            <div>
              <label className="block text-sm font-medium text-white mb-1">Pickup Date</label>
              <div className="relative">
                <div className="relative">
  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
    <svg className="h-5 w-5 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  </span>
  <input
    id="pickupDate"
    type="date"
    value={pickupDate}
    onChange={(e) => handleDateSelection(e.target.value, "pickup")}
    min={today}
    className="w-full p-3 pl-10 border border-white/20 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white/20 text-white hide-native-picker"
    required
    ref={pickupDateRef}
    onClick={() => {
      if (pickupDateRef.current && typeof pickupDateRef.current.showPicker === 'function') {
        pickupDateRef.current.showPicker();
      }
    }}
  />
</div>
              </div>
            </div>

            {/* Return Date */}
            {tripType === "roundTrip" && (
              <div>
                <label className="block text-sm font-medium text-white mb-1">Return Date</label>
                <div className="relative">
                  <div className="relative">
  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
    <svg className="h-5 w-5 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  </span>
  <input
    id="Returndate"
    type="date"
    value={Returndate}
    onChange={(e) => handleDateSelection(e.target.value, "return")}
    min={pickupDate || today}
    className="w-full p-3 pl-10 border border-white/20 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white/20 text-white hide-native-picker"
    required
    ref={returnDateRef}
    onClick={() => {
      if (returnDateRef.current && typeof returnDateRef.current.showPicker === 'function') {
        returnDateRef.current.showPicker();
      }
    }}
  />
</div>
                </div>
              </div>
            )}

            {/* Pickup Time */}
            <div>
              <label className="block text-sm font-medium text-white mb-1">Pickup Time</label>
              <div className="relative">
                <div className="relative">
  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
    <svg className="h-5 w-5 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  </span>
  <input
    id="pickupTime"
    type="time"
    value={pickupTime}
    onChange={(e) => setPickupTime(e.target.value)}
    className="w-full p-3 pl-10 border border-white/20 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white/20 text-white hide-native-picker"
    required
    ref={pickupTimeRef}
    onClick={() => {
      if (pickupTimeRef.current && typeof pickupTimeRef.current.showPicker === 'function') {
        pickupTimeRef.current.showPicker();
      }
    }}
  />
</div>
                {isLoadingTimeSlots && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {error && <div className="text-red-500 text-sm text-center">{error}</div>}

          <div className="flex justify-center mt-6">
            <button
              type="submit"
              className="bg-emerald-500 text-white px-12 py-3 rounded-lg text-lg font-medium hover:bg-emerald-600 transition-colors"
            >
              Search Available Cabs
            </button>
          </div>
        </div>
      </form>
      {!loading && (showPopup && !isLoggedIn) && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-xl font-bold text-white mb-4">Enter Your Details</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-1">Your Name</label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full p-3 border border-white/20 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white/20 text-white placeholder-white/70"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-1">Mobile Number</label>
                <input
                  type="tel"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  placeholder="Enter 10-digit mobile number"
                  className="w-full p-3 border border-white/20 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white/20 text-white placeholder-white/70"
                  required
                  maxLength={10}
                  pattern="[0-9]{10}"
                />
              </div>

              {error && <div className="text-red-500 text-sm">{error}</div>}

              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPopup(false)}
                  className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleFinalSubmit}
                  className="flex-1 bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-600 transition-colors"
                >
                  Continue
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}