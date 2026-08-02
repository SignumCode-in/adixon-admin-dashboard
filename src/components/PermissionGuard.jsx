import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert } from 'lucide-react';

export default function PermissionGuard({ requiredRole, requiredPermission, children }) {
  const { user, isAdmin, isDoctor, hasPermission } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Admin has access everywhere
  if (isAdmin) {
    return children;
  }

  // Role requirement check
  if (requiredRole && user.role !== requiredRole && !isAdmin) {
    return (
      <div className="access-denied-container" style={{ padding: '60px 20px', textAlign: 'center' }}>
        <ShieldAlert size={48} style={{ color: 'var(--color-danger)', marginBottom: '16px' }} />
        <h2>Access Restricted</h2>
        <p style={{ color: 'var(--color-text-secondary)', maxWidth: '480px', margin: '8px auto 24px' }}>
          This page requires <strong>{requiredRole}</strong> role privilege. Contact your Master Admin for permissions.
        </p>
      </div>
    );
  }

  // Permission requirement check (for Staff)
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return (
      <div className="access-denied-container" style={{ padding: '60px 20px', textAlign: 'center' }}>
        <ShieldAlert size={48} style={{ color: 'var(--color-warning)', marginBottom: '16px' }} />
        <h2>Permission Required</h2>
        <p style={{ color: 'var(--color-text-secondary)', maxWidth: '480px', margin: '8px auto 24px' }}>
          Your account does not have the <code>'{requiredPermission}'</code> permission granted.
        </p>
      </div>
    );
  }

  return children;
}
