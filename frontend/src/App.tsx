import React, { useEffect, useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import LoginPage from './components/auth/LoginPage';
import ForgotPassword from './components/auth/ForgotPassword';
import ResetPassword from './components/auth/ResetPassword';
import SessionWarning from './components/auth/SessionWarning';
import { useSessionTimer } from './hooks/useSessionTimer';
import { authService } from './services/authService';

// Placeholder pages for authenticated routes
const DashboardPage: React.FC = () => (
  <div
    style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'Inter', sans-serif",
      fontSize: '24px',
      color: '#5b21b6',
    }}
  >
    Admin Dashboard — Coming Soon
  </div>
);

const VisitorEntryPage: React.FC = () => (
  <div
    style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'Inter', sans-serif",
      fontSize: '24px',
      color: '#5b21b6',
    }}
  >
    Visitor Entry — Coming Soon
  </div>
);

const GateEntryPage: React.FC = () => (
  <div
    style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'Inter', sans-serif",
      fontSize: '24px',
      color: '#5b21b6',
    }}
  >
    Gate Entry — Coming Soon
  </div>
);

// Toast notification component
interface ToastProps {
  message: string;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: 'fixed',
        top: '24px',
        right: '24px',
        backgroundColor: '#16a34a',
        color: '#ffffff',
        borderRadius: '8px',
        padding: '14px 20px',
        fontFamily: "'Inter', sans-serif",
        fontSize: '14px',
        fontWeight: 500,
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        zIndex: 10000,
        maxWidth: '400px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
      }}
    >
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path
          d="M10 0C4.48 0 0 4.48 0 10s4.48 10 10 10 10-4.48 10-10S15.52 0 10 0zm-2 14.5l-4-4 1.41-1.41L8 11.67l6.59-6.59L16 6.5l-8 8z"
          fill="white"
        />
      </svg>
      {message}
      <button
        onClick={onClose}
        aria-label="Close notification"
        style={{
          background: 'none',
          border: 'none',
          color: 'white',
          cursor: 'pointer',
          padding: 0,
          marginLeft: 'auto',
        }}
      >
        &times;
      </button>
    </div>
  );
};

const App: React.FC = () => {
  const location = useLocation();
  const [toast, setToast] = useState<string | null>(null);

  // Check if user is authenticated
  const isAuthenticated = !!localStorage.getItem('vms_token');

  const handleLogout = async () => {
    await authService.logout();
    window.location.href = '/';
  };

  const handleExtend = async () => {
    await authService.refresh();
  };

  const { showWarning, secondsRemaining, extendSession } = useSessionTimer(
    isAuthenticated,
    handleLogout,
    handleExtend
  );

  // Show success toast after password reset
  useEffect(() => {
    const state = location.state as { successToast?: string } | null;
    if (state?.successToast) {
      setToast(state.successToast);
      // Clear state to avoid re-showing
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  return (
    <>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/visitor-entry" element={<VisitorEntryPage />} />
        <Route path="/gate-entry" element={<GateEntryPage />} />
        <Route
          path="*"
          element={
            <div
              style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: "'Inter', sans-serif",
                fontSize: '18px',
                color: '#6b7280',
              }}
            >
              404 — Page not found
            </div>
          }
        />
      </Routes>

      {/* Session Warning Modal */}
      {showWarning && isAuthenticated && (
        <SessionWarning
          secondsRemaining={secondsRemaining}
          onExtend={extendSession}
          onLogout={handleLogout}
        />
      )}

      {/* Toast Notification */}
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </>
  );
};

export default App;
