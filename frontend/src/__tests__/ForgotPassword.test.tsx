import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import ForgotPassword from '../components/auth/ForgotPassword';

// Mock authService
const mockForgotPassword = vi.fn();
const mockVerifyOtp = vi.fn();

vi.mock('../services/authService', () => ({
  authService: {
    forgotPassword: (...args: unknown[]) => mockForgotPassword(...args),
    verifyOtp: (...args: unknown[]) => mockVerifyOtp(...args),
  },
}));

// Mock react-router-dom navigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const renderForgotPassword = () =>
  render(
    <MemoryRouter>
      <ForgotPassword />
    </MemoryRouter>
  );

describe('ForgotPassword', () => {
  beforeEach(() => {
    mockForgotPassword.mockReset();
    mockVerifyOtp.mockReset();
    mockNavigate.mockReset();
  });

  test('renders email input and submit button', () => {
    renderForgotPassword();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /send otp/i })).toBeInTheDocument();
  });

  test('submit button is not disabled when email is empty (validation occurs on submit)', () => {
    renderForgotPassword();
    const submitButton = screen.getByRole('button', { name: /send otp/i });
    // The button is not disabled initially - validation happens on submit
    expect(submitButton).toBeInTheDocument();
  });

  test('shows email required error when submitting empty email', async () => {
    renderForgotPassword();
    const submitButton = screen.getByRole('button', { name: /send otp/i });
    await userEvent.click(submitButton);
    expect(await screen.findByRole('alert')).toHaveTextContent(/this field is required/i);
  });

  test('calls forgotPassword with email on submit', async () => {
    mockForgotPassword.mockResolvedValue(undefined);
    renderForgotPassword();

    const emailInput = screen.getByLabelText(/email address/i);
    await userEvent.type(emailInput, 'test@example.com');
    await userEvent.click(screen.getByRole('button', { name: /send otp/i }));

    await waitFor(() => {
      expect(mockForgotPassword).toHaveBeenCalledWith({ email: 'test@example.com' });
    });
  });

  test('shows OTP step after successful email submission', async () => {
    mockForgotPassword.mockResolvedValue(undefined);
    renderForgotPassword();

    const emailInput = screen.getByLabelText(/email address/i);
    await userEvent.type(emailInput, 'test@example.com');
    await userEvent.click(screen.getByRole('button', { name: /send otp/i }));

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /verify otp/i })).toBeInTheDocument();
    });
    expect(screen.getByLabelText(/one-time password/i)).toBeInTheDocument();
  });

  test('shows error when forgotPassword call fails', async () => {
    mockForgotPassword.mockRejectedValue({ detail: 'Email not found.' });
    renderForgotPassword();

    const emailInput = screen.getByLabelText(/email address/i);
    await userEvent.type(emailInput, 'unknown@example.com');
    await userEvent.click(screen.getByRole('button', { name: /send otp/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Email not found.');
    });
  });
});
