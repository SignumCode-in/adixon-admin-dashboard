import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
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
  ListOrdered
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({ isCollapsed, onToggleCollapse, isMobileOpen, onCloseMobile }) {
  const { user, logout, isAdmin, isDoctor, hasPermission } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navSections = [
    {
      title: 'Main',
      items: [
        { title: 'Dashboard', path: '/', icon: <LayoutDashboard size={18} /> },
        { title: 'Analytics', path: '/analytics', icon: <BarChart3 size={18} />, permission: 'stats' },
        ...(isAdmin ? [{ title: 'Security Audit', path: '/security', icon: <ShieldCheck size={18} /> }] : []),
      ]
    },
    {
      title: 'Core Medical',
      items: [
        ...(isAdmin ? [{ title: 'Clinics Directory', path: '/clinics', icon: <Hospital size={18} /> }] : []),
        { title: 'Patients', path: '/patients', icon: <UserCheck size={18} />, permission: 'patients' },
        { title: 'Appointments', path: '/appointments', icon: <CalendarDays size={18} />, permission: 'appointments' },
        { title: 'Prescriptions', path: '/prescriptions', icon: <FileSpreadsheet size={18} />, permission: 'prescriptions' },
      ]
    },
    {
      title: 'Assets & Forms',
      items: [
        { title: 'Medicines', path: '/medicines', icon: <Pill size={18} />, permission: 'medicines' },
        { title: 'Labs & Tests', path: '/labs', icon: <FlaskConical size={18} />, permission: 'labs' },
        { title: 'Certificates', path: '/certificates', icon: <FileBadge size={18} />, permission: 'certificates' },
        { title: 'Instructions', path: '/instructions', icon: <FileText size={18} />, permission: 'instructions' },
        { title: 'Consents', path: '/consents', icon: <ClipboardCheck size={18} />, permission: 'consents' },
        { title: 'Templates', path: '/templates', icon: <Layout size={18} />, permission: 'templates' },
      ]
    },
    {
      title: 'Management',
      items: [
        ...((isAdmin || isDoctor) ? [{ title: 'Users & Staff', path: '/users', icon: <Users size={18} /> }] : []),
        ...(isAdmin ? [
          { title: 'Access Control', path: '/access-control', icon: <Lock size={18} /> },
          { title: 'Audit Logs', path: '/audit-logs', icon: <ListOrdered size={18} /> }
        ] : []),
        { title: 'Settings', path: '/settings', icon: <Settings size={18} /> },
      ]
    }
  ];

  // Filter sections and items based on role and staff permissions
  const filteredSections = navSections.map(section => ({
    ...section,
    items: section.items.filter(item => {
      if (isAdmin || isDoctor) return true;
      // Staff permission check
      if (!item.permission) return true; // general items like Dashboard/Settings allowed
      return hasPermission(item.permission);
    })
  })).filter(section => section.items.length > 0);

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''} ${isMobileOpen ? 'mobile-open' : ''}`}>
      <div className="sidebar-header">
        <div className="sidebar-logo">AD</div>
        {!isCollapsed && (
          <div className="sidebar-brand-wrapper">
            <span className="sidebar-brand">Adixon App</span>
            <span className="sidebar-subbrand">Healthcare Dashboard</span>
          </div>
        )}
        <button 
          className="menu-toggle" 
          onClick={onToggleCollapse}
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
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
          <button 
            className="icon-btn" 
            onClick={handleLogout} 
            title="Logout"
            style={{ padding: '6px', color: 'var(--color-danger)' }}
          >
            <LogOut size={16} />
          </button>
        </div>
      )}
    </aside>
  );
}
