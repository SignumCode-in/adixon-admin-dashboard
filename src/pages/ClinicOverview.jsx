import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Hospital, Users, Calendar, FileSpreadsheet, MapPin, Phone, Mail, Stethoscope, ArrowLeft } from 'lucide-react';
import { clinicAPI, patientAPI, appointmentAPI, prescriptionAPI, userAPI } from '../services/api';

export default function ClinicOverview() {
  const { clinicId } = useParams();
  const [clinic, setClinic] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [stats, setStats] = useState({
    patientsCount: 0,
    appointmentsCount: 0,
    prescriptionsCount: 0,
  });
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
        patientAPI.getPatients({ clinic_id: clinicId }),
        appointmentAPI.getAppointments({ clinic_id: clinicId }),
        prescriptionAPI.getPrescriptions({ clinic_id: clinicId }),
      ]);

      if (clinicRes.status === 'fulfilled') {
        const cData = clinicRes.value?.data?.data || clinicRes.value?.data;
        setClinic(cData);
        setDoctors(cData?.doctors || []);
      }

      const pList = patientsRes.status === 'fulfilled' ? (patientsRes.value?.data?.data || patientsRes.value?.data || []) : [];
      const aList = apptsRes.status === 'fulfilled' ? (apptsRes.value?.data?.data || apptsRes.value?.data || []) : [];
      const prList = prescRes.status === 'fulfilled' ? (prescRes.value?.data?.data || prescRes.value?.data || []) : [];

      setStats({
        patientsCount: Array.isArray(pList) ? pList.length : 0,
        appointmentsCount: Array.isArray(aList) ? aList.length : 0,
        prescriptionsCount: Array.isArray(prList) ? prList.length : 0,
      });
    } catch (err) {
      console.error('Error loading clinic overview:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Loading clinic statistics...</div>;
  }

  if (!clinic) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h2>Clinic Not Found</h2>
        <Link to="/clinics" className="btn btn-secondary" style={{ marginTop: '16px' }}>
          <ArrowLeft size={14} /> Back to Clinics Directory
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header" style={{ marginBottom: '20px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <Link to="/clinics" style={{ textDecoration: 'none', color: 'var(--color-primary)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <ArrowLeft size={14} /> All Clinics
            </Link>
          </div>
          <h1 className="page-title">{clinic.name}</h1>
          <p className="page-subtitle">Dedicated Clinic Dashboard & Statistics</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="kpi-row" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', marginBottom: '24px' }}>
        <div className="card kpi-card">
          <div className="kpi-details">
            <span className="kpi-label">Clinic Patients</span>
            <span className="kpi-value">{stats.patientsCount}</span>
            <span className="kpi-trend up">Registered in clinic</span>
          </div>
          <div className="kpi-icon-wrapper" style={{ backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)' }}>
            <Users size={20} />
          </div>
        </div>

        <div className="card kpi-card">
          <div className="kpi-details">
            <span className="kpi-label">Appointments</span>
            <span className="kpi-value">{stats.appointmentsCount}</span>
            <span className="kpi-trend up">Total booked</span>
          </div>
          <div className="kpi-icon-wrapper" style={{ backgroundColor: 'var(--color-success-light)', color: 'var(--color-success)' }}>
            <Calendar size={20} />
          </div>
        </div>

        <div className="card kpi-card">
          <div className="kpi-details">
            <span className="kpi-label">Prescriptions</span>
            <span className="kpi-value">{stats.prescriptionsCount}</span>
            <span className="kpi-trend up">Issued by doctors</span>
          </div>
          <div className="kpi-icon-wrapper" style={{ backgroundColor: 'var(--color-info-light)', color: 'var(--color-info)' }}>
            <FileSpreadsheet size={20} />
          </div>
        </div>

        <div className="card kpi-card">
          <div className="kpi-details">
            <span className="kpi-label">Doctors & Staff</span>
            <span className="kpi-value">{doctors.length || 1}</span>
            <span className="kpi-trend up">Medical Personnel</span>
          </div>
          <div className="kpi-icon-wrapper" style={{ backgroundColor: 'rgba(168, 85, 247, 0.15)', color: '#a855f7' }}>
            <Stethoscope size={20} />
          </div>
        </div>
      </div>

      {/* Info & Doctors Grid */}
      <div className="charts-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
        {/* Clinic Info */}
        <div className="card">
          <h3 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '16px', borderBottom: '1px solid var(--color-border)', paddingBottom: '10px' }}>
            Clinic Information
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <Phone size={16} style={{ color: 'var(--color-primary)' }} />
              <div>
                <div style={{ color: 'var(--color-text-tertiary)', fontSize: '11px' }}>Phone Number</div>
                <div style={{ fontWeight: '500' }}>{clinic.phone || 'N/A'}</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <Mail size={16} style={{ color: 'var(--color-primary)' }} />
              <div>
                <div style={{ color: 'var(--color-text-tertiary)', fontSize: '11px' }}>Email Address</div>
                <div style={{ fontWeight: '500' }}>{clinic.email || 'N/A'}</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <MapPin size={16} style={{ color: 'var(--color-primary)' }} />
              <div>
                <div style={{ color: 'var(--color-text-tertiary)', fontSize: '11px' }}>Address</div>
                <div style={{ fontWeight: '500' }}>{clinic.address || clinic.city || 'Location Address N/A'}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Doctors List */}
        <div className="card">
          <h3 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '16px', borderBottom: '1px solid var(--color-border)', paddingBottom: '10px' }}>
            Assigned Doctors ({doctors.length})
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {doctors.map((doc) => (
              <div key={doc._id} style={{ display: 'flex', alignItems: 'center', justifyBetween: 'space-between', padding: '10px', background: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div className="sidebar-user-avatar" style={{ width: '36px', height: '36px' }}>
                    {doc.full_name ? doc.full_name[0] : 'D'}
                  </div>
                  <div>
                    <div style={{ fontWeight: '600', fontSize: '13px' }}>{doc.full_name}</div>
                    <div style={{ fontSize: '11px', color: 'var(--color-text-tertiary)' }}>{doc.qualification || 'Medical Practitioner'}</div>
                  </div>
                </div>
                <span className="badge badge-success" style={{ marginLeft: 'auto', fontSize: '10px' }}>Active</span>
              </div>
            ))}
            {doctors.length === 0 && (
              <div style={{ color: 'var(--color-text-tertiary)', fontSize: '13px', textAlign: 'center', padding: '20px 0' }}>
                No registered doctors attached to this clinic yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
