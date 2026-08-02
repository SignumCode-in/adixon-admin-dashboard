import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ClinicProvider } from './context/ClinicContext';
import PermissionGuard from './components/PermissionGuard';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';
import Users from './pages/Users';
import Settings from './pages/Settings';

// Core Medical CRUD Pages
import Clinics from './pages/Clinics';
import Patients from './pages/Patients';
import Appointments from './pages/Appointments';
import Prescriptions from './pages/Prescriptions';
import Medicines from './pages/Medicines';
import Labs from './pages/Labs';
import Certificates from './pages/Certificates';
import Instructions from './pages/Instructions';
import Consents from './pages/Consents';
import Templates from './pages/Templates';

// Governance & System Admin Pages
import Kanban from './pages/Kanban';
import Projects from './pages/Projects';
import SecurityDashboard from './pages/SecurityDashboard';
import AccessControl from './pages/AccessControl';
import AuditLogs from './pages/AuditLogs';

import './App.css';

export default function App() {
  return (
    <AuthProvider>
      <ClinicProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Auth Route */}
            <Route path="/login" element={<Login />} />

            {/* Protected 3-Tier Dashboard Layout */}
            <Route element={<Layout />}>
              <Route path="/" element={<Dashboard />} />
              <Route
                path="/analytics"
                element={
                  <PermissionGuard requiredPermission="stats">
                    <Analytics />
                  </PermissionGuard>
                }
              />
              
              {/* User & Staff Management (Admin or Doctor) */}
              <Route path="/users" element={<Users />} />
              
              {/* Master Admin Only Routes */}
              <Route
                path="/clinics"
                element={
                  <PermissionGuard requiredRole="admin">
                    <Clinics />
                  </PermissionGuard>
                }
              />
              <Route
                path="/security"
                element={
                  <PermissionGuard requiredRole="admin">
                    <SecurityDashboard />
                  </PermissionGuard>
                }
              />
              <Route
                path="/access-control"
                element={
                  <PermissionGuard requiredRole="admin">
                    <AccessControl />
                  </PermissionGuard>
                }
              />
              <Route
                path="/audit-logs"
                element={
                  <PermissionGuard requiredRole="admin">
                    <AuditLogs />
                  </PermissionGuard>
                }
              />

              {/* Core Medical CRUD (Permission guarded for Staff) */}
              <Route
                path="/patients"
                element={
                  <PermissionGuard requiredPermission="patients">
                    <Patients />
                  </PermissionGuard>
                }
              />
              <Route
                path="/appointments"
                element={
                  <PermissionGuard requiredPermission="appointments">
                    <Appointments />
                  </PermissionGuard>
                }
              />
              <Route
                path="/prescriptions"
                element={
                  <PermissionGuard requiredPermission="prescriptions">
                    <Prescriptions />
                  </PermissionGuard>
                }
              />

              {/* Assets & Forms */}
              <Route
                path="/medicines"
                element={
                  <PermissionGuard requiredPermission="medicines">
                    <Medicines />
                  </PermissionGuard>
                }
              />
              <Route
                path="/labs"
                element={
                  <PermissionGuard requiredPermission="labs">
                    <Labs />
                  </PermissionGuard>
                }
              />
              <Route
                path="/certificates"
                element={
                  <PermissionGuard requiredPermission="certificates">
                    <Certificates />
                  </PermissionGuard>
                }
              />
              <Route
                path="/instructions"
                element={
                  <PermissionGuard requiredPermission="instructions">
                    <Instructions />
                  </PermissionGuard>
                }
              />
              <Route
                path="/consents"
                element={
                  <PermissionGuard requiredPermission="consents">
                    <Consents />
                  </PermissionGuard>
                }
              />
              <Route
                path="/templates"
                element={
                  <PermissionGuard requiredPermission="templates">
                    <Templates />
                  </PermissionGuard>
                }
              />

              {/* Settings & Secondary Utilities */}
              <Route path="/settings" element={<Settings />} />
              <Route path="/kanban" element={<Kanban />} />
              <Route path="/projects" element={<Projects />} />
            </Route>

            {/* Catch-all Redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ClinicProvider>
    </AuthProvider>
  );
}
