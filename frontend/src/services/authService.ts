import axios, { AxiosError } from 'axios';
import type {
  LoginRequest,
  LoginResponse,
  ForgotPasswordRequest,
  VerifyOtpRequest,
  ResetPasswordRequest,
  AuthError,
} from '../types/auth';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Attach auth token to every request if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('vms_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// On 401 responses (outside of the login endpoint), clear storage and redirect to /
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (
      error.response?.status === 401 &&
      !error.config?.url?.includes('/auth/login')
    ) {
      localStorage.removeItem('vms_token');
      localStorage.removeItem('vms_role');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

function extractDetail(error: unknown): AuthError {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<AuthError>;
    if (axiosError.response?.data?.detail) {
      return {
        detail: axiosError.response.data.detail,
        remaining_seconds: axiosError.response.data.remaining_seconds,
      };
    }
  }
  return { detail: 'An unexpected error occurred. Please try again.' };
}

export const authService = {
  async login(payload: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await api.post<LoginResponse>('/auth/login', payload);
      return response.data;
    } catch (error) {
      const err = extractDetail(error);
      const axiosErr = error as AxiosError<AuthError>;
      const status = axiosErr.response?.status;
      const thrownError: AuthError & { status?: number } = {
        ...err,
        status,
      };
      throw thrownError;
    }
  },

  async forgotPassword(payload: ForgotPasswordRequest): Promise<void> {
    try {
      await api.post('/auth/forgot-password', payload);
    } catch (error) {
      throw extractDetail(error);
    }
  },

  async verifyOtp(payload: VerifyOtpRequest): Promise<{ resetToken: string }> {
    try {
      const response = await api.post<{ detail: string; resetToken: string }>('/auth/verify-otp', payload);
      return { resetToken: response.data.resetToken };
    } catch (error) {
      throw extractDetail(error);
    }
  },

  async resetPassword(payload: ResetPasswordRequest): Promise<void> {
    try {
      await api.post('/auth/reset-password', payload);
    } catch (error) {
      throw extractDetail(error);
    }
  },

  async refresh(): Promise<void> {
    try {
      const response = await api.post<{ token: string; expiresAt: string }>('/auth/refresh');
      if (response.data.token) {
        localStorage.setItem('vms_token', response.data.token);
      }
    } catch (error) {
      throw extractDetail(error);
    }
  },

  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } catch {
      // Silently fail on logout errors
    } finally {
      localStorage.removeItem('vms_token');
      localStorage.removeItem('vms_role');
    }
  },
};

export default authService;
