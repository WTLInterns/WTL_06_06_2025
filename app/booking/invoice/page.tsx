"use client"

import { useState, useEffect, Suspense } from "react"
import Image from "next/image"
import { useRouter, useSearchParams } from "next/navigation"
import Cookies from 'js-cookie';


// Define interfaces for TypeScript type safety
interface CarData {
  name: string
  image: string
  price: number
  features: string[]
  category: string
  pickupLocation: string
  dropLocation: string
  date: string
  returnDate: string
  time: string
  tripType: string
  distance: string
  days: string
}

interface FormData {
  name: string
  email: string
  phone: string
}

interface FormErrors {
  phone: string
}

interface PricingData {
  driverrate: number
  gst: number
  service: number
  total: number
  isCalculated: boolean
}

function InvoiceContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Car data loaded via URL parameters
  const [carData, setCarData] = useState<CarData>({
    name: "",
    image: "",
    price: 0,
    features: [],
    category: "",
    pickupLocation: "",
    dropLocation: "",
    date: "",
    returnDate: "",
    time: "",
    tripType: "oneWay",
    distance: "0",
    days: "0"
  })

  // Booking form state
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    phone: ""
  })

  // Field error state for form validations (phone field)
  const [formErrors, setFormErrors] = useState<FormErrors>({ phone: "" })

  // Pricing state coming from the pricing API (invoice1 endpoint)
  const [pricing, setPricing] = useState<PricingData>({
    driverrate: 0,
    gst: 0,
    service: 0,
    total: carData.price + Math.round(carData.price * 0.1) + Math.round(carData.price * 0.05),
    isCalculated: false
  })

  

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [bookingSuccess, setBookingSuccess] = useState(false)
  const [bookingId, setBookingId] = useState("")
  const [showSuccessPopup, setShowSuccessPopup] = useState(false)

  // Parse URL parameters on component mount
  useEffect(() => {
    const name = searchParams.get("name") || ""
    const image = searchParams.get("image") || "/images/sedan-premium.jpg"
    const price = Number(searchParams.get("price")) || 0
    const features = searchParams.get("features")?.split(",") || []
    const category = searchParams.get("category") || ""
    const pickupLocation = searchParams.get("pickupLocation") || ""
    const dropLocation = searchParams.get("dropLocation") || ""
    const date = searchParams.get("date") || ""
    const returnDate = searchParams.get("returnDate") || ""
    const time = searchParams.get("time") || ""
    const tripType = searchParams.get("tripType") || "oneWay"
    const distance = searchParams.get("distance") || "0"
    const days = searchParams.get("days") || "0"

    setCarData({
      name,
      image,
      price,
      features,
      category,
      pickupLocation,
      dropLocation,
      date,
      returnDate,
      time,
      tripType,
      distance,
      days
    })

    // Prefill form fields if user is logged in
    if (typeof window !== 'undefined') {
  const userStr = Cookies.get('user');
  if (userStr) {
    try {
      const userObj = JSON.parse(userStr);
      console.log('Loaded user from cookie:', userObj); // Debug
      setFormData(prev => ({
        name: userObj.username || userObj.name || prev.name || "",
        email: userObj.email || prev.email || "",
        phone: userObj.phone || userObj.mobileNo || prev.phone || ""
      }));
    } catch (err) {
      console.log('Failed to parse user from cookie', err);
    }
  }
}
    }, [searchParams])

  const userId = Cookies.get('userId')


  // Call the pricing API (invoice1) and update the pricing state
  const calculatePricing = async () => {
    // Ensure required form fields are provided before pricing calculation
    if (!formData.name || !formData.email || !formData.phone) {
      alert("Please fill in all required fields")
      return false
    }

    setIsSubmitting(true)

    // Build URL-encoded form data from carData parameters
    const formDataToSubmit = new URLSearchParams({
      modelName: carData.name,
      modelType: carData.category,
      seats: "4+1",
      fuelType: "CNG-Diesel",
      availability: "Available",
      price: carData.price.toString(),
      pickupLocation: carData.pickupLocation,
      dropLocation: carData.dropLocation,
      date: carData.date,
      returndate: carData.returnDate || "",
      time: carData.time,
      tripType: carData.tripType,
      distance: carData.distance,
      days: carData.days,
      // userId: userId?.toString() || ""

    })

    try {
      const response = await fetch("https://api.worldtriplink.com/api/invoice1", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: formDataToSubmit
      })

      if (!response.ok) {
        throw new Error("Network response was not ok")
      }

      // Example response from API:
      // {
      //   "date": "2025-02-08",
      //   "distance": "11",
      //   "returndate": "2025-02-08",
      //   "gst": 720,
      //   "dropLocation": "Mumbai, Maharashtra, India",
      //   "modelType": "hatchback",
      //   "availability": null,
      //   "pickupLocation": "Pune, Maharashtra, India",
      //   "seats": "3",
      //   "driverrate": 300,
      //   "modelName": "maruti",
      //   "total": 6072,
      //   "tripType": "roundTrip",
      //   "fuelType": null,
      //   "service": 480,
      //   "price": "4572",
      //   "days": "1",
      //   "time": "02:45"
      // }
      const data = await response.json()
      console.log("Pricing data from API:", data)

      setPricing({
        driverrate: data.driverrate || 0,
        gst: data.gst || 0,
        service: data.service || 0,
        total: data.total || 0,
        isCalculated: true
      })

      setIsSubmitting(false)
      return true
    } catch (error) {
      console.error("Error fetching pricing:", error)
      alert("Failed to get pricing information. Please try again.")
      setIsSubmitting(false)
      return false
    }
  }

  // Phone number validation: exactly 10 digits required
  const validatePhone = (value: string) => {
    if (!value) {
      return "Phone number is required"
    }
    if (!/^\d{10}$/.test(value)) {
      return "Phone number must be exactly 10 digits"
    }
    return ""
  }

  // Update phone value and validate on change
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    const digitsOnly = value.replace(/\D/g, "")
    setFormData({ ...formData, phone: digitsOnly })
    setFormErrors({ ...formErrors, phone: validatePhone(digitsOnly) })
  }

  // Submit booking data to websiteBooking endpoint
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate phone
    const phoneError = validatePhone(formData.phone)
    setFormErrors({ ...formErrors, phone: phoneError })

    if (!formData.name || !formData.email || phoneError) {
      alert("Please fill in all required fields correctly")
      return
    }

    setIsSubmitting(true)
    setShowSuccessPopup(false)

    // Build URL-encoded booking data to submit
    const 
    formDataToSubmit = new URLSearchParams({
      cabId: carData.name,
      modelName: carData.name,
      modelType: carData.category,
      seats: "4+1",
      fuelType: "CNG-Diesel",
      availability: "Available",
      price: (carData.price + Math.round(carData.price * 0.1) + Math.round(carData.price * 0.05)).toString(),
      pickupLocation: carData.pickupLocation,
      dropLocation: carData.dropLocation,
      date: carData.date,
      returndate:
        carData.tripType === "roundTrip" || carData.tripType === "round-trip"
          ? carData.returnDate || carData.date
          : "",
      time: carData.time,
      tripType: carData.tripType,
      distance: carData.distance,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      service: Math.round(carData.price * 0.1).toString(),
      gst: Math.round(carData.price * 0.05).toString(),
      total: carData.price.toString(),
      days: carData.days,
      driverrate: "0",
      userId: userId?.toString() || ""

      
    })

    try {
      const response = await fetch("https://api.worldtriplink.com/api/bookingConfirm", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: formDataToSubmit
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Server error response:", errorText)
        throw new Error("Server responded with an error")
      }

      const data = await response.json()
      console.log("Booking response:", data)

      if (data.status === "success") {
        setBookingId(data.bookingId)
        setBookingSuccess(true)
        setShowSuccessPopup(true)
        
        // Hide success popup after 3 seconds and redirect
        setTimeout(() => {
          setShowSuccessPopup(false)
          router.push("/")
        }, 3000)
      } else {
        throw new Error(data.error || "Booking failed")
      }
    } catch (error) {
      console.error("Error submitting booking:", error)
      alert("Failed to complete booking. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-4 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Success Message */}
        {bookingSuccess && (
          <div
            className="bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded relative mb-4"
            role="alert">
            <strong className="font-bold">Success!</strong>
            <span className="block sm:inline">
              {" "}
              Your booking has been confirmed! Your booking ID is: <strong>{bookingId}</strong>. An email has been sent with your booking details. Redirecting to home page...
            </span>
          </div>
        )}

        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Booking Invoice
          </h1>
          <p className="mt-2 text-gray-600">Complete your booking details below</p>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="grid md:grid-cols-2 gap-4">
            {/* Left Column – Car Details */}
            <div className="p-6 bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 text-white relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('/images/pattern.png')] opacity-10"></div>
              <div className="relative z-10">
                <h2 className="text-2xl font-bold mb-4 text-white">Cab Information</h2>
                <div className="space-y-4">
                  <div className="flex justify-center mb-4">
                    <div className="w-56 h-40 relative rounded-xl overflow-hidden shadow-2xl">
                      {carData.image ? (
                        <Image src={carData.image} alt={carData.name || "Car Image"} fill className="object-cover" priority />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                          <span className="text-gray-400">No image available</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white/10 p-3 rounded-lg backdrop-blur-sm">
                      <p className="text-blue-200 text-xs">Model Type</p>
                      <p className="font-semibold">{carData.category}</p>
                    </div>
                    <div className="bg-white/10 p-3 rounded-lg backdrop-blur-sm">
                      <p className="text-blue-200 text-xs">Seats</p>
                      <p className="font-semibold">{carData.category === "SUV" || carData.category === "MUV" ? "6+1" : "4+1"}</p>
                    </div>
                    <div className="bg-white/10 p-3 rounded-lg backdrop-blur-sm">
                      <p className="text-blue-200 text-xs">Fuel Type</p>
                      <p className="font-semibold">CNG-Diesel</p>
                    </div>
                    <div className="bg-white/10 p-3 rounded-lg backdrop-blur-sm">
                      <p className="text-blue-200 text-xs">Availability</p>
                      <p className="font-semibold">Available</p>
                    </div>
                  </div>
                  <div className="border-t border-white/20 pt-4 mt-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-blue-200">Price:</span>
                        <span className="font-semibold">₹{carData.price}</span>
                      </div>
                      {pricing.isCalculated && pricing.driverrate > 0 && (
                        <div className="flex justify-between items-center">
                          <span className="text-blue-200">Driver Allowance:</span>
                          <span className="font-semibold">₹{pricing.driverrate}</span>
                        </div>
                      )}
                      <div className="flex justify-between items-center">
                        <span className="text-blue-200">Service Charge:</span>
                        <span className="font-semibold">
                          ₹{pricing.isCalculated ? pricing.service : Math.round(carData.price * 0.1)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-blue-200">GST:</span>
                        <span className="font-semibold">
                          ₹{pricing.isCalculated ? pricing.gst : Math.round(carData.price * 0.05)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-xl mt-3 pt-3 border-t border-white/20">
                        <span className="font-bold">Total Amount:</span>
                        <span className="font-bold text-2xl">
                          ₹{pricing.isCalculated
                            ? pricing.total
                            : (carData.price + Math.round(carData.price * 0.1) + Math.round(carData.price * 0.05))}
                        </span>
                      </div>
                      {pricing.isCalculated && (
                        <div className="mt-2 text-center bg-white/20 p-1 rounded-lg">
                          <span className="text-white text-sm">Pricing calculated by server</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column – Trip Information & Booking Form */}
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Trip Information</h2>
              <div className="mb-6">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-500">Pickup Location</p>
                    <p className="font-medium text-gray-800">{carData.pickupLocation}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-500">Drop Location</p>
                    <p className="font-medium text-gray-800">{carData.dropLocation}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-500">Date</p>
                    <p className="font-medium text-gray-800">{carData.date}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-500">Return Date</p>
                    <p className="font-medium text-gray-800">{carData.returnDate}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-500">Time</p>
                    <p className="font-medium text-gray-800">{carData.time}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-500">Trip Type</p>
                    <p className="font-medium text-gray-800">{carData.tripType}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg col-span-2">
                    <p className="text-xs text-gray-500">Distance</p>
                    <p className="font-medium text-gray-800">{carData.distance} km</p>
                  </div>
                </div>
              </div>

              {/* Pricing Button */}
              {/* {!pricing.isCalculated && (
                <div className="mb-6">
                  <button
                    onClick={calculatePricing}
                    disabled={isSubmitting}
                    className="w-full bg-green-600 text-white py-2 rounded-lg font-bold text-lg hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-300">
                    Calculate Pricing
                  </button>
                </div>
              )} */}

              {/* Booking Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                    placeholder="Enter your name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    disabled={pricing.isCalculated}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    required
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    disabled={pricing.isCalculated}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    required
                    className={`w-full px-3 py-2 border-2 ${
                      formErrors.phone ? "border-red-500" : "border-gray-200"
                    } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300`}
                    placeholder="Enter your 10-digit phone number"
                    value={formData.phone}
                    onChange={handlePhoneChange}
                    pattern="[0-9]{10}"
                    maxLength={10}
                    disabled={pricing.isCalculated}
                  />
                  {formErrors.phone && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.phone}</p>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full relative overflow-hidden ${
                    isSubmitting
                      ? "bg-blue-600"
                      : "bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600"
                  } text-white py-3 rounded-lg font-bold text-lg hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transform transition-all duration-300 hover:scale-[1.02] shadow-lg hover:shadow-xl`}
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Processing...
                    </div>
                  ) : (
                    "Book Now"
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Footer / Additional Information */}
        <div className="mt-4 text-center text-gray-600">
          <p className="text-xs">
            By clicking "Book Now" you agree to our{" "}
            <a href="#" className="text-blue-600 hover:text-blue-800 font-medium">
              Terms and Conditions
            </a>{" "}
            and{" "}
            <a href="#" className="text-blue-600 hover:text-blue-800 font-medium">
              Privacy Policy
            </a>
          </p>
        </div>

        {showSuccessPopup && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 max-w-sm w-full mx-4 text-center animate-fade-in">
              <div className="relative w-24 h-24 mx-auto mb-6">
                <div className="absolute inset-0 bg-green-500 rounded-full animate-scale-in"></div>
                <svg
                  className="absolute inset-0 w-full h-full text-white animate-draw-check"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20 6L9 17L4 12" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Booking Successful!</h3>
              <p className="text-gray-600 mb-4">Your booking ID: {bookingId}</p>
              <p className="text-sm text-gray-500">Redirecting to homepage...</p>
            </div>
          </div>
        )}
      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes scaleIn {
          from { transform: scale(0); }
          to { transform: scale(1); }
        }
        
        @keyframes drawCheck {
          0% { 
            stroke-dasharray: 0, 30;
            stroke-dashoffset: 30;
          }
          100% { 
            stroke-dasharray: 30, 30;
            stroke-dashoffset: 0;
          }
        }
        
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out;
        }
        
        .animate-scale-in {
          animation: scaleIn 0.3s ease-out;
        }
        
        .animate-draw-check {
          animation: drawCheck 0.5s ease-out forwards;
          animation-delay: 0.3s;
        }
      `}</style>
    </div>
  )
}

export default function BookingInvoice() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <InvoiceContent />
    </Suspense>
  )
}