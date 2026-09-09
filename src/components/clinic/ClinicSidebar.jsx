import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  Layout, 
  UserCheck, 
  CalendarDays, 
  FileSpreadsheet, 
  Pill, 
  FlaskConical, 
  FileBadge, 
  FileText, 
  ClipboardCheck, 
  Users, 
  Settings, 
  LogOut, 
  ChevronLeft, 
  ChevronRight,
  Stethoscope
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function ClinicSidebar({ isCollapsed, onToggleCollapse, isMobileOpen, onCloseMobile }) {
  const { user, logout, isDoctor, hasPermission } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getInitials = (name) => {
    if (!name) return 'D';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const clinicName = user?.clinic_id?.name || 'Clinic Portal';

  // Clinic Operations Navigation Items
  const clinicSections = [
    {
      title: 'Clinical Care',
      items: [
        { title: 'Dashboard', path: '/dashboard', icon: <Layout size={18} /> },
        { title: 'Patients & EHR', path: '/patients', icon: <UserCheck size={18} />, permission: 'patients' },
        { title: 'Appointments', path: '/appointments', icon: <CalendarDays size={18} />, permission: 'appointments' },
        { title: 'Prescriptions', path: '/prescriptions', icon: <FileSpreadsheet size={18} />, permission: 'prescriptions' },
      ]
    },
    {
      title: 'Medical Assets & Tests',
      items: [
        { title: 'Medicines & Stock', path: '/medicines', icon: <Pill size={18} />, permission: 'medicines' },
        { title: 'Labs & Diagnostics', path: '/labs', icon: <FlaskConical size={18} />, permission: 'labs' },
        { title: 'Medical Certificates', path: '/certificates', icon: <FileBadge size={18} />, permission: 'certificates' },
        { title: 'Patient Instructions', path: '/instructions', icon: <FileText size={18} />, permission: 'instructions' },
        { title: 'Consent Forms', path: '/consents', icon: <ClipboardCheck size={18} />, permission: 'consents' },
        { title: 'Templates', path: '/templates', icon: <Layout size={18} />, permission: 'templates' },
      ]
    },
    {
      title: 'Clinic Administration',
      items: [
        { title: 'Clinic Staff', path: '/users', icon: <Users size={18} />, doctorOnly: true },
        { title: 'Clinic Settings', path: '/settings', icon: <Settings size={18} /> },
      ]
    }
  ];

  // Filter sections by Doctor role or Staff permissions
  const filteredSections = clinicSections.map(section => ({
    ...section,
    items: section.items.filter(item => {
      if (isDoctor) return true;
      if (item.doctorOnly) return false;
      if (!item.permission) return true;
      return hasPermission(item.permission);
    })
  })).filter(section => section.items.length > 0);

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
          <div className="sidebar-logo" style={{ background: 'linear-gradient(135deg, #0d9488, #2563eb)' }}>
            <Stethoscope size={18} style={{ color: '#ffffff' }} />
          </div>
          {!isCollapsed && (
            <div className="sidebar-brand-wrapper">
              <span className="sidebar-brand" title={clinicName}>{clinicName}</span>
              <span className="sidebar-subbrand">Healthcare Operations</span>
            </div>
          )}
          <button className="menu-toggle" onClick={isMobileOpen ? onCloseMobile : onToggleCollapse}>
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
          <div className="sidebar-user-avatar" title={user.full_name} style={{ background: '#0d9488' }}>
            {getInitials(user.full_name)}
          </div>
          {!isCollapsed && (
            <div className="sidebar-user-info" style={{ flex: 1, minWidth: 0 }}>
              <span className="sidebar-user-name">{user.full_name}</span>
              <span className="sidebar-user-role">
                {isDoctor ? 'Primary Doctor' : 'Clinic Staff'}
              </span>
            </div>
          )}
          <button className="icon-btn" onClick={handleLogout} title="Logout" style={{ padding: '6px', color: 'var(--color-danger)' }}>
            <LogOut size={16} />
          </button>
        </div>
      )}
      </aside>
    </>
  );
}
