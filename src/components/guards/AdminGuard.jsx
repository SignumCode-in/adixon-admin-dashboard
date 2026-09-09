import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function AdminGuard({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--color-bg-secondary)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--color-primary)', marginBottom: '8px' }}>Adixon Admin</div>
          <div style={{ color: 'var(--color-text-secondary)', fontSize: '14px' }}>Verifying administrator privileges...</div>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  // Authenticated but not an administrator
  if (user.role !== 'admin') {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}
