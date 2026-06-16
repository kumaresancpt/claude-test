import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import LoginPage from '../components/auth/LoginPage';

// Mock useAuth hook
const mockLogin = vi.fn();
const mockUseAuth = {
  login: mockLogin,
  isLoading: false,
  error: null as string | null,
  lockedUntil: null as Date | null,
  remainingSeconds: null as number | null,
  token: null,
  role: null,
  logout: vi.fn(),
  clearError: vi.fn(),
};

vi.mock('../hooks/useAuth', () => ({
  useAuth: () => mockUseAuth,
  default: () => mockUseAuth,
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

const renderLoginPage = () =>
  render(
    <MemoryRouter>
      <LoginPage />
    </MemoryRouter>
  );

// Helper: get the password input by id (avoids conflict with 'Show password' aria-label)
const getPasswordInput = () => document.getElementById('password') as HTMLInputElement;

describe('LoginPage', () => {
  beforeEach(() => {
    mockLogin.mockReset();
    mockNavigate.mockReset();
    mockUseAuth.error = null;
    mockUseAuth.isLoading = false;
    mockUseAuth.lockedUntil = null;
    mockUseAuth.remainingSeconds = null;
  });

  test('renders login form with all key elements', () => {
    renderLoginPage();
    expect(screen.getByRole('heading', { name: /login/i })).toBeInTheDocument();
    expect(screen.getByLabelText('Username')).toBeInTheDocument();
    expect(document.getElementById('password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^login$/i })).toBeInTheDocument();
  });

  test('Admin tab is active by default', () => {
    renderLoginPage();
    const adminTab = screen.getByRole('tab', { name: /admin/i });
    expect(adminTab).toHaveAttribute('aria-selected', 'true');
  });

  test('Login button is disabled when fields are empty', () => {
    renderLoginPage();
    const loginButton = screen.getByRole('button', { name: /^login$/i });
    expect(loginButton).toBeDisabled();
  });

  test('Login button is enabled when both fields have values', async () => {
    renderLoginPage();
    const usernameInput = screen.getByLabelText('Username');
    const passwordInput = getPasswordInput();
    const loginButton = screen.getByRole('button', { name: /^login$/i });

    await userEvent.type(usernameInput, 'testuser');
    await userEvent.type(passwordInput, 'testpass');

    expect(loginButton).not.toBeDisabled();
  });

  test('password field type is password by default', () => {
    renderLoginPage();
    const passwordInput = getPasswordInput();
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  test('eye icon click toggles password visibility', async () => {
    renderLoginPage();
    const passwordInput = getPasswordInput();
    const toggleButton = screen.getByRole('button', { name: /show password/i });

    expect(passwordInput).toHaveAttribute('type', 'password');

    await userEvent.click(toggleButton);

    expect(passwordInput).toHaveAttribute('type', 'text');
    expect(screen.getByRole('button', { name: /hide password/i })).toBeInTheDocument();
  });

  test('shows error message on failed login (401)', () => {
    mockUseAuth.error = 'Invalid username or password.';
    renderLoginPage();
    expect(screen.getByRole('alert')).toHaveTextContent('Invalid username or password.');
  });

  test('shows lockout message on 423 response', () => {
    mockUseAuth.error = 'Account locked due to too many failed attempts. Try again in 5 minutes.';
    mockUseAuth.lockedUntil = new Date(Date.now() + 300000);
    mockUseAuth.remainingSeconds = 300;
    renderLoginPage();
    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent(/Account locked/i);
  });

  test('calls login with correct arguments on form submit', async () => {
    mockLogin.mockResolvedValue(undefined);
    renderLoginPage();

    const usernameInput = screen.getByLabelText('Username');
    const passwordInput = getPasswordInput();
    const loginButton = screen.getByRole('button', { name: /^login$/i });

    await userEvent.type(usernameInput, 'admin');
    await userEvent.type(passwordInput, 'password123');
    await userEvent.click(loginButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('admin', 'password123', 'admin');
    });
  });

  test('renders Forgot Password link', () => {
    renderLoginPage();
    expect(screen.getByRole('link', { name: /forgot password/i })).toBeInTheDocument();
  });

  test('role tabs container has tablist role', () => {
    renderLoginPage();
    expect(screen.getByRole('tablist')).toBeInTheDocument();
  });
});
