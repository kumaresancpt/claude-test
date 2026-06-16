import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import SessionWarning from '../components/auth/SessionWarning';

describe('SessionWarning', () => {
  const mockOnExtend = vi.fn();
  const mockOnLogout = vi.fn();

  const renderSessionWarning = (secondsRemaining = 120) =>
    render(
      <SessionWarning
        secondsRemaining={secondsRemaining}
        onExtend={mockOnExtend}
        onLogout={mockOnLogout}
      />
    );

  beforeEach(() => {
    mockOnExtend.mockReset();
    mockOnLogout.mockReset();
  });

  test('renders modal dialog', () => {
    renderSessionWarning();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  test('renders session warning title', () => {
    renderSessionWarning();
    expect(screen.getByRole('heading', { name: /session expiring soon/i })).toBeInTheDocument();
  });

  test('renders Extend Session button', () => {
    renderSessionWarning();
    expect(screen.getByRole('button', { name: /extend session/i })).toBeInTheDocument();
  });

  test('renders Logout Now button', () => {
    renderSessionWarning();
    expect(screen.getByRole('button', { name: /logout now/i })).toBeInTheDocument();
  });

  test('clicking Extend Session calls onExtend', async () => {
    renderSessionWarning();
    await userEvent.click(screen.getByRole('button', { name: /extend session/i }));
    expect(mockOnExtend).toHaveBeenCalledTimes(1);
  });

  test('clicking Logout Now calls onLogout', async () => {
    renderSessionWarning();
    await userEvent.click(screen.getByRole('button', { name: /logout now/i }));
    expect(mockOnLogout).toHaveBeenCalledTimes(1);
  });

  test('displays correct time for 120 seconds', () => {
    renderSessionWarning(120);
    // 120s = 2 minutes, displayed as 02:00
    expect(screen.getByText('02:00')).toBeInTheDocument();
  });

  test('displays correct time for 65 seconds', () => {
    renderSessionWarning(65);
    // 65s = 1 minute and 5 seconds, displayed as 01:05
    expect(screen.getByText('01:05')).toBeInTheDocument();
  });

  test('displays correct time for 30 seconds', () => {
    renderSessionWarning(30);
    // 30s, displayed as 00:30
    expect(screen.getByText('00:30')).toBeInTheDocument();
  });
});
