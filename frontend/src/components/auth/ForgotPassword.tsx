import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import type { AuthError } from '../../types/auth';

type Step = 'email' | 'otp';

const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [otpError, setOtpError] = useState<string | null>(null);

  const validateEmail = (value: string) => {
    if (!value.trim()) {
      setEmailError('This field is required.');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      setEmailError('Please enter a valid email address.');
      return false;
    }
    setEmailError(null);
    return true;
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!validateEmail(email)) return;

    setIsLoading(true);
    try {
      await authService.forgotPassword({ email });
      setSuccessMessage('OTP sent to your email. Please check your inbox.');
      setStep('otp');
    } catch (err) {
      const authErr = err as AuthError;
      setError(authErr.detail || 'Failed to send OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!otp.trim()) {
      setOtpError('This field is required.');
      return;
    }
    if (!/^\d{6}$/.test(otp)) {
      setOtpError('Please enter a valid 6-digit OTP.');
      return;
    }
    setOtpError(null);

    setIsLoading(true);
    try {
      await authService.verifyOtp({ email, otp });
      navigate('/reset-password', { state: { email, otp } });
    } catch (err) {
      const authErr = err as AuthError;
      setError(authErr.detail || 'Invalid or expired OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    height: '48px',
    border: '1px solid #b9b9b9',
    borderRadius: '8px',
    paddingLeft: '12px',
    paddingRight: '12px',
    fontFamily: "'Inter', sans-serif",
    fontSize: '14px',
    color: '#3b3b3b',
    outline: 'none',
    backgroundColor: '#ffffff',
  };

  const labelStyle: React.CSSProperties = {
    fontFamily: "'Inter', sans-serif",
    fontWeight: 500,
    fontSize: '14px',
    color: '#3b3b3b',
    display: 'block',
    marginBottom: '8px',
  };

  const buttonStyle: React.CSSProperties = {
    width: '100%',
    height: '48px',
    backgroundColor: '#5b21b6',
    borderRadius: '8px',
    border: 'none',
    color: '#ffffff',
    fontFamily: "'Inter', sans-serif",
    fontWeight: 700,
    fontSize: '14px',
    cursor: isLoading ? 'not-allowed' : 'pointer',
    opacity: isLoading ? 0.6 : 1,
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f3f3f3',
      }}
    >
      <div
        style={{
          width: '480px',
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          padding: '48px 40px',
          boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
        }}
      >
        {/* Logo area */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <img
            src="/assets/images/vms-logo-icon.png"
            alt="VMS Logo"
            width={48}
            height={57}
            style={{ marginBottom: '8px' }}
          />
          <h1
            style={{
              fontFamily: "'Inter', sans-serif",
              fontWeight: 600,
              fontSize: '28px',
              color: '#5b21b6',
              marginBottom: '8px',
            }}
          >
            {step === 'email' ? 'Forgot Password' : 'Verify OTP'}
          </h1>
          <p
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '16px',
              color: '#474a5f',
            }}
          >
            {step === 'email'
              ? 'Enter your registered email to receive an OTP.'
              : `We've sent a 6-digit OTP to ${email}`}
          </p>
        </div>

        {/* Success message */}
        {successMessage && step === 'otp' && (
          <div
            role="status"
            style={{
              backgroundColor: '#f0fdf4',
              border: '1px solid #86efac',
              borderRadius: '8px',
              padding: '12px 16px',
              marginBottom: '16px',
              fontFamily: "'Inter', sans-serif",
              fontSize: '14px',
              color: '#166534',
            }}
          >
            {successMessage}
          </div>
        )}

        {/* Error message */}
        {error && (
          <div
            role="alert"
            aria-live="assertive"
            style={{
              backgroundColor: '#fef2f2',
              border: '1px solid #fca5a5',
              borderRadius: '8px',
              padding: '12px 16px',
              marginBottom: '16px',
              fontFamily: "'Inter', sans-serif",
              fontSize: '14px',
              color: '#dc2626',
            }}
          >
            {error}
          </div>
        )}

        {step === 'email' ? (
          <form onSubmit={handleEmailSubmit} noValidate>
            <div style={{ marginBottom: '24px' }}>
              <label htmlFor="email" style={labelStyle}>
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => validateEmail(email)}
                placeholder="Enter your email address"
                autoComplete="email"
                aria-describedby={emailError ? 'email-error' : undefined}
                aria-invalid={!!emailError}
                style={{
                  ...inputStyle,
                  borderColor: emailError ? '#dc2626' : '#b9b9b9',
                }}
              />
              {emailError && (
                <span
                  id="email-error"
                  role="alert"
                  aria-live="polite"
                  style={{
                    display: 'block',
                    fontFamily: "'Inter', sans-serif",
                    fontSize: '12px',
                    color: '#dc2626',
                    marginTop: '4px',
                  }}
                >
                  {emailError}
                </span>
              )}
            </div>

            <button type="submit" disabled={isLoading} style={buttonStyle}>
              {isLoading ? 'Sending OTP...' : 'Send OTP'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleOtpSubmit} noValidate>
            <div style={{ marginBottom: '24px' }}>
              <label htmlFor="otp" style={labelStyle}>
                One-Time Password (OTP)
              </label>
              <input
                id="otp"
                type="text"
                inputMode="numeric"
                pattern="[0-9]{6}"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                onBlur={() => {
                  if (!otp.trim()) setOtpError('This field is required.');
                  else if (!/^\d{6}$/.test(otp)) setOtpError('Please enter a valid 6-digit OTP.');
                  else setOtpError(null);
                }}
                placeholder="Enter 6-digit OTP"
                aria-describedby={otpError ? 'otp-error' : undefined}
                aria-invalid={!!otpError}
                style={{
                  ...inputStyle,
                  borderColor: otpError ? '#dc2626' : '#b9b9b9',
                  letterSpacing: '4px',
                  textAlign: 'center',
                  fontSize: '20px',
                }}
              />
              {otpError && (
                <span
                  id="otp-error"
                  role="alert"
                  aria-live="polite"
                  style={{
                    display: 'block',
                    fontFamily: "'Inter', sans-serif",
                    fontSize: '12px',
                    color: '#dc2626',
                    marginTop: '4px',
                  }}
                >
                  {otpError}
                </span>
              )}
            </div>

            <button type="submit" disabled={isLoading} style={buttonStyle}>
              {isLoading ? 'Verifying...' : 'Verify OTP'}
            </button>

            <div style={{ marginTop: '16px', textAlign: 'center' }}>
              <button
                type="button"
                onClick={() => {
                  setStep('email');
                  setOtp('');
                  setError(null);
                  setSuccessMessage(null);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#5b21b6',
                  cursor: 'pointer',
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '14px',
                  textDecoration: 'underline',
                }}
              >
                Resend OTP
              </button>
            </div>
          </form>
        )}

        <div
          style={{
            marginTop: '24px',
            textAlign: 'center',
            fontFamily: "'Inter', sans-serif",
            fontSize: '14px',
          }}
        >
          <Link
            to="/"
            style={{
              color: '#5b21b6',
              textDecoration: 'underline',
            }}
          >
            &larr; Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
