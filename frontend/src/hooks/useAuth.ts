import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import type { Role, LoginRequest, AuthError } from '../types/auth';

interface UseAuthReturn {
  token: string | null;
  role: Role | null;
  isLoading: boolean;
  error: string | null;
  lockedUntil: Date | null;
  remainingSeconds: number | null;
  login: (username: string, password: string, role: Role) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

function getRoleRoute(role: Role): string {
  switch (role) {
    case 'admin':
      return '/dashboard';
    case 'receptionist':
      return '/visitor-entry';
    case 'security_guard':
      return '/gate-entry';
    default:
      return '/dashboard';
  }
}

export function useAuth(): UseAuthReturn {
  const navigate = useNavigate();
  const [token, setToken] = useState<string | null>(
    () => localStorage.getItem('vms_token')
  );
  const [role, setRole] = useState<Role | null>(
    () => (localStorage.getItem('vms_role') as Role | null)
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lockedUntil, setLockedUntil] = useState<Date | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);

  const login = useCallback(
    async (username: string, password: string, selectedRole: Role) => {
      setIsLoading(true);
      setError(null);
      setLockedUntil(null);
      setRemainingSeconds(null);

      const payload: LoginRequest = { username, password, role: selectedRole };

      try {
        const response = await authService.login(payload);

        localStorage.setItem('vms_token', response.token);
        localStorage.setItem('vms_role', response.role);
        setToken(response.token);
        setRole(response.role);

        const route = getRoleRoute(response.role);
        navigate(route, { replace: true });
      } catch (err) {
        const authErr = err as AuthError & { status?: number };
        if (authErr.status === 423 && authErr.remaining_seconds != null) {
          const unlockTime = new Date(Date.now() + authErr.remaining_seconds * 1000);
          setLockedUntil(unlockTime);
          setRemainingSeconds(authErr.remaining_seconds);
          const minutes = Math.ceil(authErr.remaining_seconds / 60);
          setError(
            `Account locked due to too many failed attempts. Try again in ${minutes} minute${minutes !== 1 ? 's' : ''}.`
          );
        } else if (authErr.status === 401) {
          setError('Invalid username or password.');
        } else {
          setError(authErr.detail || 'Invalid username or password.');
        }
      } finally {
        setIsLoading(false);
      }
    },
    [navigate]
  );

  const logout = useCallback(async () => {
    await authService.logout();
    setToken(null);
    setRole(null);
    navigate('/', { replace: true });
  }, [navigate]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    token,
    role,
    isLoading,
    error,
    lockedUntil,
    remainingSeconds,
    login,
    logout,
    clearError,
  };
}

export default useAuth;
