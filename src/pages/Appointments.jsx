import React, { useState, useEffect } from 'react';
import { appointmentAPI, patientAPI, userAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useActiveClinicScope } from '../hooks/useActiveClinicScope';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import ViewToggle from '../components/common/ViewToggle';
import { Calendar, PlusCircle, Search, Clock, User, ArrowLeft, Trash2, Edit2, Stethoscope, Building } from 'lucide-react';

export default function Appointments() {
  const { user } = useAuth();
  const activeClinicId = useActiveClinicScope();
  const [displayMode, setDisplayMode] = useState(() => localStorage.getItem('adixon_view_mode_appts') || 'list');
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Search
  const [search, setSearch] = useState('');

  // View Mode: 'list' | 'editor'
  const [viewMode, setViewMode] = useState('list');
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState(null);

  // Delete Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Form states
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('10:00 AM');
  const [notes, setNotes] = useState('');

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const queryParams = { limit: 1000 };
      if (activeClinicId && activeClinicId !== 'all') {
        queryParams.clinic_id = activeClinicId;
      }
      const [apptsRes, patientsRes, usersRes] = await Promise.all([
        appointmentAPI.getAppointments(queryParams),
        patientAPI.getPatients(queryParams),
        userAPI.getUsers(queryParams),
      ]);

      if (apptsRes && apptsRes.data) setAppointments(apptsRes.data);
      if (patientsRes && patientsRes.data) {
        setPatients(patientsRes.data);
        if (patientsRes.data.length > 0) setSelectedPatientId(patientsRes.data[0]._id);
      }
      if (usersRes && usersRes.data) {
        const filteredDocs = usersRes.data.filter((u) => u.role === 'doctor');
        setDoctors(filteredDocs);
        if (filteredDocs.length > 0) setSelectedDoctorId(filteredDocs[0]._id);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch schedule records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeClinicId]);

  const handleOpenAdd = () => {
    setIsEdit(false);
    setEditId(null);
    setDate(new Date().toISOString().substring(0, 10));
    setTime('10:00 AM');
    setNotes('');
    setError('');
    setViewMode('editor');
  };

  const handleOpenEdit = (a) => {
    setIsEdit(true);
    setEditId(a._id);
    setSelectedPatientId(a.patient_id?._id || selectedPatientId);
    setSelectedDoctorId(a.doctor_id?._id || selectedDoctorId);
    setDate(a.date ? a.date.substring(0, 10) : '');
    setTime(a.time || '10:00 AM');
    setNotes(a.notes || '');
    setError('');
    setViewMode('editor');
  };

  const triggerDelete = (id) => {
    setDeleteId(id);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    setDeleteLoading(true);
    try {
      await appointmentAPI.deleteAppointment(deleteId);
      setSuccess('Appointment slot cancelled/deleted successfully.');
      setDeleteModalOpen(false);
      setDeleteId(null);
      loadData();
    } catch (err) {
      setError('Failed to delete appointment slot.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const payload = {
      patient_id: selectedPatientId,
      doctor_id: selectedDoctorId,
      clinic_id: user?.clinic_id || '6a55ce3cf5878a83c6b4e274',
      date,
      time,
      notes,
    };

    try {
      if (isEdit) {
        await appointmentAPI.updateAppointment(editId, payload);
        setSuccess('Appointment slot updated successfully.');
      } else {
        await appointmentAPI.createAppointment(payload);
        setSuccess('Appointment slot booked successfully.');
      }
      setViewMode('list');
      loadData();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Error booking appointment slot.');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed': return 'badge-success';
      case 'cancelled': return 'badge-danger';
      case 'rescheduled': return 'badge-warning';
      default: return 'badge-info';
    }
  };

  const filtered = appointments.filter((a) =>
    a.patient_id?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    a.doctor_id?.full_name?.toLowerCase().includes(search.toLowerCase())
  );

  // Full Page Screen Editor
  if (viewMode === 'editor') {
    return (
      <div>
        <div className="page-header" style={{ marginBottom: '20px' }}>
          <div>
            <button 
              className="btn btn-secondary" 
              onClick={() => setViewMode('list')} 
              style={{ padding: '6px 12px', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}
            >
              <ArrowLeft size={16} /> Back to Schedule List
            </button>
            <h1 className="page-title">{isEdit ? 'Edit Consultation Slot' : 'Book New Consultation Slot'}</h1>
            <p className="page-subtitle">Schedule consultation dates, practitioner slots, and clinical symptom notes</p>
          </div>
        </div>

        <div className="card" style={{ width: '100%', padding: '24px', borderRadius: '16px' }}>
          {error && (
            <div className="badge badge-danger" style={{ display: 'block', width: '100%', padding: '12px', borderRadius: '8px', marginBottom: '20px' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleFormSubmit}>
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label className="form-label" style={{ fontWeight: 'bold' }}>Select Patient *</label>
              <select className="input-field" value={selectedPatientId} onChange={(e) => setSelectedPatientId(e.target.value)} required>
                {patients.map((p) => (
                  <option key={p._id} value={p._id}>{p.full_name} ({p.phone})</option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label className="form-label" style={{ fontWeight: 'bold' }}>Assigned Practitioner Doctor *</label>
              <select className="input-field" value={selectedDoctorId} onChange={(e) => setSelectedDoctorId(e.target.value)} required>
                {doctors.map((d) => (
                  <option key={d._id} value={d._id}>{d.full_name} ({d.qualification || 'Doctor'})</option>
                ))}
                {doctors.length === 0 && user && (
                  <option value={user._id}>{user.full_name}</option>
                )}
              </select>
            </div>

            <div className="form-row" style={{ marginBottom: '16px' }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label" style={{ fontWeight: 'bold' }}>Appointment Date *</label>
                <input
                  type="date"
                  className="input-field"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label" style={{ fontWeight: 'bold' }}>Time Slot *</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. 10:00 AM"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '24px' }}>
              <label className="form-label" style={{ fontWeight: 'bold' }}>Chief Complaints / Symptom Notes</label>
              <textarea
                className="input-field"
                style={{ height: '80px', fontFamily: 'inherit', resize: 'none' }}
                placeholder="Describe chief complaints..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setViewMode('list')}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={patients.length === 0}>
                {isEdit ? 'Save Changes' : 'Book Appointment Slot'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Appointment Scheduling</h1>
          <p className="page-subtitle">Schedule consultation dates, slots times, and notes logs</p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenAdd}>
          <PlusCircle size={14} /> Schedule Appointment
        </button>
      </div>

      {success && (
        <div className="badge badge-success" style={{ display: 'block', width: '100%', padding: '10px', borderRadius: '6px', marginBottom: '16px' }}>
          {success}
        </div>
      )}

      {error && (
        <div className="badge badge-danger" style={{ display: 'block', width: '100%', padding: '10px', borderRadius: '6px', marginBottom: '16px' }}>
          {error}
        </div>
      )}

      <div className="card" style={{ padding: '12px 16px', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: '320px' }}>
          <input
            type="text"
            className="input-field"
            placeholder="Search by patient or doctor..."
            style={{ paddingLeft: '32px' }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Search size={14} style={{ position: 'absolute', left: '10px', top: '12px', color: 'var(--color-text-tertiary)' }} />
        </div>
        <ViewToggle 
          mode={displayMode} 
          onChange={(m) => {
            setDisplayMode(m);
            localStorage.setItem('adixon_view_mode_appts', m);
          }} 
        />
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-tertiary)' }}>Loading schedule slots...</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-tertiary)' }}>No appointments scheduled.</div>
      ) : displayMode === 'grid' ? (
        <div className="records-grid">
          {filtered.map((a) => (
            <div key={a._id} className="record-card">
              <div className="record-card-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'var(--color-primary-light)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                    {(a.patient_id?.full_name || 'W').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontWeight: '600', fontSize: '14px', color: 'var(--color-text-primary)' }}>
                      {a.patient_id?.full_name || 'Walk-in Patient'}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--color-text-tertiary)' }}>
                      {a.patient_id?.phone || 'No phone'}
                    </div>
                  </div>
                </div>
                <span className={`badge ${getStatusBadge(a.status)}`} style={{ fontSize: '11px' }}>
                  {a.status}
                </span>
              </div>

              <div className="record-card-body">
                <div className="record-card-row">
                  <Stethoscope size={14} style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
                  <span>Doctor: <strong>{a.doctor_id?.full_name || 'Duty Doctor'}</strong></span>
                </div>
                <div className="record-card-row">
                  <Building size={14} style={{ color: 'var(--color-text-tertiary)', flexShrink: 0 }} />
                  <span>Clinic: {a.clinic_id?.name || 'Shared Core'}</span>
                </div>
                <div className="record-card-row">
                  <Clock size={14} style={{ color: 'var(--color-warning)', flexShrink: 0 }} />
                  <span>Date & Time: {new Date(a.date).toLocaleDateString()} at {a.time}</span>
                </div>
                {a.notes && (
                  <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', background: 'var(--color-bg-secondary)', padding: '6px 8px', borderRadius: '6px', marginTop: '4px' }}>
                    💬 {a.notes}
                  </div>
                )}
              </div>

              <div className="record-card-footer">
                <span style={{ fontSize: '11px', color: 'var(--color-text-tertiary)' }}>
                  ID: {a._id.slice(-6)}
                </span>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '11px', gap: '4px' }} onClick={() => handleOpenEdit(a)}>
                    <Edit2 size={12} /> Edit
                  </button>
                  <button className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '11px', gap: '4px', color: 'var(--color-danger)' }} onClick={() => triggerDelete(a._id)}>
                    <Trash2 size={12} /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Doctor</th>
                <th>Clinic</th>
                <th>Date / Time</th>
                <th>Notes</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a) => (
                <tr key={a._id}>
                  <td style={{ fontWeight: 'bold' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <User size={16} color="var(--color-primary)" />
                      {a.patient_id?.full_name || 'Walk-in'}
                    </span>
                  </td>
                  <td>{a.doctor_id?.full_name || 'Duty Doctor'}</td>
                  <td>{a.clinic_id?.name || 'Shared Core'}</td>
                  <td>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}>
                      <Clock size={12} color="var(--color-text-tertiary)" />
                      {new Date(a.date).toLocaleDateString()} at {a.time}
                    </span>
                  </td>
                  <td style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>{a.notes || 'No description'}</td>
                  <td>
                    <span className={`badge ${getStatusBadge(a.status)}`}>
                      {a.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button className="icon-btn" onClick={() => handleOpenEdit(a)} title="Edit appointment">
                        <Edit2 size={14} />
                      </button>
                      <button className="icon-btn" style={{ color: 'var(--color-danger)' }} onClick={() => triggerDelete(a._id)} title="Delete appointment">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete Confirmation Popup Dialog Modal */}
      <ConfirmDeleteModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setDeleteId(null);
        }}
        onConfirm={confirmDelete}
        title="Cancel Appointment Slot"
        message="Are you sure you want to delete/cancel this booked appointment slot?"
        loading={deleteLoading}
      />
    </div>
  );
}
