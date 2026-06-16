import { useState, useEffect, useCallback, useRef } from 'react';

const WARNING_MINUTES = 25;
const LOGOUT_MINUTES = 30;
const WARNING_MS = WARNING_MINUTES * 60 * 1000;
const LOGOUT_MS = LOGOUT_MINUTES * 60 * 1000;

interface UseSessionTimerReturn {
  showWarning: boolean;
  secondsRemaining: number;
  extendSession: () => void;
  resetTimer: () => void;
}

export function useSessionTimer(
  isAuthenticated: boolean,
  onLogout: () => void,
  onExtend: () => Promise<void>
): UseSessionTimerReturn {
  const [showWarning, setShowWarning] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(
    (LOGOUT_MINUTES - WARNING_MINUTES) * 60
  );

  const lastActivityRef = useRef<number>(Date.now());
  const warningTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const logoutTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearAllTimers = useCallback(() => {
    if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
    if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);
  }, []);

  const startTimers = useCallback(() => {
    clearAllTimers();
    lastActivityRef.current = Date.now();
    setShowWarning(false);
    setSecondsRemaining((LOGOUT_MINUTES - WARNING_MINUTES) * 60);

    warningTimerRef.current = setTimeout(() => {
      setShowWarning(true);
      const warningSeconds = (LOGOUT_MINUTES - WARNING_MINUTES) * 60;
      setSecondsRemaining(warningSeconds);

      countdownRef.current = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            if (countdownRef.current) clearInterval(countdownRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }, WARNING_MS);

    logoutTimerRef.current = setTimeout(() => {
      clearAllTimers();
      setShowWarning(false);
      onLogout();
    }, LOGOUT_MS);
  }, [clearAllTimers, onLogout]);

  const resetTimer = useCallback(() => {
    if (isAuthenticated) {
      startTimers();
    }
  }, [isAuthenticated, startTimers]);

  const extendSession = useCallback(async () => {
    try {
      await onExtend();
    } catch {
      // Even if refresh fails, reset the local timer
    }
    resetTimer();
  }, [onExtend, resetTimer]);

  // Track user activity events
  useEffect(() => {
    if (!isAuthenticated) return;

    const handleActivity = () => {
      const now = Date.now();
      // Debounce: only reset if more than 30s since last reset
      if (now - lastActivityRef.current > 30_000) {
        resetTimer();
      }
    };

    const events = ['mousemove', 'keydown', 'mousedown', 'touchstart', 'scroll'];
    events.forEach((event) => window.addEventListener(event, handleActivity, { passive: true }));

    return () => {
      events.forEach((event) => window.removeEventListener(event, handleActivity));
    };
  }, [isAuthenticated, resetTimer]);

  // Start timers when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      startTimers();
    } else {
      clearAllTimers();
      setShowWarning(false);
    }

    return () => {
      clearAllTimers();
    };
  }, [isAuthenticated, startTimers, clearAllTimers]);

  return { showWarning, secondsRemaining, extendSession, resetTimer };
}

export default useSessionTimer;
