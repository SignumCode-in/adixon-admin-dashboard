import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ClinicProvider } from './context/ClinicContext';

// Guards & Layouts
import AdminGuard from './components/guards/AdminGuard';
import ClinicGuard from './components/guards/ClinicGuard';
import PermissionGuard from './components/PermissionGuard';
import AdminLayout from './layouts/AdminLayout';
import ClinicLayout from './layouts/ClinicLayout';

// Dedicated Auth Pages
import AdminLogin from './pages/admin/AdminLogin';
import Login from './pages/Login';

// Governance & System Admin Pages
import Analytics from './pages/Analytics';
import Clinics from './pages/Clinics';
import ClinicOverview from './pages/ClinicOverview';
import SecurityDashboard from './pages/SecurityDashboard';
import AccessControl from './pages/AccessControl';
import AuditLogs from './pages/AuditLogs';
import PlatformStorage from './pages/PlatformStorage';
import ClinicStoragePage from './pages/ClinicStoragePage';

// Core Clinical Pages
import Dashboard from './pages/Dashboard';
import Patients from './pages/Patients';
import PatientDetails from './pages/PatientDetails';
import Appointments from './pages/Appointments';
import Prescriptions from './pages/Prescriptions';
import Medicines from './pages/Medicines';
import Certificates from './pages/Certificates';
import Instructions from './pages/Instructions';
import Consents from './pages/Consents';
import Templates from './pages/Templates';
import Users from './pages/Users';
import Settings from './pages/Settings';
import Kanban from './pages/Kanban';
import Projects from './pages/Projects';

import './App.css';

export default function App() {
  return (
    <AuthProvider>
      <ClinicProvider>
        <BrowserRouter>
          <Routes>
            {/* ======================================================== */}
            {/* 1. PUBLIC AUTHENTICATION ROUTING                         */}
            {/* ======================================================== */}
            {/* Clinic Portal Login (Healthcare Providers & Staff) */}
            <Route path="/login" element={<Login />} />

            {/* Dedicated Master Admin Authentication */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />

            {/* ======================================================== */}
            {/* 2. MASTER ADMIN PLATFORM PORTAL (/admin/*)              */}
            {/* ======================================================== */}
            <Route
              path="/admin"
              element={
                <AdminGuard>
                  <AdminLayout />
                </AdminGuard>
              }
            >
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<Analytics />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="clinic-dashboard" element={<Navigate to="/admin/dashboard" replace />} />

              {/* Multi-Tenant Clinic Management & Deep-Dive Scope */}
              <Route path="clinics" element={<Clinics />} />
              <Route path="clinics/:clinicId" element={<ClinicOverview />} />
              <Route path="clinics/:clinicId/patients" element={<Patients />} />
              <Route path="clinics/:clinicId/appointments" element={<Appointments />} />
              <Route path="clinics/:clinicId/prescriptions" element={<Prescriptions />} />
              <Route path="clinics/:clinicId/certificates" element={<Certificates />} />
              <Route path="clinics/:clinicId/instructions" element={<Instructions />} />
              <Route path="clinics/:clinicId/consents" element={<Consents />} />
              <Route path="clinics/:clinicId/templates" element={<Templates />} />
              <Route path="clinics/:clinicId/medicines" element={<Medicines />} />
              <Route path="clinics/:clinicId/users" element={<Users />} />
              <Route path="clinics/:clinicId/storage" element={<ClinicStoragePage />} />
              <Route path="clinics/:clinicId/settings" element={<Settings />} />

              {/* Global Inspector */}
              <Route path="patients/:patientId" element={<PatientDetails />} />
              <Route path="medicines" element={<Medicines />} />

              {/* Governance, Security & System Administration */}
              <Route path="storage" element={<PlatformStorage />} />
              <Route path="users" element={<Users />} />
              <Route path="security" element={<SecurityDashboard />} />
              <Route path="access-control" element={<AccessControl />} />
              <Route path="audit-logs" element={<AuditLogs />} />
              <Route path="settings" element={<Settings />} />
            </Route>

            {/* ======================================================== */}
            {/* 3. CLINIC OPERATIONS PORTAL (/*)                        */}
            {/* ======================================================== */}
            <Route
              element={
                <ClinicGuard>
                  <ClinicLayout />
                </ClinicGuard>
              }
            >
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />

              {/* Patient Management & EHR */}
              <Route
                path="/patients"
                element={
                  <PermissionGuard requiredPermission="patients">
                    <Patients />
                  </PermissionGuard>
                }
              />
              <Route path="/patients/:patientId" element={<PatientDetails />} />

              {/* Appointments & Scheduling */}
              <Route
                path="/appointments"
                element={
                  <PermissionGuard requiredPermission="appointments">
                    <Appointments />
                  </PermissionGuard>
                }
              />

              {/* Prescriptions & E-Pharmacy */}
              <Route
                path="/prescriptions"
                element={
                  <PermissionGuard requiredPermission="prescriptions">
                    <Prescriptions />
                  </PermissionGuard>
                }
              />

              {/* Medicines & Pharmacy Inventory */}
              <Route
                path="/medicines"
                element={
                  <PermissionGuard requiredPermission="medicines">
                    <Medicines />
                  </PermissionGuard>
                }
              />

              {/* Clinical Documentation & Legal Forms */}
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

              {/* Staff Management & Clinic Settings */}
              <Route path="/users" element={<Users />} />
              <Route path="/settings" element={<Settings />} />

              {/* Secondary Productivity Utilities */}
              <Route path="/kanban" element={<Kanban />} />
              <Route path="/projects" element={<Projects />} />
            </Route>

            {/* ======================================================== */}
            {/* 4. CATCH-ALL REDIRECTS                                   */}
            {/* ======================================================== */}
            <Route path="/admin/*" element={<Navigate to="/admin/login" replace />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
      </ClinicProvider>
    </AuthProvider>
  );
}
