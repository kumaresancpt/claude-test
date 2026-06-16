import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import RoleSelector from './RoleSelector';
import { useAuth } from '../../hooks/useAuth';
import type { Role } from '../../types/auth';

interface FieldErrors {
  username?: string;
  password?: string;
}

const LoginPage: React.FC = () => {
  const { login, isLoading, error, lockedUntil, remainingSeconds } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('admin');
  const [showPassword, setShowPassword] = useState(false);
  const [keepLoggedIn, setKeepLoggedIn] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [countdown, setCountdown] = useState<number | null>(null);

  // Countdown timer when account is locked
  useEffect(() => {
    if (remainingSeconds != null) {
      setCountdown(remainingSeconds);
    }
  }, [remainingSeconds]);

  useEffect(() => {
    if (countdown == null || countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev == null || prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const validateField = useCallback((name: 'username' | 'password', value: string) => {
    if (!value.trim()) {
      setFieldErrors((prev) => ({ ...prev, [name]: 'This field is required.' }));
    } else {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  }, []);

  const handleUsernameBlur = () => validateField('username', username);
  const handlePasswordBlur = () => validateField('password', password);

  const isDisabled = !username.trim() || !password.trim() || isLoading;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields before submitting
    const errors: FieldErrors = {};
    if (!username.trim()) errors.username = 'This field is required.';
    if (!password.trim()) errors.password = 'This field is required.';
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    await login(username, password, role);
  };

  const minutesRemaining = countdown != null ? Math.ceil(countdown / 60) : null;

  return (
    <div
      style={{
        position: 'relative',
        width: '1440px',
        height: '885px',
        overflow: 'hidden',
        backgroundColor: '#ffffff',
        minWidth: '1440px',
      }}
    >
      {/* Background Photo - Left Panel */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: '1440px',
          height: '885px',
          overflow: 'hidden',
        }}
      >
        <img
          src="/assets/images/background-photo.png"
          alt=""
          style={{
            position: 'absolute',
            height: '100%',
            left: '-24.21%',
            top: '0.03%',
            width: '98.33%',
            maxWidth: 'none',
            objectFit: 'cover',
          }}
        />
      </div>

      {/* White Panel - Right Side */}
      <div
        style={{
          position: 'absolute',
          left: '844px',
          top: 0,
          width: '596px',
          height: '885px',
          backgroundColor: '#ffffff',
          borderRadius: '56px 0 0 56px',
        }}
      />

      {/* Logo */}
      <div
        style={{
          position: 'absolute',
          left: '986px',
          top: '103px',
          width: '313px',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '12px' }}>
          <img
            src="/assets/images/vms-logo-icon.png"
            alt="VMS Logo Icon"
            width={56}
            height={67}
          />
          <span
            style={{
              fontFamily: "'Inter', sans-serif",
              fontWeight: 900,
              fontSize: '31px',
              color: '#5b21b6',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              lineHeight: 1,
            }}
          >
            VISITOR
          </span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
          <span
            style={{
              fontFamily: "'Inter', sans-serif",
              fontWeight: 500,
              fontSize: '12px',
              color: '#000000',
            }}
          >
            Powered by
          </span>
          <img
            src="/assets/images/cpt-logo.svg"
            alt="Changepond Technologies Logo"
            width={175}
            height={18}
          />
        </div>
      </div>

      {/* Copyright Footer */}
      <div
        style={{
          position: 'absolute',
          left: '1142px',
          top: '844px',
          transform: 'translateX(-50%)',
          whiteSpace: 'nowrap',
        }}
      >
        <span
          style={{
            fontFamily: "'Inter', sans-serif",
            fontWeight: 400,
            fontSize: '14px',
            color: '#292d32',
          }}
        >
          Copyright 2026 Changepond. All Rights Reserved.
        </span>
      </div>

      {/* Form Container */}
      <div
        style={{
          position: 'absolute',
          left: '902px',
          top: '50%',
          transform: 'translateY(calc(-50% + 39.5px))',
          display: 'flex',
          flexDirection: 'column',
          gap: '32px',
          padding: '80px 40px',
          borderRadius: '20px',
          width: '480px',
        }}
      >
        {/* Heading Block */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '5px',
            alignItems: 'center',
          }}
        >
          <h1
            style={{
              fontFamily: "'Inter', sans-serif",
              fontWeight: 600,
              fontSize: '33px',
              lineHeight: '41.6px',
              color: '#5b21b6',
              letterSpacing: '0.208px',
            }}
          >
            Login
          </h1>
          <p
            style={{
              fontFamily: "'Inter', sans-serif",
              fontWeight: 400,
              fontSize: '20px',
              color: '#474a5f',
              letterSpacing: '0.208px',
            }}
          >
            Welcome to Visitor
          </p>
        </div>

        {/* Role Selector */}
        <RoleSelector selectedRole={role} onChange={setRole} />

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '30px', width: '400px' }}>
          {/* Global Error Message */}
          {error && (
            <div
              role="alert"
              aria-live="assertive"
              style={{
                backgroundColor: '#fef2f2',
                border: '1px solid #fca5a5',
                borderRadius: '8px',
                padding: '12px 16px',
                fontFamily: "'Inter', sans-serif",
                fontSize: '14px',
                color: '#dc2626',
                lineHeight: '1.5',
              }}
            >
              {error}
              {lockedUntil && countdown != null && countdown > 0 && (
                <div style={{ marginTop: '4px', fontWeight: 500 }}>
                  Time remaining: {minutesRemaining} minute{minutesRemaining !== 1 ? 's' : ''}{' '}
                  ({countdown}s)
                </div>
              )}
            </div>
          )}

          {/* Username Field */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label
              htmlFor="username"
              style={{
                fontFamily: "'Inter', sans-serif",
                fontWeight: 500,
                fontSize: '14px',
                color: '#3b3b3b',
                lineHeight: '16px',
              }}
            >
              Username
            </label>
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: '#ffffff',
                border: `1px solid ${fieldErrors.username ? '#dc2626' : '#b9b9b9'}`,
                borderRadius: '8px',
                height: '48px',
                paddingLeft: '12px',
                paddingRight: '12px',
                gap: '8px',
              }}
            >
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onBlur={handleUsernameBlur}
                placeholder="ex., john@123"
                autoComplete="username"
                aria-describedby={fieldErrors.username ? 'username-error' : undefined}
                aria-invalid={!!fieldErrors.username}
                style={{
                  flex: 1,
                  border: 'none',
                  outline: 'none',
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '14px',
                  fontWeight: 400,
                  color: '#3b3b3b',
                  backgroundColor: 'transparent',
                  letterSpacing: '0.5px',
                }}
              />
              <img
                src="/assets/images/icon-user.png"
                alt=""
                aria-hidden="true"
                width={24}
                height={24}
              />
            </div>
            {fieldErrors.username && (
              <span
                id="username-error"
                role="alert"
                aria-live="polite"
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '12px',
                  color: '#dc2626',
                  marginTop: '4px',
                }}
              >
                {fieldErrors.username}
              </span>
            )}
          </div>

          {/* Password Field */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label
              htmlFor="password"
              style={{
                fontFamily: "'Inter', sans-serif",
                fontWeight: 500,
                fontSize: '14px',
                color: '#3b3b3b',
                lineHeight: '16px',
              }}
            >
              Password
            </label>
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: '#ffffff',
                border: `1px solid ${fieldErrors.password ? '#dc2626' : '#b9b9b9'}`,
                borderRadius: '8px',
                height: '48px',
                paddingLeft: '12px',
                paddingRight: '12px',
                gap: '8px',
              }}
            >
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={handlePasswordBlur}
                placeholder="Please Enter"
                autoComplete="current-password"
                aria-describedby={fieldErrors.password ? 'password-error' : undefined}
                aria-invalid={!!fieldErrors.password}
                style={{
                  flex: 1,
                  border: 'none',
                  outline: 'none',
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '14px',
                  fontWeight: 400,
                  color: '#3b3b3b',
                  backgroundColor: 'transparent',
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                style={{
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <img
                  src="/assets/images/icon-eye.png"
                  alt=""
                  aria-hidden="true"
                  width={24}
                  height={24}
                  style={{ opacity: showPassword ? 1 : 0.5 }}
                />
              </button>
            </div>
            {fieldErrors.password && (
              <span
                id="password-error"
                role="alert"
                aria-live="polite"
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '12px',
                  color: '#dc2626',
                  marginTop: '4px',
                }}
              >
                {fieldErrors.password}
              </span>
            )}

            {/* Keep me logged in + Forgot Password row */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: '4px',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '8px' }}>
                <input
                  id="keep-logged-in"
                  type="checkbox"
                  checked={keepLoggedIn}
                  onChange={(e) => setKeepLoggedIn(e.target.checked)}
                  style={{
                    width: '16px',
                    height: '16px',
                    border: '1.5px solid #252525',
                    borderRadius: '2px',
                    appearance: 'none',
                    WebkitAppearance: 'none',
                    cursor: 'pointer',
                    backgroundColor: keepLoggedIn ? '#5b21b6' : '#ffffff',
                    backgroundImage: keepLoggedIn
                      ? `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' d='M3 8l3 3 7-7'/%3E%3C/svg%3E")`
                      : 'none',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'center',
                    backgroundSize: '12px',
                    flexShrink: 0,
                  }}
                />
                <label
                  htmlFor="keep-logged-in"
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontWeight: 400,
                    fontSize: '14px',
                    color: '#3b3b3b',
                    cursor: 'pointer',
                    userSelect: 'none',
                  }}
                >
                  Keep me logged In
                </label>
              </div>

              <Link
                to="/forgot-password"
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 400,
                  fontSize: '14px',
                  color: '#5b21b6',
                  textDecoration: 'underline',
                }}
              >
                Forgot Password?
              </Link>
            </div>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={isDisabled}
            aria-busy={isLoading}
            style={{
              width: '400px',
              height: '48px',
              backgroundColor: '#5b21b6',
              borderRadius: '8px',
              border: 'none',
              color: '#ffffff',
              fontFamily: "'Inter', sans-serif",
              fontWeight: 700,
              fontSize: '14px',
              lineHeight: '24px',
              cursor: isDisabled ? 'not-allowed' : 'pointer',
              opacity: isDisabled ? 0.6 : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'opacity 0.2s ease',
            }}
          >
            {isLoading ? (
              <>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  style={{
                    animation: 'spin 1s linear infinite',
                  }}
                >
                  <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
                  <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3" />
                  <path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="3" strokeLinecap="round" />
                </svg>
                Logging in...
              </>
            ) : (
              'Login'
            )}
          </button>

          {/* Sign Up Link */}
          <div
            style={{
              textAlign: 'center',
              width: '400px',
              fontFamily: "'Inter', sans-serif",
            }}
          >
            <span style={{ fontWeight: 400, fontSize: '16px', color: '#353638' }}>
              Don&apos;t have an account?{' '}
            </span>
            <Link
              to="/signup"
              style={{
                fontWeight: 600,
                fontSize: '16px',
                color: '#5b21b6',
                textDecoration: 'underline',
              }}
            >
              Sign up
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
