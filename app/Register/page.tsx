'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar2 from '../../components/Navbar2';
import FloatingIcons from '@/components/FloatingIcons';
// SVG Icons
const UserIcon = () => (
  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const MailIcon = () => (
  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const PhoneIcon = () => (
  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
  </svg>
);

const LockIcon = () => (
  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);

const EyeIcon = () => (
  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

const EyeOffIcon = () => (
  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
  </svg>
);

const CheckIcon = () => (
  <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const XIcon = () => (
  <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

interface FormData {
  username: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  role: string;
  address: string;
}

interface ValidationErrors {
  username?: string;
  email?: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
  address?: string;
  general?: string;
}

export default function Register() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    username: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'USER',
    address: ''
  });
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Password strength indicator
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    message: ''
  });

  // Validate password strength
  const validatePasswordStrength = (password: string) => {
    let score = 0;
    let message = '';

    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    switch (score) {
      case 0:
      case 1:
        message = 'Very Weak';
        break;
      case 2:
        message = 'Weak';
        break;
      case 3:
        message = 'Medium';
        break;
      case 4:
        message = 'Strong';
        break;
      case 5:
        message = 'Very Strong';
        break;
    }

    setPasswordStrength({ score, message });
    return score >= 3;
  };

  // Validate form fields
  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    // Username validation
    if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters long';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = 'Username can only contain letters, numbers, and underscores';
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Phone validation
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(formData.phone)) {
      newErrors.phone = 'Phone number must be 10 digits';
    }

    // Address validation
    if (formData.address.length < 5) {
      newErrors.address = 'Please enter a valid address (at least 5 characters)';
    }

    // Password validation
    if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    } else if (!validatePasswordStrength(formData.password)) {
      newErrors.password = 'Password is too weak. Please include uppercase, lowercase, numbers, and special characters';
    }

    // Confirm password validation
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      console.log('Submitting registration form:', formData);
      
      // Create a user object matching the CarRentalUser entity structure
      const userObject = {
        username: formData.username,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role: formData.role.toUpperCase(),
        // Required fields with default values
        address: formData.address,
        gender: "",
        last_name: "",
        latitude: 0,
        longitude: 0
        // Don't include ID field - let the backend generate it
      };

      console.log('User object being sent:', userObject);
      
      // Directly call the backend API
      const response = await fetch('https://api.worldtriplink.com/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userObject),
      });

      console.log('Registration response status:', response.status);
      
      let data;
      try {
        data = await response.json();
        console.log('Registration response data:', data);
      } catch (err) {
        console.log('Response is not JSON:', await response.text());
        data = { message: 'Unable to parse server response' };
      }

      if (response.ok) {
        // Show success message
        setSuccessMessage(data.message || 'Registration successful!');
        setShowSuccessMessage(true);
        
        // Store registration success in localStorage to show message on login page
        localStorage.setItem('registrationSuccess', 'true');
        localStorage.setItem('registrationMessage', 'Account created successfully! Please log in.');
        
        // Save user information to localStorage for profile display
        localStorage.setItem('username', formData.username);
        localStorage.setItem('email', formData.email);
        localStorage.setItem('mobileNo', formData.phone);
        localStorage.setItem('userRole', formData.role.toUpperCase());
        localStorage.setItem('address', formData.address || '');
        // Save all user data in a single object as well
        localStorage.setItem('user', JSON.stringify({
          username: formData.username,
          email: formData.email,
          mobileNo: formData.phone,
          role: formData.role.toUpperCase(),
          address: formData.address || '',
          isLoggedIn: true
        }));
        
        // Wait for 2 seconds before redirecting
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } else {
        // Handle error response
        const errorMessage = data.message || 
          'Registration failed. Please check your details and try again.';
        
        console.error('Error details:', data);
        setErrors({ 
          general: errorMessage
        });
      }
    } catch (err) {
      console.error('Registration error:', err);
      setErrors({ 
        general: 'Network error occurred. Please check your connection and try again.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name as keyof ValidationErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 py-12 px-4 sm:px-6 lg:px-8 relative">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/30 via-purple-500/30 to-pink-500/30 animate-pulse"></div>
      </div>

      {/* Success Message Toast */}
      {showSuccessMessage && (
        <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg animate-fade-in-down">
          <div className="flex items-center">
            <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
            <span>{successMessage}</span>
          </div>
        </div>
      )}

      <div className="max-w-md mx-auto relative z-10">
        <div className="text-center mb-8">
         
          <h2 className="text-3xl font-bold text-white tracking-tight">
            Create your account
          </h2>
          <p className="mt-2 text-lg text-gray-300">
            Already have an account?{' '}
            <Link 
              href="/login" 
              className="font-medium text-pink-400 hover:text-pink-300 transition-colors relative group"
            >
              Sign in
              <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-pink-400 scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
            </Link>
          </p>
        </div>

        <div className="backdrop-blur-xl bg-white/10 rounded-2xl shadow-2xl border border-white/20 p-8 space-y-8">
          {errors.general && (
            <div className="p-4 rounded-lg bg-red-500/20 border border-red-500/50 text-red-200">
              <p className="flex items-center text-sm">
                <XIcon />
                {errors.general}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {/* Username Field */}
              <div className="relative group">
                <label className="block text-sm font-medium text-gray-200 mb-1">
                  Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <UserIcon />
                  </div>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    className={`block w-full pl-10 pr-3 py-2.5 border ${
                      errors.username ? 'border-red-500' : 'border-gray-600'
                    } rounded-lg bg-black/20 text-white placeholder-gray-400 focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200`}
                    placeholder="Enter username"
                  />
                  {formData.username && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      {errors.username ? (
                        <XIcon />
                      ) : (
                        <CheckIcon />
                      )}
                    </div>
                  )}
                </div>
                {errors.username && (
                  <p className="mt-1 text-sm text-red-400">
                    {errors.username}
                  </p>
                )}
              </div>

              {/* Email Field */}
              <div className="relative group">
                <label className="block text-sm font-medium text-gray-200 mb-1">
                  Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MailIcon />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`block w-full pl-10 pr-3 py-2.5 border ${
                      errors.email ? 'border-red-500' : 'border-gray-600'
                    } rounded-lg bg-black/20 text-white placeholder-gray-400 focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200`}
                    placeholder="Enter email"
                  />
                  {formData.email && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      {errors.email ? (
                        <XIcon />
                      ) : (
                        <CheckIcon />
                      )}
                    </div>
                  )}
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-400">
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Phone Field */}
              <div className="relative group">
                <label className="block text-sm font-medium text-gray-200 mb-1">
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <PhoneIcon />
                  </div>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`block w-full pl-10 pr-3 py-2.5 border ${
                      errors.phone ? 'border-red-500' : 'border-gray-600'
                    } rounded-lg bg-black/20 text-white placeholder-gray-400 focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200`}
                    placeholder="Enter phone number"
                  />
                  {formData.phone && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      {errors.phone ? (
                        <XIcon />
                      ) : (
                        <CheckIcon />
                      )}
                    </div>
                  )}
                </div>
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-400">
                    {errors.phone}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div className="relative group">
                <label className="block text-sm font-medium text-gray-200 mb-1">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LockIcon />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`block w-full pl-10 pr-10 py-2.5 border ${
                      errors.password ? 'border-red-500' : 'border-gray-600'
                    } rounded-lg bg-black/20 text-white placeholder-gray-400 focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200`}
                    placeholder="Enter password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-200 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOffIcon />
                    ) : (
                      <EyeIcon />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-400">
                    {errors.password}
                  </p>
                )}
                {formData.password && (
                  <div className="mt-2">
                    <div className="flex items-center">
                      <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${
                            passwordStrength.score <= 1 ? 'bg-red-500' :
                            passwordStrength.score === 2 ? 'bg-yellow-500' :
                            passwordStrength.score === 3 ? 'bg-blue-500' :
                            passwordStrength.score === 4 ? 'bg-green-500' :
                            'bg-green-400'
                          }`}
                          style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                        />
                      </div>
                      <span className={`ml-2 text-sm ${
                        passwordStrength.score <= 1 ? 'text-red-400' :
                        passwordStrength.score === 2 ? 'text-yellow-400' :
                        passwordStrength.score === 3 ? 'text-blue-400' :
                        'text-green-400'
                      }`}>
                        {passwordStrength.message}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password Field */}
              <div className="relative group">
                <label className="block text-sm font-medium text-gray-200 mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LockIcon />
                  </div>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`block w-full pl-10 pr-3 py-2.5 border ${
                      errors.confirmPassword ? 'border-red-500' : 'border-gray-600'
                    } rounded-lg bg-black/20 text-white placeholder-gray-400 focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200`}
                    placeholder="Confirm password"
                  />
                  {formData.confirmPassword && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      {errors.confirmPassword ? (
                        <XIcon />
                      ) : (
                        <CheckIcon />
                      )}
                    </div>
                  )}
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-400">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
            </div>

            {/* Role Selection */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-200 mb-1">
                Role
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="block w-full py-2.5 px-3 border border-gray-600 rounded-lg bg-black/20 text-white focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200"
              >
                <option value="USER">User</option>
                <option value="VENDOR">Vendor</option>
              </select>
            </div>

            {/* Address Field */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-200 mb-1">
                Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-3 py-2.5 border ${
                    errors.address ? 'border-red-500' : 'border-gray-600'
                  } rounded-lg bg-black/20 text-white placeholder-gray-400 focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200`}
                  placeholder="Enter your address"
                />
                {formData.address && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    {errors.address ? (
                      <XIcon />
                    ) : (
                      <CheckIcon />
                    )}
                  </div>
                )}
              </div>
              {errors.address && (
                <p className="mt-1 text-sm text-red-400">
                  {errors.address}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 px-4 flex justify-center items-center rounded-lg text-white font-medium ${
                isLoading
                  ? 'bg-gray-600 cursor-not-allowed'
                  : 'bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700'
              } transition-all duration-200 shadow-lg hover:shadow-pink-500/25`}
            >
              {isLoading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating account...
                </div>
              ) : (
                'Create Account'
              )}
            </button>
          </form>
        </div>
      </div>
      <FloatingIcons /> 
    </div>
  );
} 