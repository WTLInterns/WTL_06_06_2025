'use client';

import { useState } from 'react';
import Link from 'next/link';
import styles from './forgot-password.module.css';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:8080/auth/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const message = await response.text();

      if (response.ok) {
        setSuccessMessage(message);
        setStep(2);
      } else {
        setError(message || 'Failed to send OTP');
      }
    } catch (error) {
      setError('Unable to connect to the server. Please make sure the backend is running on port 8080.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:8080/auth/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otp }),
      });

      const message = await response.text();

      if (response.ok) {
        setSuccessMessage(message);
        setStep(3);
      } else {
        setError(message || 'Invalid OTP');
      }
    } catch (error) {
      setError('Unable to connect to the server. Please make sure the backend is running on port 8080.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:8080/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email, 
          otp,
          password: newPassword
        }),
      });

      const message = await response.text();

      if (response.ok) {
        setSuccessMessage(message);
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      } else {
        setError(message || 'Failed to reset password');
      }
    } catch (error) {
      setError('Unable to connect to the server. Please make sure the backend is running on port 8080.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles['forgot-password-page']}>
      <div className={styles['red-background']}>
        <h1 className={styles['form-heading']}>Reset Password</h1>
        
        {error && (
          <div className={`${styles['alert']} ${styles['alert-danger']}`}>
            {error}
          </div>
        )}

        {successMessage && (
          <div className={`${styles['alert']} ${styles['alert-success']}`}>
            {successMessage}
          </div>
        )}

        {step === 1 && (
          <form onSubmit={handleSendOTP}>
            <div className={styles['form-group']}>
              <label htmlFor="email" className={styles['form-label']}>Email Address</label>
              <div className={styles['input-wrapper']}>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="Enter your email address"
                  className={`${styles['form-control']} ${styles['input-with-icon']}`}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
                <span className={styles['input-icon']}>📧</span>
              </div>
            </div>

            <button
              className={`${styles['submit-button']} ${isLoading ? styles['loading'] : ''}`}
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? 'Sending OTP...' : 'Send OTP'}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerifyOTP}>
            <div className={styles['form-group']}>
              <label htmlFor="otp" className={styles['form-label']}>Enter OTP</label>
              <div className={styles['input-wrapper']}>
                <input
                  type="text"
                  id="otp"
                  name="otp"
                  placeholder="Enter the OTP sent to your email"
                  className={`${styles['form-control']} ${styles['input-with-icon']}`}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                  disabled={isLoading}
                />
                <span className={styles['input-icon']}>🔢</span>
              </div>
            </div>

            <button
              className={`${styles['submit-button']} ${isLoading ? styles['loading'] : ''}`}
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? 'Verifying...' : 'Verify OTP'}
            </button>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleResetPassword}>
            <div className={styles['form-group']}>
              <label htmlFor="newPassword" className={styles['form-label']}>New Password</label>
              <div className={styles['input-wrapper']}>
                <input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  placeholder="Enter new password"
                  className={`${styles['form-control']} ${styles['input-with-icon']}`}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
                <span className={styles['input-icon']}>🔒</span>
              </div>
            </div>

            <div className={styles['form-group']}>
              <label htmlFor="confirmPassword" className={styles['form-label']}>Confirm New Password</label>
              <div className={styles['input-wrapper']}>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  placeholder="Confirm new password"
                  className={`${styles['form-control']} ${styles['input-with-icon']}`}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
                <span className={styles['input-icon']}>🔒</span>
              </div>
            </div>

            <button
              className={`${styles['submit-button']} ${isLoading ? styles['loading'] : ''}`}
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        )}

        <p className={styles['back-to-login']}>
          <Link href="/login" className={styles['link-info']}>Back to Login</Link>
        </p>
      </div>
    </div>
  );
} 