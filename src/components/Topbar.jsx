import React, { useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { Menu, Search, Bell, Sun, Moon, Settings, LogOut, ChevronDown, Hospital, ShieldCheck, Stethoscope, UserCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useClinic } from '../context/ClinicContext';

export default function Topbar({ onToggleSidebar, onToggleNotifications, onOpenSearch, unreadCount }) {
  const { user, theme, toggleTheme, logout, isAdmin } = useAuth();
  const { selectedClinicId, setSelectedClinicId, clinics } = useClinic();
  const location = useLocation();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const pathnames = location.pathname.split('/').filter((x) => x);
  const breadcrumbItems = [
    { title: 'Dashboard', path: '/' },
    ...pathnames.map((name, index) => {
      const path = `/${pathnames.slice(0, index + 1).join('/')}`;
      const title = name.charAt(0).toUpperCase() + name.slice(1).replace('-', ' ');
      return { title, path };
    }),
  ];

  const getRoleBadge = () => {
    if (!user) return null;
    if (user.role === 'admin') {
      return (
        <span className="badge-pill badge-admin" title="Master Admin (Full System Access)">
          <ShieldCheck size={12} />
          Master Admin
        </span>
      );
    }
    if (user.role === 'doctor') {
      return (
        <span className="badge-pill badge-doctor" title="Primary Doctor (Clinic Full Access)">
          <Stethoscope size={12} />
          Primary Doctor
        </span>
      );
    }
    return (
      <span className="badge-pill badge-staff" title="Clinic Staff (Permission-based Access)">
        <UserCheck size={12} />
        Staff
      </span>
    );
  };

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button className="menu-toggle" onClick={onToggleSidebar} title="Toggle Sidebar">
          <Menu size={20} />
        </button>

        <div className="breadcrumbs">
          {breadcrumbItems.map((item, index) => {
            const isLast = index === breadcrumbItems.length - 1;
            return (
              <React.Fragment key={item.path}>
                {index > 0 && <span className="breadcrumbs-separator">/</span>}
                {isLast ? (
                  <span style={{ fontWeight: '600', color: 'var(--color-text-primary)' }}>
                    {item.title}
                  </span>
                ) : (
                  <Link to={item.path} style={{ textDecoration: 'none', color: 'var(--color-text-secondary)' }}>
                    {item.title}
                  </Link>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      <div className="topbar-right">
        {/* Master Admin Clinic Switcher */}
        {isAdmin ? (
          <div className="clinic-switcher-wrapper">
            <Hospital size={16} className="clinic-switcher-icon" />
            <select
              className="clinic-switcher-select"
              value={selectedClinicId}
              onChange={(e) => setSelectedClinicId(e.target.value)}
              title="Switch Active Clinic Scope"
            >
              <option value="all">🌐 All System Clinics (Global)</option>
              {clinics.map((c) => (
                <option key={c._id} value={c._id}>
                  🏥 {c.name}
                </option>
              ))}
            </select>
          </div>
        ) : (
          user?.clinic_id?.name && (
            <div className="active-clinic-pill" title="Assigned Clinic Scope">
              <Hospital size={14} />
              <span>{user.clinic_id.name}</span>
            </div>
          )
        )}

        {/* Role Badge */}
        {getRoleBadge()}

        {/* Search trigger */}
        <button className="search-trigger" onClick={onOpenSearch}>
          <Search size={15} />
          <span>Search</span>
          <kbd>Ctrl+K</kbd>
        </button>

        {/* Theme Toggle */}
        <button className="icon-btn" onClick={toggleTheme} title="Toggle Light/Dark Mode">
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>

        {/* Notifications Bell */}
        <button className="icon-btn" onClick={onToggleNotifications} title="Notifications">
          <Bell size={18} />
          {unreadCount > 0 && <span className="badge-dot" />}
        </button>

        {/* User Profile Dropdown */}
        {user && (
          <div className="user-profile-dropdown" onClick={() => setDropdownOpen(!dropdownOpen)}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
              <div className="sidebar-user-avatar" style={{ width: '34px', height: '34px', fontSize: '13px' }}>
                {user.full_name ? user.full_name[0].toUpperCase() : 'U'}
              </div>
              <ChevronDown size={14} style={{ color: 'var(--color-text-tertiary)' }} />
            </div>

            {dropdownOpen && (
              <div className="dropdown-menu" onMouseLeave={() => setDropdownOpen(false)}>
                <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--color-border)' }}>
                  <div style={{ fontWeight: '600', color: 'var(--color-text-primary)' }}>{user.full_name}</div>
                  <div style={{ color: 'var(--color-text-tertiary)', fontSize: '11px' }}>{user.email}</div>
                </div>
                <Link to="/settings" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                  <Settings size={14} />
                  Account Settings
                </Link>
                <div className="dropdown-divider" />
                <div className="dropdown-item" onClick={handleLogout} style={{ color: 'var(--color-danger)' }}>
                  <LogOut size={14} />
                  Logout System
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
