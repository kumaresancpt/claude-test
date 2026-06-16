import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import ResetPassword from '../components/auth/ResetPassword';

vi.mock('../services/authService', () => ({
  authService: {
    resetPassword: vi.fn(),
  },
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

import { authService } from '../services/authService';

function renderWithState(state: object = {}) {
  return render(
    <MemoryRouter initialEntries={[{ pathname: '/reset-password', state }]}>
      <Routes>
        <Route path="/reset-password" element={<ResetPassword />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('ResetPassword', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders new password and confirm password fields', () => {
    renderWithState({ email: 'user@test.com', otp: '123456' });
    expect(document.getElementById('new-password')).toBeInTheDocument();
    expect(document.getElementById('confirm-password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /reset password/i })).toBeInTheDocument();
  });

  it('shows Reset Password heading', () => {
    renderWithState();
    expect(screen.getByRole('heading', { name: /reset password/i })).toBeInTheDocument();
  });

  it('submit button is disabled when password does not meet requirements', () => {
    renderWithState({ email: 'user@test.com', otp: '123456' });
    const btn = screen.getByRole('button', { name: /reset password/i });
    expect(btn).toBeDisabled();
  });

  it('submit button becomes enabled when password meets all requirements', async () => {
    renderWithState({ email: 'user@test.com', otp: '123456' });
    const newPwd = document.getElementById('new-password') as HTMLInputElement;
    const confirmPwd = document.getElementById('confirm-password') as HTMLInputElement;

    await userEvent.type(newPwd, 'Strong@Pass1');
    await userEvent.type(confirmPwd, 'Strong@Pass1');

    const btn = screen.getByRole('button', { name: /reset password/i });
    expect(btn).not.toBeDisabled();
  });

  it('shows confirm password error on blur when passwords do not match', async () => {
    renderWithState({ email: 'user@test.com', otp: '123456' });
    const newPwd = document.getElementById('new-password') as HTMLInputElement;
    const confirmPwd = document.getElementById('confirm-password') as HTMLInputElement;

    await userEvent.type(newPwd, 'Strong@Pass1');
    await userEvent.type(confirmPwd, 'Different@1');
    fireEvent.blur(confirmPwd);

    expect(await screen.findByText(/passwords do not match/i)).toBeInTheDocument();
  });

  it('shows password requirements checklist', () => {
    renderWithState({ email: 'user@test.com', otp: '123456' });
    expect(screen.getByText(/at least 8 characters/i)).toBeInTheDocument();
    expect(screen.getByText(/uppercase letter/i)).toBeInTheDocument();
    expect(screen.getByText(/lowercase letter/i)).toBeInTheDocument();
    expect(screen.getByText(/number/i)).toBeInTheDocument();
    expect(screen.getByText(/special character/i)).toBeInTheDocument();
  });

  it('calls resetPassword with correct payload on submit', async () => {
    vi.mocked(authService.resetPassword).mockResolvedValue(undefined as never);
    renderWithState({ email: 'user@test.com', otp: '123456' });

    await userEvent.type(document.getElementById('new-password')!, 'Strong@Pass1');
    await userEvent.type(document.getElementById('confirm-password')!, 'Strong@Pass1');
    fireEvent.submit(screen.getByRole('button', { name: /reset password/i }).closest('form')!);

    await waitFor(() => {
      expect(authService.resetPassword).toHaveBeenCalledWith({
        email: 'user@test.com',
        otp: '123456',
        newPassword: 'Strong@Pass1',
        confirmPassword: 'Strong@Pass1',
      });
    });
  });

  it('navigates to / on successful reset', async () => {
    vi.mocked(authService.resetPassword).mockResolvedValue(undefined as never);
    renderWithState({ email: 'user@test.com', otp: '123456' });

    await userEvent.type(document.getElementById('new-password')!, 'Strong@Pass1');
    await userEvent.type(document.getElementById('confirm-password')!, 'Strong@Pass1');
    fireEvent.submit(screen.getByRole('button', { name: /reset password/i }).closest('form')!);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/', expect.objectContaining({ replace: true }));
    });
  });

  it('shows API error message on failure', async () => {
    vi.mocked(authService.resetPassword).mockRejectedValue({ detail: 'Cannot reuse one of your last 5 passwords.' });
    renderWithState({ email: 'user@test.com', otp: '123456' });

    await userEvent.type(document.getElementById('new-password')!, 'Strong@Pass1');
    await userEvent.type(document.getElementById('confirm-password')!, 'Strong@Pass1');
    fireEvent.submit(screen.getByRole('button', { name: /reset password/i }).closest('form')!);

    expect(await screen.findByText(/cannot reuse one of your last 5 passwords/i)).toBeInTheDocument();
  });

  it('shows session expired error when email or otp is missing', async () => {
    renderWithState({});
    await userEvent.type(document.getElementById('new-password')!, 'Strong@Pass1');
    await userEvent.type(document.getElementById('confirm-password')!, 'Strong@Pass1');
    fireEvent.submit(screen.getByRole('button', { name: /reset password/i }).closest('form')!);

    expect(await screen.findByText(/session expired/i)).toBeInTheDocument();
  });
});
