import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import ClinicSidebar from '../components/clinic/ClinicSidebar';
import ClinicTopbar from '../components/clinic/ClinicTopbar';
import NotificationsDrawer from '../components/NotificationsDrawer';
import CommandPalette from '../components/CommandPalette';

export default function ClinicLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    () => localStorage.getItem('clinic_sidebar_collapsed') === 'true'
  );
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Keyboard shortcut Ctrl+K / Cmd+K for Command Palette
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleToggleSidebar = () => {
    if (window.innerWidth <= 767) {
      setMobileSidebarOpen((prev) => !prev);
    } else {
      setSidebarCollapsed((prev) => {
        const next = !prev;
        localStorage.setItem('clinic_sidebar_collapsed', String(next));
        return next;
      });
    }
  };

  return (
    <div className={`app-container ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      {/* Clinic Sidebar */}
      <ClinicSidebar
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => {
          setSidebarCollapsed((prev) => {
            const next = !prev;
            localStorage.setItem('clinic_sidebar_collapsed', String(next));
            return next;
          });
        }}
        isMobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      <div className="main-wrapper">
        {/* Clinic Topbar */}
        <ClinicTopbar
          onToggleSidebar={handleToggleSidebar}
          onToggleNotifications={() => setNotificationsOpen((prev) => !prev)}
          onOpenSearch={() => setSearchOpen(true)}
          unreadCount={unreadCount}
        />

        {/* Dynamic Nested Route Content */}
        <main className="page-container">
          <Outlet />
        </main>
      </div>

      {/* Floating Notifications drawer */}
      <NotificationsDrawer
        isOpen={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
        onUnreadCountChange={(count) => setUnreadCount(count)}
      />

      {/* Keyboard-accessible fuzzy command palette */}
      <CommandPalette
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
      />
    </div>
  );
}
