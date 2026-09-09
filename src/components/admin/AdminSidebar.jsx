import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { 
  BarChart3, 
  Hospital,
  UserCheck,
  CalendarDays,
  FileSpreadsheet,
  FileBadge,
  FileText,
  ClipboardCheck,
  Layout,
  Settings, 
  LogOut,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Lock,
  ArrowLeft,
  Users as UsersIcon,
  ShieldAlert
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { clinicAPI } from '../../services/api';

export default function AdminSidebar({ isCollapsed, onToggleCollapse, isMobileOpen, onCloseMobile }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [activeClinicName, setActiveClinicName] = useState('');

  // Check if current URL is inspecting a specific clinic (e.g. /admin/clinics/:clinicId/...)
  const clinicMatch = location.pathname.match(/^\/admin\/clinics\/([^\/]+)/);
  const activeClinicId = clinicMatch && clinicMatch[1] !== 'new' ? clinicMatch[1] : null;

  useEffect(() => {
    if (activeClinicId) {
      clinicAPI.getClinicById(activeClinicId)
        .then(res => {
          const cData = res.data?.data || res.data;
          if (cData?.name) setActiveClinicName(cData.name);
        })
        .catch(() => setActiveClinicName('Clinic'));
    } else {
      setActiveClinicName('');
    }
  }, [activeClinicId]);

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  const getInitials = (name) => {
    if (!name) return 'A';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  // 1. NESTED SUB-INSPECTOR FOR A SPECIFIC CLINIC
  if (activeClinicId) {
    const clinicNavItems = [
      { title: 'Clinic Overview', path: `/admin/clinics/${activeClinicId}`, icon: <Hospital size={18} /> },
      { title: 'Patients', path: `/admin/clinics/${activeClinicId}/patients`, icon: <UserCheck size={18} /> },
      { title: 'Appointments', path: `/admin/clinics/${activeClinicId}/appointments`, icon: <CalendarDays size={18} /> },
      { title: 'Prescriptions', path: `/admin/clinics/${activeClinicId}/prescriptions`, icon: <FileSpreadsheet size={18} /> },
      { title: 'Certificates', path: `/admin/clinics/${activeClinicId}/certificates`, icon: <FileBadge size={18} /> },
      { title: 'Instructions', path: `/admin/clinics/${activeClinicId}/instructions`, icon: <FileText size={18} /> },
      { title: 'Consents', path: `/admin/clinics/${activeClinicId}/consents`, icon: <ClipboardCheck size={18} /> },
      { title: 'Templates', path: `/admin/clinics/${activeClinicId}/templates`, icon: <Layout size={18} /> },
      { title: 'Settings', path: `/admin/clinics/${activeClinicId}/settings`, icon: <Settings size={18} /> },
    ];

    return (
      <>
        {isMobileOpen && (
          <div
            className="sidebar-backdrop"
            onClick={onCloseMobile}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              zIndex: 99,
              backdropFilter: 'blur(2px)',
            }}
          />
        )}
        <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''} ${isMobileOpen ? 'mobile-open' : ''}`} style={{ zIndex: 100 }}>
          <div className="sidebar-header">
            <div className="sidebar-logo" style={{ background: 'linear-gradient(135deg, #4f46e5, #06b6d4)' }}>AD</div>
            {!isCollapsed && (
              <div className="sidebar-brand-wrapper">
                <span className="sidebar-brand">{activeClinicName || 'Clinic Scope'}</span>
                <span className="sidebar-subbrand">Tenant Oversight</span>
              </div>
            )}
            <button className="menu-toggle" onClick={isMobileOpen ? onCloseMobile : onToggleCollapse}>
              {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </button>
          </div>

        {/* Back to Master Clinics Directory */}
        {!isCollapsed && (
          <div style={{ padding: '10px 12px', borderBottom: '1px solid var(--color-border)' }}>
            <NavLink to="/admin/clinics" className="btn btn-secondary" style={{ width: '100%', justifyContent: 'flex-start', gap: '8px', fontSize: '12px' }}>
              <ArrowLeft size={14} /> Back to Clinics
            </NavLink>
          </div>
        )}

        <nav className="sidebar-nav">
          <div className="sidebar-section">
            {!isCollapsed && <div className="sidebar-section-title">Clinic Modules</div>}
            {clinicNavItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === `/admin/clinics/${activeClinicId}`}
                className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
                onClick={onCloseMobile}
                title={isCollapsed ? item.title : ''}
              >
                <span className="sidebar-nav-icon">{item.icon}</span>
                {!isCollapsed && <span>{item.title}</span>}
              </NavLink>
            ))}
          </div>
        </nav>

        {user && (
          <div className="sidebar-footer">
            <div className="sidebar-user-avatar" title={user.full_name} style={{ background: '#4f46e5' }}>
              {getInitials(user.full_name)}
            </div>
            {!isCollapsed && (
              <div className="sidebar-user-info" style={{ flex: 1, minWidth: 0 }}>
                <span className="sidebar-user-name">{user.full_name}</span>
                <span className="sidebar-user-role">Master Admin</span>
              </div>
            )}
            <button className="icon-btn" onClick={handleLogout} title="Logout Admin" style={{ padding: '6px', color: 'var(--color-danger)' }}>
              <LogOut size={16} />
            </button>
          </div>
        )}
      </aside>
    </>
    );
  }

  // 2. TOP-LEVEL MASTER ADMIN NAVIGATION
  const adminNavSections = [
    {
      title: 'Platform Governance',
      items: [
        { title: 'Platform Analytics', path: '/admin/dashboard', icon: <BarChart3 size={18} /> },
        { title: 'Clinic Dashboard', path: '/admin/clinic-dashboard', icon: <Layout size={18} /> },
        { title: 'Clinics Directory', path: '/admin/clinics', icon: <Hospital size={18} /> },
        { title: 'Global Users & Doctors', path: '/admin/users', icon: <UsersIcon size={18} /> },
      ]
    },
    {
      title: 'Security & Access',
      items: [
        { title: 'Security Dashboard', path: '/admin/security', icon: <ShieldAlert size={18} /> },
        { title: 'Access Control', path: '/admin/access-control', icon: <Lock size={18} /> },
        { title: 'System Audit Logs', path: '/admin/audit-logs', icon: <ShieldCheck size={18} /> },
      ]
    },
    {
      title: 'Configuration',
      items: [
        { title: 'Platform Settings', path: '/admin/settings', icon: <Settings size={18} /> },
      ]
    }
  ];

  return (
    <>
      {isMobileOpen && (
        <div
          className="sidebar-backdrop"
          onClick={onCloseMobile}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 99,
            backdropFilter: 'blur(2px)',
          }}
        />
      )}
      <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''} ${isMobileOpen ? 'mobile-open' : ''}`} style={{ zIndex: 100 }}>
        <div className="sidebar-header">
          <div className="sidebar-logo" style={{ background: 'linear-gradient(135deg, #4f46e5, #06b6d4)' }}>AD</div>
          {!isCollapsed && (
            <div className="sidebar-brand-wrapper">
              <span className="sidebar-brand">Adixon Admin</span>
              <span className="sidebar-subbrand">Master Command Center</span>
            </div>
          )}
          <button className="menu-toggle" onClick={isMobileOpen ? onCloseMobile : onToggleCollapse}>
            {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

      <nav className="sidebar-nav">
        {adminNavSections.map((section) => (
          <div key={section.title} className="sidebar-section">
            {!isCollapsed && <div className="sidebar-section-title">{section.title}</div>}
            {section.items.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
                onClick={onCloseMobile}
                title={isCollapsed ? item.title : ''}
              >
                <span className="sidebar-nav-icon">{item.icon}</span>
                {!isCollapsed && <span>{item.title}</span>}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {user && (
        <div className="sidebar-footer">
          <div className="sidebar-user-avatar" title={user.full_name} style={{ background: '#4f46e5' }}>
            {getInitials(user.full_name)}
          </div>
          {!isCollapsed && (
            <div className="sidebar-user-info" style={{ flex: 1, minWidth: 0 }}>
              <span className="sidebar-user-name">{user.full_name}</span>
              <span className="sidebar-user-role">Master Admin</span>
            </div>
          )}
          <button className="icon-btn" onClick={handleLogout} title="Logout Master Admin" style={{ padding: '6px', color: 'var(--color-danger)' }}>
            <LogOut size={16} />
          </button>
        </div>
      )}
      </aside>
    </>
  );
}
