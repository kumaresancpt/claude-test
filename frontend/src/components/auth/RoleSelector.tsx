import React from 'react';
import type { Role } from '../../types/auth';

interface RoleSelectorProps {
  selectedRole: Role;
  onChange: (role: Role) => void;
}

interface TabConfig {
  role: Role;
  label: string;
}

const TABS: TabConfig[] = [
  { role: 'admin', label: 'Admin' },
  { role: 'receptionist', label: 'Receptionist' },
  { role: 'security_guard', label: 'Security Guard' },
];

const RoleSelector: React.FC<RoleSelectorProps> = ({ selectedRole, onChange }) => {
  return (
    <div
      role="tablist"
      aria-label="Select role"
      style={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '400px',
        backgroundColor: '#f3f3f3',
        borderRadius: '48px',
        padding: '4px',
      }}
    >
      {TABS.map(({ role, label }) => {
        const isActive = selectedRole === role;
        return (
          <button
            key={role}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(role)}
            style={{
              flex: 1,
              backgroundColor: isActive ? '#5b21b6' : 'transparent',
              color: isActive ? '#ffffff' : '#3c3c3c',
              borderRadius: '25px',
              paddingTop: '10px',
              paddingBottom: '10px',
              paddingLeft: '18px',
              paddingRight: '18px',
              border: 'none',
              cursor: 'pointer',
              fontFamily: "'Inter', sans-serif",
              fontSize: '16px',
              fontWeight: isActive ? 600 : 400,
              lineHeight: '1.25',
              whiteSpace: 'nowrap',
              transition: 'background-color 0.2s ease, color 0.2s ease',
              outline: 'none',
            }}
            onFocus={(e) => {
              e.currentTarget.style.boxShadow = '0 0 0 2px #5b21b6, 0 0 0 4px rgba(91,33,182,0.3)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
};

export default RoleSelector;
