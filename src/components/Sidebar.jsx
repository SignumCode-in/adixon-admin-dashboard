import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { 
  BarChart3, 
  Users, 
  Hospital,
  UserCheck,
  CalendarDays,
  FileSpreadsheet,
  Pill,
  FlaskConical,
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
  Building
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { clinicAPI } from '../services/api';

export default function Sidebar({ isCollapsed, onToggleCollapse, isMobileOpen, onCloseMobile }) {
  const { user, logout, isAdmin, isDoctor, hasPermission } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [activeClinicName, setActiveClinicName] = useState('');

  // Check if current URL is under a specific clinic (e.g. /clinics/:clinicId/...)
  const clinicMatch = location.pathname.match(/^\/clinics\/([^\/]+)/);
  const activeClinicId = clinicMatch && clinicMatch[1] !== 'new' ? clinicMatch[1] : null;

  // Load clinic name if in sub-clinic view
  useEffect(() => {
    if (activeClinicId) {
      clinicAPI.getClinicById(activeClinicId).then(res => {
        const cData = res.data?.data || res.data;
        if (cData?.name) setActiveClinicName(cData.name);
      }).catch(() => setActiveClinicName('Clinic'));
    } else {
      setActiveClinicName('');
    }
  }, [activeClinicId]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  // 1. NESTED CLINIC DEDICATED SUB-SIDEBAR (When Admin is inside /clinics/:clinicId)
  if (isAdmin && activeClinicId) {
    const clinicNavItems = [
      { title: 'Clinic Overview', path: `/clinics/${activeClinicId}`, icon: <Hospital size={18} /> },
      { title: 'Patients', path: `/clinics/${activeClinicId}/patients`, icon: <UserCheck size={18} /> },
      { title: 'Appointments', path: `/clinics/${activeClinicId}/appointments`, icon: <CalendarDays size={18} /> },
      { title: 'Prescriptions', path: `/clinics/${activeClinicId}/prescriptions`, icon: <FileSpreadsheet size={18} /> },
      { title: 'Certificates', path: `/clinics/${activeClinicId}/certificates`, icon: <FileBadge size={18} /> },
      { title: 'Instructions', path: `/clinics/${activeClinicId}/instructions`, icon: <FileText size={18} /> },
      { title: 'Consents', path: `/clinics/${activeClinicId}/consents`, icon: <ClipboardCheck size={18} /> },
      { title: 'Templates', path: `/clinics/${activeClinicId}/templates`, icon: <Layout size={18} /> },
      { title: 'Settings', path: `/clinics/${activeClinicId}/settings`, icon: <Settings size={18} /> },
    ];

    return (
      <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''} ${isMobileOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header" style={{ padding: isCollapsed ? '16px 8px' : '14px 16px' }}>
          <img 
            src="/adixon-logo.png" 
            alt="Adixon Clinic OS" 
            style={{ height: isCollapsed ? '24px' : '30px', maxWidth: isCollapsed ? '34px' : '110px', objectFit: 'contain' }} 
          />
          {!isCollapsed && (
            <div className="sidebar-brand-wrapper">
              <span className="sidebar-brand">{activeClinicName || 'Clinic View'}</span>
              <span className="sidebar-subbrand">Dedicated Clinic Scope</span>
            </div>
          )}
          <button className="menu-toggle" onClick={onToggleCollapse}>
            {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {/* Back to All Clinics Button */}
        {!isCollapsed && (
          <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--color-border)' }}>
            <NavLink to="/clinics" className="btn btn-secondary" style={{ width: '100%', justifyContent: 'flex-start', gap: '6px', fontSize: '12px' }}>
              <ArrowLeft size={14} /> Back to All Clinics
            </NavLink>
          </div>
        )}

        <nav className="sidebar-nav">
          <div className="sidebar-section">
            {!isCollapsed && <div className="sidebar-section-title">Clinic Data & Options</div>}
            {clinicNavItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === `/clinics/${activeClinicId}`}
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
            <div className="sidebar-user-avatar" title={user.full_name}>
              {getInitials(user.full_name)}
            </div>
            {!isCollapsed && (
              <div className="sidebar-user-info" style={{ flex: 1, minWidth: 0 }}>
                <span className="sidebar-user-name">{user.full_name}</span>
                <span className="sidebar-user-role">Master Admin</span>
              </div>
            )}
            <button className="icon-btn" onClick={handleLogout} title="Logout" style={{ padding: '6px', color: 'var(--color-danger)' }}>
              <LogOut size={16} />
            </button>
          </div>
        )}
      </aside>
    );
  }

  // 2. TOP-LEVEL MAIN SIDEBAR (For Master Admin Top View, or Doctor/Staff View)
  const navSections = [
    ...(isAdmin ? [
      {
        title: 'Governance',
        items: [
          { title: 'Analytics', path: '/analytics', icon: <BarChart3 size={18} /> },
          { title: 'Security Audit', path: '/security', icon: <ShieldCheck size={18} /> },
          { title: 'Clinics Directory', path: '/clinics', icon: <Hospital size={18} /> },
          { title: 'Firewall & Sessions', path: '/access-control', icon: <Lock size={18} /> },
          { title: 'Settings', path: '/settings', icon: <Settings size={18} /> },
        ]
      }
    ] : [
      {
        title: 'Clinic Medical Data',
        items: [
          { title: 'Clinic Dashboard', path: '/dashboard', icon: <Layout size={18} /> },
          { title: 'Patients', path: '/patients', icon: <UserCheck size={18} />, permission: 'patients' },
          { title: 'Appointments', path: '/appointments', icon: <CalendarDays size={18} />, permission: 'appointments' },
          { title: 'Prescriptions', path: '/prescriptions', icon: <FileSpreadsheet size={18} />, permission: 'prescriptions' },
          { title: 'Certificates', path: '/certificates', icon: <FileBadge size={18} />, permission: 'certificates' },
          { title: 'Instructions', path: '/instructions', icon: <FileText size={18} />, permission: 'instructions' },
          { title: 'Consents', path: '/consents', icon: <ClipboardCheck size={18} />, permission: 'consents' },
          { title: 'Templates', path: '/templates', icon: <Layout size={18} />, permission: 'templates' },
          { title: 'Medicines', path: '/medicines', icon: <Pill size={18} />, permission: 'medicines' },
          { title: 'Users & Staff', path: '/users', icon: <Users size={18} /> },
          { title: 'Settings', path: '/settings', icon: <Settings size={18} /> },
        ]
      }
    ])
  ];

  // Filter sections for staff permissions
  const filteredSections = navSections.map(section => ({
    ...section,
    items: section.items.filter(item => {
      if (isAdmin || isDoctor) return true;
      if (!item.permission) return true;
      return hasPermission(item.permission);
    })
  })).filter(section => section.items.length > 0);

  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''} ${isMobileOpen ? 'mobile-open' : ''}`}>
      <div className="sidebar-header" style={{ padding: isCollapsed ? '16px 8px' : '16px 18px' }}>
        {!isCollapsed ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img src="/adixon-logo.png" alt="Adixon Clinic OS" style={{ height: '34px', maxWidth: '140px', objectFit: 'contain' }} />
          </div>
        ) : (
          <img src="/adixon-logo.png" alt="Adixon" style={{ height: '22px', maxWidth: '36px', objectFit: 'contain' }} />
        )}
        <button className="menu-toggle" onClick={onToggleCollapse}>
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      <nav className="sidebar-nav">
        {filteredSections.map((section) => (
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
          <div className="sidebar-user-avatar" title={user.full_name}>
            {getInitials(user.full_name)}
          </div>
          {!isCollapsed && (
            <div className="sidebar-user-info" style={{ flex: 1, minWidth: 0 }}>
              <span className="sidebar-user-name">{user.full_name}</span>
              <span className="sidebar-user-role">{user.role}</span>
            </div>
          )}
          <button className="icon-btn" onClick={handleLogout} title="Logout" style={{ padding: '6px', color: 'var(--color-danger)' }}>
            <LogOut size={16} />
          </button>
        </div>
      )}
    </aside>
  );
}
