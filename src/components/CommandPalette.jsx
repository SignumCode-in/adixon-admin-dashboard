import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Hospital, 
  User, 
  Stethoscope, 
  FileSpreadsheet, 
  Calendar, 
  FileText, 
  ExternalLink, 
  X, 
  Loader2, 
  ChevronRight,
  Sparkles,
  MapPin,
  Phone,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { dashboardAPI } from '../services/api';

export default function CommandPalette({ isOpen, onClose }) {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const inputRef = useRef(null);

  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState({
    clinics: [],
    patients: [],
    doctors: [],
    prescriptions: [],
    appointments: [],
    templates: [],
  });

  // Debounced search query
  useEffect(() => {
    if (!isOpen) return;

    if (!search.trim()) {
      setResults({
        clinics: [],
        patients: [],
        doctors: [],
        prescriptions: [],
        appointments: [],
        templates: [],
      });
      setLoading(false);
      return;
    }

    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await dashboardAPI.globalSearch({ q: search.trim() });
        if (res && res.success && res.data) {
          setResults({
            clinics: res.data.clinics || [],
            patients: res.data.patients || [],
            doctors: res.data.doctors || [],
            prescriptions: res.data.prescriptions || [],
            appointments: res.data.appointments || [],
            templates: res.data.templates || [],
          });
        }
      } catch (err) {
        console.error('Error during global search:', err);
      } finally {
        setLoading(false);
      }
    }, 280);

    return () => clearTimeout(timer);
  }, [search, isOpen]);

  // Focus on input when opened
  useEffect(() => {
    if (isOpen) {
      setSearch('');
      setActiveTab('all');
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Calculate counts
  const clinicCount = results.clinics.length;
  const patientCount = results.patients.length;
  const doctorCount = results.doctors.length;
  const prescriptionCount = results.prescriptions.length;
  const appointmentCount = results.appointments.length;
  const templateCount = results.templates.length;

  const totalCount = isAdmin
    ? clinicCount + patientCount + doctorCount + prescriptionCount + appointmentCount + templateCount
    : patientCount + prescriptionCount + appointmentCount + templateCount;

  // Define tabs based on role
  const tabs = isAdmin
    ? [
        { id: 'all', label: 'All Results', count: totalCount, icon: <Sparkles size={14} /> },
        { id: 'clinic', label: 'Clinics', count: clinicCount, icon: <Hospital size={14} /> },
        { id: 'patient', label: 'Patients', count: patientCount, icon: <User size={14} /> },
        { id: 'doctor', label: 'Doctors', count: doctorCount, icon: <Stethoscope size={14} /> },
        { id: 'prescription', label: 'Prescriptions', count: prescriptionCount, icon: <FileSpreadsheet size={14} /> },
        { id: 'appointment', label: 'Appointments', count: appointmentCount, icon: <Calendar size={14} /> },
        { id: 'template', label: 'Templates', count: templateCount, icon: <FileText size={14} /> },
      ]
    : [
        { id: 'all', label: 'All Results', count: totalCount, icon: <Sparkles size={14} /> },
        { id: 'patient', label: 'Patients', count: patientCount, icon: <User size={14} /> },
        { id: 'prescription', label: 'Prescriptions', count: prescriptionCount, icon: <FileSpreadsheet size={14} /> },
        { id: 'appointment', label: 'Appointments', count: appointmentCount, icon: <Calendar size={14} /> },
        { id: 'template', label: 'Templates', count: templateCount, icon: <FileText size={14} /> },
      ];

  const handleGoToClinic = (e, clinicId) => {
    e.stopPropagation();
    if (clinicId) {
      navigate(`/admin/clinics/${clinicId}`);
      onClose();
    }
  };

  const handlePatientClick = (patient) => {
    if (isAdmin) {
      navigate(`/admin/patients/${patient._id}`);
    } else {
      navigate(`/patients/${patient._id}`);
    }
    onClose();
  };

  const handleClinicClick = (clinic) => {
    navigate(`/admin/clinics/${clinic._id}`);
    onClose();
  };

  const handleDoctorClick = (doctor) => {
    navigate('/admin/users');
    onClose();
  };

  const handlePrescriptionClick = (presc) => {
    const patId = presc.patient_id?._id || presc.patient_id;
    if (isAdmin) {
      if (patId) navigate(`/admin/patients/${patId}`);
      else if (presc.clinic_id?._id || presc.clinic_id) navigate(`/admin/clinics/${presc.clinic_id?._id || presc.clinic_id}/prescriptions`);
      else navigate('/admin/dashboard');
    } else {
      if (patId) navigate(`/patients/${patId}`);
      else navigate('/prescriptions');
    }
    onClose();
  };

  const handleAppointmentClick = (appt) => {
    const patId = appt.patient_id?._id || appt.patient_id;
    if (isAdmin) {
      if (patId) navigate(`/admin/patients/${patId}`);
      else if (appt.clinic_id?._id || appt.clinic_id) navigate(`/admin/clinics/${appt.clinic_id?._id || appt.clinic_id}/appointments`);
      else navigate('/admin/dashboard');
    } else {
      if (patId) navigate(`/patients/${patId}`);
      else navigate('/appointments');
    }
    onClose();
  };

  const handleTemplateClick = (temp) => {
    if (isAdmin) {
      const cId = temp.clinic_id?._id || temp.clinic_id;
      if (cId) navigate(`/admin/clinics/${cId}/templates`);
      else navigate('/admin/dashboard');
    } else {
      navigate('/templates');
    }
    onClose();
  };

  const shouldShow = (type) => activeTab === 'all' || activeTab === type;

  return (
    <div className="palette-overlay" onClick={onClose}>
      <div 
        className="palette-container" 
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '780px',
          maxWidth: '92vw',
          maxHeight: '80vh',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: '16px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
          border: '1px solid var(--color-border)',
          backgroundColor: 'var(--color-bg)',
          overflow: 'hidden'
        }}
      >
        {/* Top Search Input Box */}
        <div 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px', 
            padding: '16px 20px', 
            borderBottom: '1px solid var(--color-border)',
            background: 'var(--color-bg-secondary)'
          }}
        >
          {loading ? (
            <Loader2 size={20} className="breadcrumbs-separator" style={{ animation: 'spin 1s linear infinite', color: 'var(--color-primary)' }} />
          ) : (
            <Search size={20} style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
          )}

          <input
            ref={inputRef}
            type="text"
            className="palette-input"
            style={{ fontSize: '16px', fontWeight: '500', width: '100%' }}
            placeholder={isAdmin ? "Global search clinics, patients, doctors, prescriptions, appointments..." : "Search patients, prescriptions, appointments, templates..."}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {search && (
            <button 
              onClick={() => setSearch('')}
              className="icon-btn" 
              style={{ padding: '4px' }}
              title="Clear search"
            >
              <X size={16} />
            </button>
          )}

          <kbd 
            style={{ 
              padding: '2px 8px', 
              fontSize: '11px', 
              backgroundColor: 'var(--color-bg)', 
              border: '1px solid var(--color-border)', 
              borderRadius: '6px', 
              color: 'var(--color-text-tertiary)',
              flexShrink: 0
            }}
          >
            ESC
          </kbd>
        </div>

        {/* Tab Selection Bar */}
        {search.trim() && (
          <div 
            style={{ 
              display: 'flex', 
              gap: '6px', 
              padding: '10px 16px', 
              borderBottom: '1px solid var(--color-border)', 
              overflowX: 'auto',
              background: 'var(--color-bg)'
            }}
          >
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 12px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: isActive ? '600' : '500',
                    border: '1px solid',
                    borderColor: isActive ? 'var(--color-primary)' : 'var(--color-border)',
                    backgroundColor: isActive ? 'var(--color-primary-light)' : 'transparent',
                    color: isActive ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.15s'
                  }}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                  <span 
                    style={{ 
                      fontSize: '10px', 
                      padding: '1px 6px', 
                      borderRadius: '10px', 
                      backgroundColor: isActive ? 'var(--color-primary)' : 'var(--color-border)', 
                      color: isActive ? '#ffffff' : 'var(--color-text-tertiary)' 
                    }}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* Results Area */}
        <div style={{ overflowY: 'auto', flex: 1, padding: '16px 20px' }}>
          {/* Empty search state */}
          {!search.trim() && (
            <div style={{ padding: '30px 10px', textAlign: 'center' }}>
              <Search size={36} style={{ color: 'var(--color-primary)', opacity: 0.3, margin: '0 auto 12px' }} />
              <div style={{ fontSize: '15px', fontWeight: '600', color: 'var(--color-text-primary)' }}>
                {isAdmin ? 'Global Multi-Tenant Platform Search' : 'Clinic Workspace Search'}
              </div>
              <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '4px', maxWidth: '440px', margin: '6px auto 0' }}>
                {isAdmin 
                  ? 'Type to instantly search across all clinics, registered patients, assigned doctors, prescriptions, and appointments.'
                  : 'Type to quickly find patients, medical prescriptions, clinical appointments, and instruction templates.'}
              </p>
            </div>
          )}

          {/* Non-empty search but zero matches */}
          {search.trim() && !loading && totalCount === 0 && (
            <div style={{ padding: '40px 10px', textAlign: 'center' }}>
              <AlertCircle size={36} style={{ color: 'var(--color-text-tertiary)', margin: '0 auto 12px' }} />
              <div style={{ fontSize: '15px', fontWeight: '600', color: 'var(--color-text-primary)' }}>
                No records found matching "{search}"
              </div>
              <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                Try searching with a patient name, phone number, doctor qualification, or prescription code.
              </p>
            </div>
          )}

          {/* RESULTS DISPLAY */}

          {/* 1. CLINICS (Admin Only) */}
          {isAdmin && shouldShow('clinic') && results.clinics.length > 0 && (
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                Clinics ({results.clinics.length})
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {results.clinics.map((c) => (
                  <div
                    key={c._id}
                    onClick={() => handleClinicClick(c)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 16px',
                      backgroundColor: 'var(--color-bg-secondary)',
                      border: '1px solid var(--color-border)',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      transition: 'border-color 0.15s, background-color 0.15s'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '38px', height: '38px', borderRadius: '8px', backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Hospital size={20} />
                      </div>
                      <div>
                        <div style={{ fontWeight: '600', fontSize: '14px', color: 'var(--color-text-primary)' }}>{c.name}</div>
                        <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '2px', display: 'flex', gap: '12px' }}>
                          {c.phone && <span><Phone size={11} style={{ display: 'inline', marginRight: '4px' }} />{c.phone}</span>}
                          {c.address && <span><MapPin size={11} style={{ display: 'inline', marginRight: '4px' }} />{c.address}</span>}
                        </div>
                      </div>
                    </div>

                    <button className="btn btn-secondary" style={{ fontSize: '12px', padding: '4px 10px', gap: '4px' }}>
                      <Hospital size={13} /> View Clinic
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 2. PATIENTS */}
          {shouldShow('patient') && results.patients.length > 0 && (
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                Patients ({results.patients.length})
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {results.patients.map((p) => {
                  const clinicName = p.clinic_id?.name;
                  const clinicId = p.clinic_id?._id || p.clinic_id;
                  return (
                    <div
                      key={p._id}
                      onClick={() => handlePatientClick(p)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '12px 16px',
                        backgroundColor: 'var(--color-bg-secondary)',
                        border: '1px solid var(--color-border)',
                        borderRadius: '10px',
                        cursor: 'pointer'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '38px', height: '38px', borderRadius: '8px', backgroundColor: 'rgba(55, 138, 221, 0.15)', color: '#378ADD', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <User size={20} />
                        </div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontWeight: '600', fontSize: '14px', color: 'var(--color-text-primary)' }}>{p.full_name}</span>
                            <span className="badge badge-info" style={{ fontSize: '10px' }}>{p.gender || 'N/A'} • {p.age ? `${p.age} Yrs` : 'N/A'}</span>
                            {p.blood_group && <span className="badge badge-success" style={{ fontSize: '10px' }}>{p.blood_group}</span>}
                          </div>
                          <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '2px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                            {p.phone && <span>Phone: {p.phone}</span>}
                            {clinicName && (
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--color-primary)', fontWeight: '500' }}>
                                <Hospital size={12} /> Clinic: {clinicName}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        {/* Admin direct clinic navigation */}
                        {isAdmin && clinicId && (
                          <button
                            type="button"
                            className="btn btn-secondary"
                            style={{ fontSize: '11px', padding: '4px 8px', gap: '4px' }}
                            onClick={(e) => handleGoToClinic(e, clinicId)}
                            title={`Navigate directly to ${clinicName || 'Clinic'}`}
                          >
                            <Hospital size={12} /> Go to Clinic
                          </button>
                        )}
                        <button className="btn btn-primary" style={{ fontSize: '12px', padding: '4px 10px', gap: '4px' }}>
                          <ExternalLink size={13} /> View EHR
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 3. DOCTORS (Admin Only) */}
          {isAdmin && shouldShow('doctor') && results.doctors.length > 0 && (
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                Doctors & Practitioners ({results.doctors.length})
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {results.doctors.map((d) => {
                  const clinicName = d.clinic_id?.name;
                  const clinicId = d.clinic_id?._id || d.clinic_id;
                  return (
                    <div
                      key={d._id}
                      onClick={() => handleDoctorClick(d)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '12px 16px',
                        backgroundColor: 'var(--color-bg-secondary)',
                        border: '1px solid var(--color-border)',
                        borderRadius: '10px',
                        cursor: 'pointer'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '38px', height: '38px', borderRadius: '8px', backgroundColor: 'rgba(13, 148, 136, 0.15)', color: '#0d9488', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Stethoscope size={20} />
                        </div>
                        <div>
                          <div style={{ fontWeight: '600', fontSize: '14px', color: 'var(--color-text-primary)' }}>{d.full_name}</div>
                          <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '2px', display: 'flex', gap: '12px' }}>
                            <span>{d.qualification || 'Healthcare Practitioner'}</span>
                            {clinicName && (
                              <span style={{ color: 'var(--color-primary)', fontWeight: '500' }}>
                                🏥 {clinicName}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        {isAdmin && clinicId && (
                          <button
                            type="button"
                            className="btn btn-secondary"
                            style={{ fontSize: '11px', padding: '4px 8px', gap: '4px' }}
                            onClick={(e) => handleGoToClinic(e, clinicId)}
                          >
                            <Hospital size={12} /> Go to Clinic
                          </button>
                        )}
                        <button className="btn btn-secondary" style={{ fontSize: '12px', padding: '4px 10px', gap: '4px' }}>
                          View Staff
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 4. PRESCRIPTIONS */}
          {shouldShow('prescription') && results.prescriptions.length > 0 && (
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                Prescriptions ({results.prescriptions.length})
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {results.prescriptions.map((pr) => {
                  const patientName = pr.patient_id?.full_name || 'Patient';
                  const clinicName = pr.clinic_id?.name;
                  const clinicId = pr.clinic_id?._id || pr.clinic_id;
                  return (
                    <div
                      key={pr._id}
                      onClick={() => handlePrescriptionClick(pr)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '12px 16px',
                        backgroundColor: 'var(--color-bg-secondary)',
                        border: '1px solid var(--color-border)',
                        borderRadius: '10px',
                        cursor: 'pointer'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '38px', height: '38px', borderRadius: '8px', backgroundColor: 'rgba(168, 85, 247, 0.15)', color: '#a855f7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <FileSpreadsheet size={20} />
                        </div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontWeight: '600', fontSize: '14px', color: 'var(--color-text-primary)' }}>
                              {pr.diagnosis || pr.prescription_number || 'Prescription Record'}
                            </span>
                            <span className="badge badge-info" style={{ fontSize: '10px' }}>Rx</span>
                          </div>
                          <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '2px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                            <span>Patient: <strong>{patientName}</strong></span>
                            {clinicName && <span>Clinic: <strong>{clinicName}</strong></span>}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        {isAdmin && clinicId && (
                          <button
                            type="button"
                            className="btn btn-secondary"
                            style={{ fontSize: '11px', padding: '4px 8px', gap: '4px' }}
                            onClick={(e) => handleGoToClinic(e, clinicId)}
                          >
                            <Hospital size={12} /> Go to Clinic
                          </button>
                        )}
                        <button className="btn btn-primary" style={{ fontSize: '12px', padding: '4px 10px', gap: '4px' }}>
                          <ExternalLink size={13} /> View Record
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 5. APPOINTMENTS */}
          {shouldShow('appointment') && results.appointments.length > 0 && (
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                Appointments ({results.appointments.length})
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {results.appointments.map((a) => {
                  const patientName = a.patient_id?.full_name || 'Patient';
                  const clinicName = a.clinic_id?.name;
                  const clinicId = a.clinic_id?._id || a.clinic_id;
                  const st = a.status || 'scheduled';
                  return (
                    <div
                      key={a._id}
                      onClick={() => handleAppointmentClick(a)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '12px 16px',
                        backgroundColor: 'var(--color-bg-secondary)',
                        border: '1px solid var(--color-border)',
                        borderRadius: '10px',
                        cursor: 'pointer'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '38px', height: '38px', borderRadius: '8px', backgroundColor: 'rgba(29, 158, 117, 0.15)', color: '#1D9E75', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Calendar size={20} />
                        </div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontWeight: '600', fontSize: '14px', color: 'var(--color-text-primary)' }}>{patientName}</span>
                            <span className={`badge badge-${st === 'completed' ? 'success' : st === 'cancelled' ? 'danger' : 'warning'}`} style={{ fontSize: '10px' }}>
                              {st}
                            </span>
                          </div>
                          <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '2px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                            <span>{a.date ? new Date(a.date).toLocaleDateString() : 'Today'} {a.time || a.time_slot ? `• ${a.time || a.time_slot}` : ''}</span>
                            {clinicName && <span>Clinic: <strong>{clinicName}</strong></span>}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        {isAdmin && clinicId && (
                          <button
                            type="button"
                            className="btn btn-secondary"
                            style={{ fontSize: '11px', padding: '4px 8px', gap: '4px' }}
                            onClick={(e) => handleGoToClinic(e, clinicId)}
                          >
                            <Hospital size={12} /> Go to Clinic
                          </button>
                        )}
                        <button className="btn btn-secondary" style={{ fontSize: '12px', padding: '4px 10px', gap: '4px' }}>
                          Details
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 6. TEMPLATES */}
          {shouldShow('template') && results.templates.length > 0 && (
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                Templates ({results.templates.length})
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {results.templates.map((t) => {
                  const clinicName = t.clinic_id?.name;
                  const clinicId = t.clinic_id?._id || t.clinic_id;
                  return (
                    <div
                      key={t._id}
                      onClick={() => handleTemplateClick(t)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '12px 16px',
                        backgroundColor: 'var(--color-bg-secondary)',
                        border: '1px solid var(--color-border)',
                        borderRadius: '10px',
                        cursor: 'pointer'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '38px', height: '38px', borderRadius: '8px', backgroundColor: 'rgba(55, 138, 221, 0.15)', color: '#378ADD', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <FileText size={20} />
                        </div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontWeight: '600', fontSize: '14px', color: 'var(--color-text-primary)' }}>{t.title}</span>
                            <span className="badge badge-info" style={{ fontSize: '10px' }}>{t.type || 'Template'}</span>
                          </div>
                          <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                            {t.description || 'Clinical preset template'}
                            {clinicName && ` • 🏥 ${clinicName}`}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        {isAdmin && clinicId && (
                          <button
                            type="button"
                            className="btn btn-secondary"
                            style={{ fontSize: '11px', padding: '4px 8px', gap: '4px' }}
                            onClick={(e) => handleGoToClinic(e, clinicId)}
                          >
                            <Hospital size={12} /> Go to Clinic
                          </button>
                        )}
                        <button className="btn btn-secondary" style={{ fontSize: '12px', padding: '4px 10px', gap: '4px' }}>
                          Open
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

