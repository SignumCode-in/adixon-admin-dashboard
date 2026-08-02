import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Compass, Shield, User, Settings, Moon, Sun } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function CommandPalette({ isOpen, onClose }) {
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();
  const { toggleTheme } = useAuth();
  const inputRef = useRef(null);

  // Group items
  const pages = [
    { title: 'Overview Dashboard', path: '/', icon: <Compass size={16} /> },
    { title: 'Analytics Statistics', path: '/analytics', icon: <Compass size={16} /> },
    { title: 'Users & Staff Settings', path: '/users', icon: <User size={16} /> },
    { title: 'Kanban Board', path: '/kanban', icon: <Compass size={16} /> },
    { title: 'Clinic Calendar', path: '/calendar', icon: <Compass size={16} /> },
    { title: 'Projects & Tasks', path: '/projects', icon: <Compass size={16} /> },
    { title: 'General Settings', path: '/settings', icon: <Settings size={16} /> },
    { title: 'Security Dashboard', path: '/security', icon: <Shield size={16} /> },
    { title: 'Access Roles & Permissions', path: '/access-control', icon: <Shield size={16} /> },
    { title: 'Audit logs & Login activity', path: '/audit-logs', icon: <Shield size={16} /> },
  ];

  const actions = [
    { title: 'Toggle Dark / Light Theme', action: () => { toggleTheme(); onClose(); }, icon: <Moon size={16} /> },
    { title: 'Add New Staff Member', action: () => { navigate('/users?add=true'); onClose(); }, icon: <User size={16} /> },
    { title: 'Configure Security Certificates', action: () => { navigate('/settings?tab=security'); onClose(); }, icon: <Shield size={16} /> },
  ];

  // Filter items based on search query
  const filteredPages = pages.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase())
  );
  const filteredActions = actions.filter((a) =>
    a.title.toLowerCase().includes(search.toLowerCase())
  );

  const totalItems = [...filteredPages, ...filteredActions];

  useEffect(() => {
    if (isOpen) {
      setSearch('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % totalItems.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + totalItems.length) % totalItems.length);
      } else if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const selected = totalItems[selectedIndex];
        if (selected) {
          if (selected.path) {
            navigate(selected.path);
            onClose();
          } else if (selected.action) {
            selected.action();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, totalItems]);

  if (!isOpen) return null;

  return (
    <div className="palette-overlay" onClick={onClose}>
      <div className="palette-container" onClick={(e) => e.stopPropagation()}>
        <div className="palette-search-wrapper">
          <Search size={18} className="sidebar-nav-icon" />
          <input
            ref={inputRef}
            type="text"
            className="palette-input"
            placeholder="Type a command or search page..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setSelectedIndex(0);
            }}
          />
        </div>

        <div className="palette-results">
          {filteredPages.length > 0 && (
            <div>
              <div className="palette-group-title">Go to page</div>
              {filteredPages.map((page, idx) => {
                const globalIdx = idx;
                return (
                  <div
                    key={page.path}
                    className={`palette-item ${globalIdx === selectedIndex ? 'selected' : ''}`}
                    onMouseEnter={() => setSelectedIndex(globalIdx)}
                    onClick={() => {
                      navigate(page.path);
                      onClose();
                    }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {page.icon}
                      {page.title}
                    </span>
                    <span className="breadcrumbs-separator">➔</span>
                  </div>
                );
              })}
            </div>
          )}

          {filteredActions.length > 0 && (
            <div>
              <div className="palette-group-title">Quick Actions</div>
              {filteredActions.map((act, idx) => {
                const globalIdx = filteredPages.length + idx;
                return (
                  <div
                    key={act.title}
                    className={`palette-item ${globalIdx === selectedIndex ? 'selected' : ''}`}
                    onMouseEnter={() => setSelectedIndex(globalIdx)}
                    onClick={act.action}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {act.icon}
                      {act.title}
                    </span>
                    <span className="breadcrumbs-separator">➔</span>
                  </div>
                );
              })}
            </div>
          )}

          {totalItems.length === 0 && (
            <div style={{ padding: '16px', textAlign: 'center', color: 'var(--color-text-tertiary)' }}>
              No results found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
