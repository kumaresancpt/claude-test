import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../../services/authService';
import type { AuthError } from '../../types/auth';

interface LocationState {
  email?: string;
  otp?: string;
}

interface PasswordStrength {
  minLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
  hasSpecial: boolean;
}

function checkPasswordStrength(password: string): PasswordStrength {
  return {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecial: /[^A-Za-z0-9]/.test(password),
  };
}

function isPasswordStrong(strength: PasswordStrength): boolean {
  return Object.values(strength).every(Boolean);
}

const StrengthRule: React.FC<{ met: boolean; label: string }> = ({ met, label }) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontFamily: "'Inter', sans-serif",
      fontSize: '12px',
      color: met ? '#16a34a' : '#6b7280',
    }}
  >
    <span
      style={{
        width: '16px',
        height: '16px',
        borderRadius: '50%',
        backgroundColor: met ? '#16a34a' : '#d1d5db',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      {met && (
        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
          <path
            d="M1 4l2.5 2.5L9 1"
            stroke="white"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </span>
    {label}
  </div>
);

const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState | null;

  const email = state?.email ?? '';
  const otp = state?.otp ?? '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);

  const strength = checkPasswordStrength(newPassword);
  const passwordStrong = isPasswordStrong(strength);

  const handleConfirmBlur = () => {
    if (confirmPassword && newPassword !== confirmPassword) {
      setConfirmError('Passwords do not match.');
    } else {
      setConfirmError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setConfirmError(null);

    if (!newPassword.trim()) {
      setError('New password is required.');
      return;
    }
    if (!passwordStrong) {
      setError('Password does not meet the requirements.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setConfirmError('Passwords do not match.');
      return;
    }

    if (!email || !otp) {
      setError('Session expired. Please start the password reset process again.');
      return;
    }

    setIsLoading(true);
    try {
      await authService.resetPassword({ email, otp, newPassword, confirmPassword });
      navigate('/', {
        replace: true,
        state: { successToast: 'Password reset successfully! Please log in with your new password.' },
      });
    } catch (err) {
      const authErr = err as AuthError;
      setError(authErr.detail || 'Failed to reset password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const inputContainerStyle = (hasError: boolean): React.CSSProperties => ({
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    border: `1px solid ${hasError ? '#dc2626' : '#b9b9b9'}`,
    borderRadius: '8px',
    height: '48px',
    paddingLeft: '12px',
    paddingRight: '12px',
    gap: '8px',
  });

  const inputStyle: React.CSSProperties = {
    flex: 1,
    border: 'none',
    outline: 'none',
    fontFamily: "'Inter', sans-serif",
    fontSize: '14px',
    color: '#3b3b3b',
    backgroundColor: 'transparent',
  };

  const labelStyle: React.CSSProperties = {
    fontFamily: "'Inter', sans-serif",
    fontWeight: 500,
    fontSize: '14px',
    color: '#3b3b3b',
    display: 'block',
    marginBottom: '8px',
  };

  const eyeButtonStyle: React.CSSProperties = {
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    padding: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
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
        {/* Header */}
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
            Reset Password
          </h1>
          <p
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '16px',
              color: '#474a5f',
            }}
          >
            Create a strong new password for your account.
          </p>
        </div>

        {/* Error Message */}
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

        <form onSubmit={handleSubmit} noValidate>
          {/* New Password Field */}
          <div style={{ marginBottom: '16px' }}>
            <label htmlFor="new-password" style={labelStyle}>
              New Password
            </label>
            <div style={inputContainerStyle(false)}>
              <input
                id="new-password"
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                autoComplete="new-password"
                aria-describedby="password-requirements"
                style={inputStyle}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword((p) => !p)}
                aria-label={showNewPassword ? 'Hide new password' : 'Show new password'}
                style={eyeButtonStyle}
              >
                <img
                  src="/assets/images/icon-eye.png"
                  alt=""
                  aria-hidden="true"
                  width={24}
                  height={24}
                  style={{ opacity: showNewPassword ? 1 : 0.5 }}
                />
              </button>
            </div>
          </div>

          {/* Password Strength Rules */}
          <div
            id="password-requirements"
            style={{
              backgroundColor: '#f9fafb',
              borderRadius: '8px',
              padding: '12px 16px',
              marginBottom: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
            }}
            aria-label="Password requirements"
          >
            <p
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '12px',
                fontWeight: 500,
                color: '#374151',
                marginBottom: '4px',
              }}
            >
              Password must contain:
            </p>
            <StrengthRule met={strength.minLength} label="At least 8 characters" />
            <StrengthRule met={strength.hasUppercase} label="At least one uppercase letter (A-Z)" />
            <StrengthRule met={strength.hasLowercase} label="At least one lowercase letter (a-z)" />
            <StrengthRule met={strength.hasNumber} label="At least one number (0-9)" />
            <StrengthRule met={strength.hasSpecial} label="At least one special character (!@#$%...)" />
          </div>

          {/* Confirm Password Field */}
          <div style={{ marginBottom: '24px' }}>
            <label htmlFor="confirm-password" style={labelStyle}>
              Confirm Password
            </label>
            <div style={inputContainerStyle(!!confirmError)}>
              <input
                id="confirm-password"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (confirmError && e.target.value === newPassword) {
                    setConfirmError(null);
                  }
                }}
                onBlur={handleConfirmBlur}
                placeholder="Confirm new password"
                autoComplete="new-password"
                aria-describedby={confirmError ? 'confirm-password-error' : undefined}
                aria-invalid={!!confirmError}
                style={inputStyle}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((p) => !p)}
                aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                style={eyeButtonStyle}
              >
                <img
                  src="/assets/images/icon-eye.png"
                  alt=""
                  aria-hidden="true"
                  width={24}
                  height={24}
                  style={{ opacity: showConfirmPassword ? 1 : 0.5 }}
                />
              </button>
            </div>
            {confirmError && (
              <span
                id="confirm-password-error"
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
                {confirmError}
              </span>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || !passwordStrong || !!confirmError}
            style={{
              width: '100%',
              height: '48px',
              backgroundColor: '#5b21b6',
              borderRadius: '8px',
              border: 'none',
              color: '#ffffff',
              fontFamily: "'Inter', sans-serif",
              fontWeight: 700,
              fontSize: '14px',
              cursor: isLoading || !passwordStrong || !!confirmError ? 'not-allowed' : 'pointer',
              opacity: isLoading || !passwordStrong || !!confirmError ? 0.6 : 1,
            }}
          >
            {isLoading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
