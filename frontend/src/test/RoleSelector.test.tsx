import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RoleSelector from '../components/auth/RoleSelector';

describe('RoleSelector', () => {
  it('renders three role tabs', () => {
    render(<RoleSelector selectedRole="admin" onChange={vi.fn()} />);
    expect(screen.getByRole('tab', { name: 'Admin' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Receptionist' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Security Guard' })).toBeInTheDocument();
  });

  it('marks Admin tab as selected when selectedRole is admin', () => {
    render(<RoleSelector selectedRole="admin" onChange={vi.fn()} />);
    expect(screen.getByRole('tab', { name: 'Admin' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tab', { name: 'Receptionist' })).toHaveAttribute('aria-selected', 'false');
    expect(screen.getByRole('tab', { name: 'Security Guard' })).toHaveAttribute('aria-selected', 'false');
  });

  it('marks Receptionist tab as selected when selectedRole is receptionist', () => {
    render(<RoleSelector selectedRole="receptionist" onChange={vi.fn()} />);
    expect(screen.getByRole('tab', { name: 'Receptionist' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tab', { name: 'Admin' })).toHaveAttribute('aria-selected', 'false');
  });

  it('calls onChange with correct role when tab is clicked', async () => {
    const onChange = vi.fn();
    render(<RoleSelector selectedRole="admin" onChange={onChange} />);

    await userEvent.click(screen.getByRole('tab', { name: 'Receptionist' }));
    expect(onChange).toHaveBeenCalledWith('receptionist');

    await userEvent.click(screen.getByRole('tab', { name: 'Security Guard' }));
    expect(onChange).toHaveBeenCalledWith('security_guard');
  });

  it('has tablist role on container', () => {
    render(<RoleSelector selectedRole="admin" onChange={vi.fn()} />);
    expect(screen.getByRole('tablist')).toBeInTheDocument();
  });
});
