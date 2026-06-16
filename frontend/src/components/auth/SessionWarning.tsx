import React from 'react';

interface SessionWarningProps {
  secondsRemaining: number;
  onExtend: () => void;
  onLogout: () => void;
}

const SessionWarning: React.FC<SessionWarningProps> = ({
  secondsRemaining,
  onExtend,
  onLogout,
}) => {
  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const timeDisplay =
    minutes > 0
      ? `${minutes} minute${minutes !== 1 ? 's' : ''} and ${seconds} second${seconds !== 1 ? 's' : ''}`
      : `${seconds} second${seconds !== 1 ? 's' : ''}`;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="session-warning-title"
      aria-describedby="session-warning-desc"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
      }}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '40px',
          maxWidth: '440px',
          width: '100%',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.2)',
          textAlign: 'center',
        }}
      >
        {/* Warning Icon */}
        <div
          style={{
            width: '64px',
            height: '64px',
            backgroundColor: '#fef3c7',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
          }}
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
              stroke="#d97706"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <h2
          id="session-warning-title"
          style={{
            fontFamily: "'Inter', sans-serif",
            fontWeight: 600,
            fontSize: '20px',
            color: '#111827',
            marginBottom: '12px',
          }}
        >
          Session Expiring Soon
        </h2>

        <p
          id="session-warning-desc"
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: '16px',
            color: '#6b7280',
            lineHeight: '1.6',
            marginBottom: '8px',
          }}
        >
          Your session will expire in{' '}
          <strong style={{ color: '#dc2626' }}>{timeDisplay}</strong>.
        </p>
        <p
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: '16px',
            color: '#6b7280',
            marginBottom: '32px',
          }}
        >
          Click &ldquo;Extend Session&rdquo; to continue working.
        </p>

        {/* Countdown display */}
        <div
          aria-live="polite"
          aria-atomic="true"
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: '40px',
            fontWeight: 700,
            color: secondsRemaining <= 60 ? '#dc2626' : '#5b21b6',
            marginBottom: '32px',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button
            onClick={onExtend}
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
              cursor: 'pointer',
            }}
          >
            Extend Session
          </button>
          <button
            onClick={onLogout}
            style={{
              width: '100%',
              height: '48px',
              backgroundColor: 'transparent',
              borderRadius: '8px',
              border: '1px solid #d1d5db',
              color: '#374151',
              fontFamily: "'Inter', sans-serif",
              fontWeight: 500,
              fontSize: '14px',
              cursor: 'pointer',
            }}
          >
            Logout Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default SessionWarning;
