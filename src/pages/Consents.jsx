import React, { useState, useEffect } from 'react';
import { consentAPI, patientAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import { ClipboardCheck, PlusCircle, Search, Trash2, User, ArrowLeft } from 'lucide-react';

export default function Consents() {
  const { user } = useAuth();
  const [consents, setConsents] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Search
  const [search, setSearch] = useState('');

  // View Mode: 'list' | 'editor'
  const [viewMode, setViewMode] = useState('list');

  // Delete Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Form Fields
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [title, setTitle] = useState('Dental Surgery Consent');
  const [content, setContent] = useState('');
  const [patientSignature, setPatientSignature] = useState('');
  const [doctorSignature, setDoctorSignature] = useState('');

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [consRes, patientsRes] = await Promise.all([
        consentAPI.getConsents(),
        patientAPI.getPatients(),
      ]);

      if (consRes && consRes.data) setConsents(consRes.data);
      if (patientsRes && patientsRes.data) {
        setPatients(patientsRes.data);
        if (patientsRes.data.length > 0) setSelectedPatientId(patientsRes.data[0]._id);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch patient consent forms database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Pre-fill content template based on title selection
  useEffect(() => {
    if (title === 'Dental Surgery Consent') {
      setContent('I hereby authorize the clinical doctor to perform dental extraction and surgery procedures. I have been informed of the associated risks and post-extraction guidelines.');
    } else if (title === 'Anesthesia Consent') {
      setContent('I authorize the administration of local anesthesia for clinical dental procedures. I understand risks include temporary numbness and soreness.');
    } else {
      setContent('I hereby consent to undergo dental checkup and necessary non-surgical clinic treatments proposed by the duty doctor.');
    }
  }, [title]);

  const handleOpenAdd = () => {
    setTitle('Dental Surgery Consent');
    setPatientSignature('Rahul Sharma');
    setDoctorSignature(user?.full_name || 'Dr. Practitioner');
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
      await consentAPI.deleteConsent(deleteId);
      setSuccess('Consent form deleted successfully.');
      setDeleteModalOpen(false);
      setDeleteId(null);
      loadData();
    } catch (err) {
      setError('Failed to delete consent entry.');
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
      doctor_id: user?._id || '6a55ce3df5878a83c6b4e275',
      clinic_id: user?.clinic_id || '6a55ce3cf5878a83c6b4e274',
      title,
      content,
      patient_signature: patientSignature,
      doctor_signature: doctorSignature,
    };

    try {
      await consentAPI.createConsent(payload);
      setSuccess('Patient consent recorded successfully.');
      setViewMode('list');
      loadData();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Error saving patient consent form details.');
    }
  };

  const filtered = consents.filter((c) =>
    c.title?.toLowerCase().includes(search.toLowerCase()) ||
    c.patient_id?.full_name?.toLowerCase().includes(search.toLowerCase())
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
              <ArrowLeft size={16} /> Back to Consent Forms List
            </button>
            <h1 className="page-title">Record Patient Waiver Consent</h1>
            <p className="page-subtitle">Log legally binding patient procedure waivers and e-signatures</p>
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
              <label className="form-label" style={{ fontWeight: 'bold' }}>Patient Profile *</label>
              <select className="input-field" value={selectedPatientId} onChange={(e) => setSelectedPatientId(e.target.value)} required>
                {patients.map((p) => (
                  <option key={p._id} value={p._id}>{p.full_name}</option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label className="form-label" style={{ fontWeight: 'bold' }}>Consent Category Title *</label>
              <select className="input-field" value={title} onChange={(e) => setTitle(e.target.value)} required>
                <option value="Dental Surgery Consent">Dental Surgery Consent</option>
                <option value="Anesthesia Consent">Anesthesia Consent</option>
                <option value="General Diagnostics Consent">General Diagnostics Consent</option>
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label className="form-label" style={{ fontWeight: 'bold' }}>Consent Content Text *</label>
              <textarea
                className="input-field"
                style={{ height: '90px', fontFamily: 'inherit', resize: 'none' }}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
              />
            </div>

            <div className="form-row" style={{ marginBottom: '24px' }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label" style={{ fontWeight: 'bold' }}>Patient E-Signature *</label>
                <input
                  type="text"
                  className="input-field"
                  value={patientSignature}
                  onChange={(e) => setPatientSignature(e.target.value)}
                  required
                />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label" style={{ fontWeight: 'bold' }}>Doctor Witness E-Signature *</label>
                <input
                  type="text"
                  className="input-field"
                  value={doctorSignature}
                  onChange={(e) => setDoctorSignature(e.target.value)}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setViewMode('list')}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={patients.length === 0}>
                Record Signed Consent
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
          <h1 className="page-title">Patient Consent Forms</h1>
          <p className="page-subtitle">Track signed medical waivers, anesthesia consents, and surgical agreements</p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenAdd}>
          <PlusCircle size={14} /> Log Consent Form
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

      <div className="card" style={{ padding: '12px 16px', marginBottom: '16px', display: 'flex', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: '300px' }}>
          <input
            type="text"
            className="input-field"
            placeholder="Search by patient name or title..."
            style={{ paddingLeft: '32px' }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Search size={14} style={{ position: 'absolute', left: '10px', top: '12px', color: 'var(--color-text-tertiary)' }} />
        </div>
      </div>

      <div className="table-responsive">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-tertiary)' }}>Loading consents database...</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-tertiary)' }}>No patient consents logged.</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Consent Title</th>
                <th>Content Text</th>
                <th>Patient Signature</th>
                <th>Doctor Witness</th>
                <th>Signed Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c._id}>
                  <td style={{ fontWeight: 'bold' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <User size={16} color="var(--color-primary)" />
                      {c.patient_id?.full_name || 'Walk-in'}
                    </span>
                  </td>
                  <td>{c.title}</td>
                  <td style={{ fontSize: '11px', maxWidth: '300px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                    {c.content}
                  </td>
                  <td style={{ fontStyle: 'italic', fontFamily: 'cursive' }}>{c.patient_signature || 'Not Signed'}</td>
                  <td>{c.doctor_signature || 'N/A'}</td>
                  <td>{new Date(c.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button className="icon-btn" style={{ color: 'var(--color-danger)' }} onClick={() => triggerDelete(c._id)}>
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Delete Confirmation Popup Dialog Modal */}
      <ConfirmDeleteModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setDeleteId(null);
        }}
        onConfirm={confirmDelete}
        title="Delete Consent Waiver"
        message="Are you sure you want to delete this patient consent record?"
        loading={deleteLoading}
      />
    </div>
  );
}
