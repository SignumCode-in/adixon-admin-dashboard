import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Hospital, 
  Users, 
  Calendar, 
  FileSpreadsheet, 
  MapPin, 
  Phone, 
  Mail, 
  Globe,
  Clock,
  CheckCircle2,
  XCircle,
  Stethoscope, 
  ArrowLeft,
  UserCheck,
  ChevronRight,
  ExternalLink,
  Settings,
  Plus,
  FlaskConical
} from 'lucide-react';
import { clinicAPI, patientAPI, appointmentAPI, prescriptionAPI } from '../services/api';

export default function ClinicOverview() {
  const { clinicId } = useParams();
  const navigate = useNavigate();

  const [clinic, setClinic] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (clinicId) {
      loadClinicDetails();
    }
  }, [clinicId]);

  const loadClinicDetails = async () => {
    setLoading(true);
    try {
      const [clinicRes, patientsRes, apptsRes, prescRes] = await Promise.allSettled([
        clinicAPI.getClinicById(clinicId),
        patientAPI.getPatients({ clinic_id: clinicId, limit: 10 }),
        appointmentAPI.getAppointments({ clinic_id: clinicId, limit: 10 }),
        prescriptionAPI.getPrescriptions({ clinic_id: clinicId, limit: 10 }),
      ]);

      if (clinicRes.status === 'fulfilled') {
        const cData = clinicRes.value?.data?.data || clinicRes.value?.data;
        setClinic(cData);
        setDoctors(cData?.doctors || []);
      }

      const pList = patientsRes.status === 'fulfilled' ? (patientsRes.value?.data?.data || patientsRes.value?.data || []) : [];
      const aList = apptsRes.status === 'fulfilled' ? (apptsRes.value?.data?.data || apptsRes.value?.data || []) : [];
      const prList = prescRes.status === 'fulfilled' ? (prescRes.value?.data?.data || prescRes.value?.data || []) : [];

      setPatients(Array.isArray(pList) ? pList : []);
      setAppointments(Array.isArray(aList) ? aList : []);
      setPrescriptions(Array.isArray(prList) ? prList : []);
    } catch (err) {
      console.error('Error loading clinic overview:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '60px 20px', textAlign: 'center' }}>
        <div style={{ fontSize: '16px', fontWeight: '600', color: 'var(--color-primary)', marginBottom: '8px' }}>
          Loading Clinic Dashboard & Details...
        </div>
        <div style={{ color: 'var(--color-text-secondary)', fontSize: '13px' }}>Fetching live clinic metrics and records</div>
      </div>
    );
  }

  if (!clinic) {
    return (
      <div style={{ padding: '60px 20px', textAlign: 'center' }}>
        <h2>Clinic Record Not Found</h2>
        <p style={{ color: 'var(--color-text-secondary)', marginTop: '8px' }}>The requested clinic branch does not exist or has been removed.</p>
        <Link to="/admin/clinics" className="btn btn-secondary" style={{ marginTop: '16px' }}>
          <ArrowLeft size={14} /> Return to Clinics Directory
        </Link>
      </div>
    );
  }

  return (
    <div style={{ paddingBottom: '40px' }}>
      {/* Top Breadcrumb & Action Bar */}
      <div className="page-header" style={{ marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <Link to="/admin/clinics" style={{ textDecoration: 'none', color: 'var(--color-primary)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '500' }}>
              <ArrowLeft size={14} /> All Clinics Directory
            </Link>
            <span style={{ color: 'var(--color-text-tertiary)' }}>/</span>
            <span style={{ color: 'var(--color-text-secondary)', fontSize: '13px' }}>Clinic Overview</span>
          </div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Hospital size={24} style={{ color: 'var(--color-primary)' }} />
            {clinic.name}
          </h1>
          <p className="page-subtitle">{clinic.tagline || 'Clinic Healthcare Operations & Details'}</p>
        </div>

        {/* Quick Navigation Action Buttons */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button 
            className="btn btn-secondary" 
            style={{ fontSize: '12px', gap: '6px' }}
            onClick={() => navigate(`/admin/clinics/${clinicId}/patients`)}
          >
            <UserCheck size={14} /> Clinic Patients
          </button>
          <button 
            className="btn btn-secondary" 
            style={{ fontSize: '12px', gap: '6px' }}
            onClick={() => navigate(`/admin/clinics/${clinicId}/appointments`)}
          >
            <Calendar size={14} /> Appointments
          </button>
          <button 
            className="btn btn-secondary" 
            style={{ fontSize: '12px', gap: '6px' }}
            onClick={() => navigate(`/admin/clinics/${clinicId}/prescriptions`)}
          >
            <FileSpreadsheet size={14} /> Prescriptions
          </button>
          <button 
            className="btn btn-secondary" 
            style={{ fontSize: '12px', gap: '6px' }}
            onClick={() => navigate(`/admin/clinics/${clinicId}/labs`)}
          >
            <FlaskConical size={14} /> Lab Orders
          </button>
          <button 
            className="btn btn-secondary" 
            style={{ fontSize: '12px', gap: '6px' }}
            onClick={() => navigate(`/admin/clinics/${clinicId}/users`)}
          >
            <Users size={14} /> Staff & Doctors
          </button>
          <button 
            className="btn btn-secondary" 
            style={{ fontSize: '12px', gap: '6px' }}
            onClick={() => navigate(`/admin/clinics/${clinicId}/settings`)}
          >
            <Settings size={14} /> Clinic Settings
          </button>
        </div>
      </div>

      {/* KPI Stats Row */}
      <div className="kpi-row" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', marginBottom: '24px' }}>
        <div 
          className="card kpi-card" 
          onClick={() => navigate(`/admin/clinics/${clinicId}/patients`)}
          style={{ cursor: 'pointer' }}
          title="Click to view clinic patients"
        >
          <div className="kpi-details">
            <span className="kpi-label">Registered Patients</span>
            <span className="kpi-value">{patients.length}</span>
            <span className="kpi-trend up" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              View Patients <ChevronRight size={12} />
            </span>
          </div>
          <div className="kpi-icon-wrapper" style={{ backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)' }}>
            <Users size={20} />
          </div>
        </div>

        <div 
          className="card kpi-card" 
          onClick={() => navigate(`/admin/clinics/${clinicId}/appointments`)}
          style={{ cursor: 'pointer' }}
          title="Click to view clinic appointments"
        >
          <div className="kpi-details">
            <span className="kpi-label">Appointments</span>
            <span className="kpi-value">{appointments.length}</span>
            <span className="kpi-trend up" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              View Appointments <ChevronRight size={12} />
            </span>
          </div>
          <div className="kpi-icon-wrapper" style={{ backgroundColor: 'var(--color-success-light)', color: 'var(--color-success)' }}>
            <Calendar size={20} />
          </div>
        </div>

        <div 
          className="card kpi-card" 
          onClick={() => navigate(`/admin/clinics/${clinicId}/prescriptions`)}
          style={{ cursor: 'pointer' }}
          title="Click to view clinic prescriptions"
        >
          <div className="kpi-details">
            <span className="kpi-label">Prescriptions</span>
            <span className="kpi-value">{prescriptions.length}</span>
            <span className="kpi-trend up" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              View Prescriptions <ChevronRight size={12} />
            </span>
          </div>
          <div className="kpi-icon-wrapper" style={{ backgroundColor: 'var(--color-info-light)', color: 'var(--color-info)' }}>
            <FileSpreadsheet size={20} />
          </div>
        </div>

        <div className="card kpi-card">
          <div className="kpi-details">
            <span className="kpi-label">Doctors & Staff</span>
            <span className="kpi-value">{doctors.length || 1}</span>
            <span className="kpi-trend up">Registered Practitioners</span>
          </div>
          <div className="kpi-icon-wrapper" style={{ backgroundColor: 'rgba(168, 85, 247, 0.15)', color: '#a855f7' }}>
            <Stethoscope size={20} />
          </div>
        </div>
      </div>

      {/* Main Clinic Details & Doctors Grid */}
      <div className="charts-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        {/* Comprehensive Clinic Details */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--color-border)', paddingBottom: '12px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '600' }}>
              Clinic Profile & Contact Details
            </h3>
            <span className="badge badge-success" style={{ fontSize: '11px' }}>Active Branch</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13px' }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <Phone size={16} style={{ color: 'var(--color-primary)', marginTop: '2px', flexShrink: 0 }} />
              <div>
                <div style={{ color: 'var(--color-text-tertiary)', fontSize: '11px', fontWeight: '500' }}>PHONE NUMBER</div>
                <div style={{ fontWeight: '500', marginTop: '2px' }}>{clinic.phone || 'Not provided'}</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <Mail size={16} style={{ color: 'var(--color-primary)', marginTop: '2px', flexShrink: 0 }} />
              <div>
                <div style={{ color: 'var(--color-text-tertiary)', fontSize: '11px', fontWeight: '500' }}>EMAIL ADDRESS</div>
                <div style={{ fontWeight: '500', marginTop: '2px' }}>{clinic.email || 'Not provided'}</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <Globe size={16} style={{ color: 'var(--color-primary)', marginTop: '2px', flexShrink: 0 }} />
              <div>
                <div style={{ color: 'var(--color-text-tertiary)', fontSize: '11px', fontWeight: '500' }}>WEBSITE</div>
                <div style={{ fontWeight: '500', marginTop: '2px' }}>
                  {clinic.website ? (
                    <a href={clinic.website} target="_blank" rel="noreferrer" style={{ color: 'var(--color-primary)', textDecoration: 'none' }}>
                      {clinic.website}
                    </a>
                  ) : 'Not provided'}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <MapPin size={16} style={{ color: 'var(--color-primary)', marginTop: '2px', flexShrink: 0 }} />
              <div>
                <div style={{ color: 'var(--color-text-tertiary)', fontSize: '11px', fontWeight: '500' }}>PHYSICAL ADDRESS</div>
                <div style={{ fontWeight: '500', marginTop: '2px' }}>{clinic.address || 'Address not listed'}</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <Clock size={16} style={{ color: 'var(--color-primary)', marginTop: '2px', flexShrink: 0 }} />
              <div>
                <div style={{ color: 'var(--color-text-tertiary)', fontSize: '11px', fontWeight: '500' }}>OPERATING TIMINGS</div>
                <div style={{ fontWeight: '500', marginTop: '2px' }}>
                  {clinic.open_days || 'Mon - Sat'} &bull; {clinic.visit_hours || '09:00 AM - 08:00 PM'}
                </div>
              </div>
            </div>

            {/* Document Badges */}
            <div style={{ marginTop: '10px', paddingTop: '12px', borderTop: '1px solid var(--color-border)', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px', color: clinic.is_stamp ? 'var(--color-success)' : 'var(--color-text-tertiary)' }}>
                {clinic.is_stamp ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                Clinic Stamp {clinic.is_stamp ? 'Enabled' : 'Disabled'}
              </span>
              <span style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px', color: clinic.is_doctor_signature ? 'var(--color-success)' : 'var(--color-text-tertiary)' }}>
                {clinic.is_doctor_signature ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                Doctor Signature {clinic.is_doctor_signature ? 'Enabled' : 'Disabled'}
              </span>
              <span style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px', color: clinic.is_logo ? 'var(--color-success)' : 'var(--color-text-tertiary)' }}>
                {clinic.is_logo ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                Logo {clinic.is_logo ? 'Enabled' : 'Disabled'}
              </span>
            </div>
          </div>
        </div>

        {/* Assigned Doctors & Staff */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--color-border)', paddingBottom: '12px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '600' }}>
              Assigned Doctors & Practitioners ({doctors.length})
            </h3>
            <span className="badge badge-info" style={{ fontSize: '11px' }}>Healthcare Providers</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {doctors.map((doc) => (
              <div 
                key={doc._id} 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between', 
                  padding: '12px', 
                  background: 'var(--color-bg-secondary)', 
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div className="sidebar-user-avatar" style={{ width: '40px', height: '40px', background: '#0d9488', fontSize: '15px' }}>
                    {doc.full_name ? doc.full_name[0].toUpperCase() : 'D'}
                  </div>
                  <div>
                    <div style={{ fontWeight: '600', fontSize: '14px', color: 'var(--color-text-primary)' }}>{doc.full_name}</div>
                    <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                      {doc.qualification || 'Primary Doctor'} 
                      {doc.registration_number ? ` • Reg #${doc.registration_number}` : ''}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', marginTop: '2px' }}>
                      {doc.email} {doc.phone ? ` • ${doc.phone}` : ''}
                    </div>
                  </div>
                </div>
                <span className="badge badge-success" style={{ fontSize: '10px' }}>Lead Doctor</span>
              </div>
            ))}

            {doctors.length === 0 && (
              <div style={{ color: 'var(--color-text-tertiary)', fontSize: '13px', textAlign: 'center', padding: '30px 10px' }}>
                <Stethoscope size={32} style={{ opacity: 0.3, margin: '0 auto 10px' }} />
                <div>No primary doctors registered for this clinic yet.</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Operational Activity Preview Tables */}
      <div className="charts-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {/* Recent Appointments Preview */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: '600' }}>Recent Appointments</h3>
            <button 
              className="btn btn-secondary" 
              style={{ fontSize: '11px', padding: '4px 8px' }}
              onClick={() => navigate(`/admin/clinics/${clinicId}/appointments`)}
            >
              View All
            </button>
          </div>

          <div className="table-responsive">
            {appointments.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--color-text-tertiary)', fontSize: '13px' }}>
                No appointments scheduled yet.
              </div>
            ) : (
              <table className="data-table" style={{ fontSize: '12px' }}>
                <thead>
                  <tr>
                    <th>Patient</th>
                    <th>Date & Time</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.slice(0, 5).map((appt) => (
                    <tr key={appt._id}>
                      <td style={{ fontWeight: '500' }}>
                        {appt.patient_id?.full_name || appt.patient_name || 'Patient'}
                      </td>
                      <td>{appt.appointment_date || appt.date || 'Today'}</td>
                      <td>
                        <span className={`badge badge-${appt.status === 'completed' ? 'success' : appt.status === 'cancelled' ? 'danger' : 'warning'}`} style={{ fontSize: '10px' }}>
                          {appt.status || 'scheduled'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Recent Patients Preview */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: '600' }}>Recently Registered Patients</h3>
            <button 
              className="btn btn-secondary" 
              style={{ fontSize: '11px', padding: '4px 8px' }}
              onClick={() => navigate(`/admin/clinics/${clinicId}/patients`)}
            >
              View All
            </button>
          </div>

          <div className="table-responsive">
            {patients.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--color-text-tertiary)', fontSize: '13px' }}>
                No patients registered yet.
              </div>
            ) : (
              <table className="data-table" style={{ fontSize: '12px' }}>
                <thead>
                  <tr>
                    <th>Patient Name</th>
                    <th>Phone</th>
                    <th>Gender</th>
                  </tr>
                </thead>
                <tbody>
                  {patients.slice(0, 5).map((pat) => (
                    <tr key={pat._id}>
                      <td style={{ fontWeight: '500' }}>{pat.full_name}</td>
                      <td>{pat.phone || 'N/A'}</td>
                      <td>{pat.gender || 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
