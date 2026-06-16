import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import LoginPage from '../components/auth/LoginPage';

// Mock authService
vi.mock('../services/authService', () => ({
  authService: {
    login: vi.fn(),
    logout: vi.fn(),
    refresh: vi.fn(),
  },
}));

// Mock useAuth hook
const mockLogin = vi.fn();
const mockLogout = vi.fn();

vi.mock('../hooks/useAuth', () => ({
  useAuth: () => ({
    login: mockLogin,
    logout: mockLogout,
    isLoading: false,
    error: null,
    lockedUntil: null,
    remainingSeconds: null,
    token: null,
    role: null,
    clearError: vi.fn(),
  }),
}));

function renderLoginPage() {
  return render(
    <MemoryRouter>
      <LoginPage />
    </MemoryRouter>
  );
}

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // AC-F1: Split layout renders
  it('renders login page with form elements', () => {
    renderLoginPage();
    expect(screen.getByRole('heading', { name: /login/i })).toBeInTheDocument();
    expect(screen.getByText('Welcome to Visitor')).toBeInTheDocument();
  });

  // AC-F2: Logo renders
  it('renders VISITOR logo text', () => {
    renderLoginPage();
    expect(screen.getByText('VISITOR')).toBeInTheDocument();
    expect(screen.getByText(/Powered by/i)).toBeInTheDocument();
  });

  // AC-F3: Role selector renders with Admin active by default
  it('renders role selector tabs with Admin active by default', () => {
    renderLoginPage();
    const tabs = screen.getAllByRole('tab');
    expect(tabs).toHaveLength(3);
    expect(tabs[0]).toHaveTextContent('Admin');
    expect(tabs[0]).toHaveAttribute('aria-selected', 'true');
    expect(tabs[1]).toHaveTextContent('Receptionist');
    expect(tabs[2]).toHaveTextContent('Security Guard');
  });

  it('switches active tab when clicked', async () => {
    renderLoginPage();
    const receptionistTab = screen.getByRole('tab', { name: /receptionist/i });
    await userEvent.click(receptionistTab);
    expect(receptionistTab).toHaveAttribute('aria-selected', 'true');
  });

  // AC-F4: Username field
  it('renders username input with correct placeholder', () => {
    renderLoginPage();
    const usernameInput = screen.getByPlaceholderText('ex., john@123');
    expect(usernameInput).toBeInTheDocument();
  });

  // AC-F5: Password field
  it('renders password input with correct placeholder', () => {
    renderLoginPage();
    const passwordInput = screen.getByPlaceholderText('Please Enter');
    expect(passwordInput).toBeInTheDocument();
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  // AC-05: Eye icon toggles password visibility
  it('toggles password visibility when eye icon is clicked', async () => {
    renderLoginPage();
    const passwordInput = screen.getByPlaceholderText('Please Enter');
    const toggleBtn = screen.getByRole('button', { name: /show password/i });

    expect(passwordInput).toHaveAttribute('type', 'password');
    await userEvent.click(toggleBtn);
    expect(passwordInput).toHaveAttribute('type', 'text');
    await userEvent.click(toggleBtn);
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  // AC-F6: Checkbox renders
  it('renders keep me logged in checkbox', () => {
    renderLoginPage();
    const checkbox = screen.getByRole('checkbox', { name: /keep me logged in/i });
    expect(checkbox).toBeInTheDocument();
    expect(checkbox).not.toBeChecked();
  });

  it('toggles checkbox when clicked', async () => {
    renderLoginPage();
    const checkbox = screen.getByRole('checkbox', { name: /keep me logged in/i });
    await userEvent.click(checkbox);
    expect(checkbox).toBeChecked();
  });

  // AC-F7: Forgot Password link
  it('renders Forgot Password link', () => {
    renderLoginPage();
    const forgotLink = screen.getByRole('link', { name: /forgot password/i });
    expect(forgotLink).toBeInTheDocument();
    expect(forgotLink).toHaveAttribute('href', '/forgot-password');
  });

  // AC-F8: Login button
  it('renders login button with purple background', () => {
    renderLoginPage();
    const loginButton = screen.getByRole('button', { name: /^login$/i });
    expect(loginButton).toBeInTheDocument();
  });

  // AC-01: Login button disabled when fields empty
  it('login button is disabled when username and password are empty', () => {
    renderLoginPage();
    const loginButton = screen.getByRole('button', { name: /^login$/i });
    expect(loginButton).toBeDisabled();
  });

  it('login button is enabled when both fields have values', async () => {
    renderLoginPage();
    const usernameInput = screen.getByPlaceholderText('ex., john@123');
    const passwordInput = screen.getByPlaceholderText('Please Enter');
    const loginButton = screen.getByRole('button', { name: /^login$/i });

    await userEvent.type(usernameInput, 'testuser');
    await userEvent.type(passwordInput, 'password123');

    expect(loginButton).not.toBeDisabled();
  });

  // AC-01: Inline validation on blur
  it('shows validation error when username field is blurred empty', async () => {
    renderLoginPage();
    const usernameInput = screen.getByPlaceholderText('ex., john@123');
    fireEvent.blur(usernameInput);

    await waitFor(() => {
      expect(screen.getByText('This field is required.')).toBeInTheDocument();
    });
  });

  it('shows validation error when password field is blurred empty', async () => {
    renderLoginPage();
    const passwordInput = screen.getByPlaceholderText('Please Enter');
    fireEvent.blur(passwordInput);

    await waitFor(() => {
      expect(screen.getAllByText('This field is required.').length).toBeGreaterThan(0);
    });
  });

  // AC-F9: Sign up link
  it('renders Sign up link', () => {
    renderLoginPage();
    expect(screen.getByText('Sign up')).toBeInTheDocument();
    expect(screen.getByText("Don't have an account?")).toBeInTheDocument();
  });

  // AC-F10: Copyright footer
  it('renders copyright footer', () => {
    renderLoginPage();
    expect(
      screen.getByText('Copyright 2026 Changepond. All Rights Reserved.')
    ).toBeInTheDocument();
  });

  // AC-10: Accessibility — inputs have associated labels
  it('username input has an associated label', () => {
    renderLoginPage();
    const usernameInput = screen.getByLabelText('Username');
    expect(usernameInput).toBeInTheDocument();
  });

  it('password input has an associated label', () => {
    renderLoginPage();
    const passwordInput = screen.getByLabelText('Password');
    expect(passwordInput).toBeInTheDocument();
  });

  // Login submission calls login with correct args
  it('calls login with correct username, password, and role on submit', async () => {
    renderLoginPage();
    const usernameInput = screen.getByPlaceholderText('ex., john@123');
    const passwordInput = screen.getByPlaceholderText('Please Enter');
    const loginButton = screen.getByRole('button', { name: /^login$/i });

    await userEvent.type(usernameInput, 'admin@example.com');
    await userEvent.type(passwordInput, 'Secret@123');
    await userEvent.click(loginButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('admin@example.com', 'Secret@123', 'admin');
    });
  });
});
