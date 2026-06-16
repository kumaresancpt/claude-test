export type Role = 'admin' | 'receptionist' | 'security_guard';

export interface LoginRequest {
  username: string;
  password: string;
  role: Role;
}

export interface LoginResponse {
  token: string;
  role: Role;
  expiresAt: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface VerifyOtpRequest {
  email: string;
  otp: string;
}

export interface ResetPasswordRequest {
  email: string;
  otp: string;
  newPassword: string;
  confirmPassword: string;
}

export interface AuthError {
  detail: string;
  remaining_seconds?: number;
}
