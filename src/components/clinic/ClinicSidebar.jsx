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
        { title: 'Dashboard', path: '/dashboard', icon: <Layout size={18} />, moduleKey: 'dashboard' },
        { title: 'Patients & EHR', path: '/patients', icon: <UserCheck size={18} />, permission: 'patients', moduleKey: 'patients' },
        { title: 'Appointments', path: '/appointments', icon: <CalendarDays size={18} />, permission: 'appointments', moduleKey: 'appointments' },
        { title: 'Prescriptions', path: '/prescriptions', icon: <FileSpreadsheet size={18} />, permission: 'prescriptions', moduleKey: 'prescriptions' },
      ]
    },
    {
      title: 'Medical Assets & Tests',
      items: [
        { title: 'Medicines & Stock', path: '/medicines', icon: <Pill size={18} />, permission: 'medicines', moduleKey: 'medicines' },
        { title: 'Medical Certificates', path: '/certificates', icon: <FileBadge size={18} />, permission: 'certificates', moduleKey: 'certificates' },
        { title: 'Patient Instructions', path: '/instructions', icon: <FileText size={18} />, permission: 'instructions', moduleKey: 'instructions' },
        { title: 'Consent Forms', path: '/consents', icon: <ClipboardCheck size={18} />, permission: 'consents', moduleKey: 'consents' },
        { title: 'Templates', path: '/templates', icon: <Layout size={18} />, permission: 'templates', moduleKey: 'templates' },
      ]
    },
    {
      title: 'Clinic Administration',
      items: [
        { title: 'Clinic Staff', path: '/users', icon: <Users size={18} />, doctorOnly: true, moduleKey: 'staff_management' },
        { title: 'Clinic Settings', path: '/settings', icon: <Settings size={18} />, doctorOnly: true, moduleKey: 'clinic_settings' },
      ]
    }
  ];

  const adminSettings = user?.clinic_id?.admin_settings;
  const enabledModules = adminSettings?.enabled_modules;
  const staffSectionAccess = adminSettings?.staff_section_access;

  // Filter sections by Clinic administration settings, Doctor role, and Staff permissions
  const filteredSections = clinicSections.map(section => ({
    ...section,
    items: section.items.filter(item => {
      // 1. If module is disabled globally for this clinic by Administration, hide it
      if (item.moduleKey && enabledModules && enabledModules[item.moduleKey] === false) {
        return false;
      }
      
      // 2. If user is Staff (not doctor): check if staff is allowed to see this section
      if (!isDoctor) {
        if (item.doctorOnly && (!staffSectionAccess || !staffSectionAccess[item.moduleKey])) {
          return false;
        }
        if (item.moduleKey && staffSectionAccess && staffSectionAccess[item.moduleKey] === false) {
          return false;
        }
        if (item.permission && !hasPermission(item.permission)) {
          return false;
        }
      }

      return true;
    })
  })).filter(section => section.items.length > 0);

  const clinicLogo = user?.clinic_id?.logo || user?.clinic_id?.profile_url;

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
        <div className="sidebar-header" style={{ padding: isCollapsed ? '16px 8px' : '14px 16px' }}>
          {clinicLogo ? (
            <img 
              src={clinicLogo} 
              alt={clinicName} 
              onError={(e) => { e.currentTarget.src = '/adixon-logo.png'; }}
              style={{ 
                height: isCollapsed ? '28px' : '34px', 
                maxWidth: isCollapsed ? '36px' : '60px', 
                objectFit: 'contain',
                borderRadius: '6px'
              }} 
            />
          ) : (
            <img 
              src="/adixon-logo.png" 
              alt="Adixon Clinic OS" 
              style={{ 
                height: isCollapsed ? '22px' : '28px', 
                maxWidth: isCollapsed ? '34px' : '95px', 
                objectFit: 'contain' 
              }} 
            />
          )}
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
