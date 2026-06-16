import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import RoleSelector from '../components/auth/RoleSelector';
import type { Role } from '../types/auth';

describe('RoleSelector', () => {
  const mockOnChange = vi.fn();

  const renderRoleSelector = (selectedRole: Role = 'admin') =>
    render(<RoleSelector selectedRole={selectedRole} onChange={mockOnChange} />);

  beforeEach(() => {
    mockOnChange.mockReset();
  });

  test('renders three role tabs', () => {
    renderRoleSelector();
    expect(screen.getByRole('tab', { name: /admin/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /receptionist/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /security guard/i })).toBeInTheDocument();
  });

  test('Admin is active by default', () => {
    renderRoleSelector('admin');
    const adminTab = screen.getByRole('tab', { name: /admin/i });
    expect(adminTab).toHaveAttribute('aria-selected', 'true');
  });

  test('clicking Receptionist makes it active', () => {
    renderRoleSelector('receptionist');
    const receptionistTab = screen.getByRole('tab', { name: /receptionist/i });
    expect(receptionistTab).toHaveAttribute('aria-selected', 'true');
    const adminTab = screen.getByRole('tab', { name: /admin/i });
    expect(adminTab).toHaveAttribute('aria-selected', 'false');
  });

  test('clicking Security Guard makes it active', () => {
    renderRoleSelector('security_guard');
    const securityTab = screen.getByRole('tab', { name: /security guard/i });
    expect(securityTab).toHaveAttribute('aria-selected', 'true');
  });

  test('calls onChange with correct role on click', async () => {
    renderRoleSelector('admin');
    const receptionistTab = screen.getByRole('tab', { name: /receptionist/i });
    await userEvent.click(receptionistTab);
    expect(mockOnChange).toHaveBeenCalledWith('receptionist');
  });

  test('calls onChange with security_guard when Security Guard is clicked', async () => {
    renderRoleSelector('admin');
    const securityTab = screen.getByRole('tab', { name: /security guard/i });
    await userEvent.click(securityTab);
    expect(mockOnChange).toHaveBeenCalledWith('security_guard');
  });
});
