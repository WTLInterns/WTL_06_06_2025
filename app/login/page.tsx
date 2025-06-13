'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './login.module.css';
import Cookies from 'js-cookie';
import FloatingIcons from '@/components/FloatingIcons';

export default function LoginPage() {
  const router = useRouter();
  const [searchParams, setSearchParams] = useState<URLSearchParams | null>(null);
  const [mobileNo, setMobileNo] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // On component mount, capture any URL query parameters.
  useEffect(() => {
    setSearchParams(new URLSearchParams(window.location.search));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Use your production API endpoint here.
      // The API is expected to receive a JSON body with "mobile" and "password"
      // even though a test URL example with query parameters is shown.
      const response = await fetch('http://localhost:8080/auth/login1', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          mobile: mobileNo,
          password 
        }),
      });

      const data = await response.json();
      console.log('Login response:', data);

      // Expected API response:
      // {
      //   "status": "success",
      //   "role": "USER",
      //   "data": null,
      //   "userId": 709,
      //   "username": null,
      //   "message": null
      // }
      if (response.status === 200 && data.status === 'success') {
        // Validate that we have required data
        if (!data.userId) {
          setError('Login failed: Invalid user data received.');
          setPassword('');
          return;
        }

        // Convert role to uppercase; default to 'USER'
        const role = data.role?.toUpperCase() || 'USER';

        // Cookie options - conditionally apply secure flag
        const cookieOptions = {
          expires: 7, // 7 days
          sameSite: 'strict' as const,
          // Only use secure in production (HTTPS)
          ...(typeof window !== 'undefined' && window.location.protocol === 'https:' && { secure: true })
        };

        try {
          // Store essential user info in cookies
          Cookies.set('userId', String(data.userId), cookieOptions);
          Cookies.set('mobileNo', mobileNo, cookieOptions);
          Cookies.set('userRole', role, cookieOptions);

          // Create user data object
          const userData = {
            userId: data.userId,
            mobileNo,
            role,
            isLoggedIn: true,
            loginTime: new Date().toISOString()
          };

          // Store combined user data
          Cookies.set('user', JSON.stringify(userData), cookieOptions);

          // Log for debugging
          console.log('Cookies set successfully:', {
            userId: data.userId,
            mobileNo,
            role,
            userData
          });

          // Verify cookies were set
          const verifyUserId = Cookies.get('userId');
          const verifyUser = Cookies.get('user');
          
          console.log('Cookie verification:', {
            verifyUserId,
            verifyUser,
            allCookies: document.cookie
          });

          if (!verifyUserId || !verifyUser) {
            console.error('Failed to set cookies:', { verifyUserId, verifyUser });
            setError('Failed to save login information. Please try again.');
            setPassword('');
            return;
          }

          // Show success message and redirect after a delay
          setSuccessMessage('Login successful! Redirecting...');
          setShowSuccessMessage(true);

          const redirectTo = searchParams?.get('redirect');
          setTimeout(() => {
            if (redirectTo) {
              router.push(redirectTo);
            } else {
              switch (role) {
                case 'ADMIN':
                  router.push('/admin/dashboard');
                  break;
                case 'VENDOR':
                  router.push('/vendor/dashboard');
                  break;
                case 'DRIVER':
                  router.push('/driver/dashboard');
                  break;
                default:
                  // For USER role or any other cases
                  router.push('/');
              }
            }
          }, 2000);

        } catch (cookieError) {
          console.error('Error setting cookies:', cookieError);
          setError('Failed to save login information. Please try again.');
          setPassword('');
        }
      } else {
        // If the API returns an error message, clear the password field and show the error.
        setPassword('');
        setError(data.message || 'Login failed. Please try again.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setPassword('');
      setError('An error occurred during login. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (setter: (value: string) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setter(e.target.value);
    if (error) {
      setError('');
    }
  };

  // Check for errors or registration messages stored in cookies or query parameters.
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('error')) {
      setError('Invalid mobile number or password.');
    }
    
    const registrationSuccess = Cookies.get('registrationSuccess');
    const registrationMessage = Cookies.get('registrationMessage');
    if (registrationSuccess === 'true') {
      setShowSuccessMessage(true);
      setSuccessMessage(registrationMessage || 'Registration successful! Please log in.');
      Cookies.remove('registrationSuccess');
      Cookies.remove('registrationMessage');
    }
  }, []);

  // Prevent the context menu and certain keyboard shortcuts.
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => e.preventDefault();
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'u') e.preventDefault();
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div className={styles['login-page']}>
      <div className={styles['red-background']}>
        <h1 className={styles['form-heading']}>Log in to your account</h1>
        <p className={styles['sign-in-text']}>
          Don't have an account? <Link href="/Register" className={styles['link-info']}>Create an account</Link>
        </p>

        <form onSubmit={handleSubmit}>
          {error && (
            <div className={`${styles['alert']} ${styles['alert-danger']} ${styles['animate-fade-in-down']}`}>
              {error}
            </div>
          )}

          {showSuccessMessage && (
            <div className={`${styles['alert']} ${styles['alert-success']} ${styles['animate-fade-in-down']}`}>
              {successMessage}
            </div>
          )}

          <div className={styles['form-group']}>
            <label htmlFor="mobileNo" className={styles['form-label']}>Mobile Number</label>
            <div className={styles['input-wrapper']}>
              <input 
                type="text" 
                id="mobileNo" 
                name="mobileNo" 
                placeholder="Enter your mobile number"
                autoFocus
                className={`${styles['form-control']} ${styles['input-with-icon']}`}
                value={mobileNo}
                onChange={handleInputChange(setMobileNo)}
                required
                disabled={isLoading}
              />
              <span className={styles['input-icon']}>📱</span>
            </div>
          </div>

          <div className={styles['form-group']}>
            <label htmlFor="password" className={styles['form-label']}>Password</label>
            <div className={styles['input-wrapper']}>
              <input 
                type="password" 
                placeholder="Enter your password" 
                id="password" 
                name="password"
                className={`${styles['form-control']} ${styles['input-with-icon']}`}
                value={password}
                onChange={handleInputChange(setPassword)}
                required
                disabled={isLoading}
              />
              <span className={styles['input-icon']}>🔒</span>
            </div>
          </div>

          <button 
            className={`${styles['login-button']} ${isLoading ? styles['loading'] : ''}`}
            type="submit" 
            name="login-submit"
            id="login-submit"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className={styles['loading-text']}>
                <span className={styles['loading-spinner']}></span>
                Logging in...
              </span>
            ) : (
              'Log in'
            )}
          </button>

          <p className={styles['sign-in-text']} style={{ marginTop: '20px' }}>
            <Link href="/forgot-password" className={styles['link-info']}>Forgot password?</Link>
          </p>
        </form>
      </div>
      <FloatingIcons />
    </div>
  );
}