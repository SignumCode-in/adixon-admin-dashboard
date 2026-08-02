import React, { useState, useEffect } from 'react';
import { certificateAPI, patientAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import { FileBadge, PlusCircle, Search, Trash2, User, ArrowLeft } from 'lucide-react';

export default function Certificates() {
  const { user } = useAuth();
  const [certificates, setCertificates] = useState([]);
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
  const [type, setType] = useState('Sick Leave');
  const [content, setContent] = useState('');
  const [duration, setDuration] = useState('3 Days');
  const [remark, setRemark] = useState('');

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [certsRes, patientsRes] = await Promise.all([
        certificateAPI.getCertificates(),
        patientAPI.getPatients(),
      ]);

      if (certsRes && certsRes.data) setCertificates(certsRes.data);
      if (patientsRes && patientsRes.data) {
        setPatients(patientsRes.data);
        if (patientsRes.data.length > 0) setSelectedPatientId(patientsRes.data[0]._id);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch certificate records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Pre-fill content template based on type
  useEffect(() => {
    if (type === 'Sick Leave') {
      setContent('This is to certify that the patient is suffering from acute dental pulpitis and requires complete clinical rest to recover.');
    } else if (type === 'Fitness Certificate' || type === 'Medical Fitness') {
      setContent('This is to certify that the patient has been examined and is found medically fit to resume standard physical activities.');
    } else {
      setContent('This is to certify that the patient was under our clinical supervision and is fit to resume normal duties.');
    }
  }, [type]);

  const handleOpenAdd = () => {
    setType('Sick Leave');
    setDuration('3 Days');
    setRemark('Recommended rest & avoid heavy foods.');
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
      await certificateAPI.deleteCertificate(deleteId);
      setSuccess('Certificate record deleted successfully.');
      setDeleteModalOpen(false);
      setDeleteId(null);
      loadData();
    } catch (err) {
      setError('Failed to delete certificate entry.');
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
      certificate_type: type,
      content,
      duration,
      remark,
    };

    try {
      await certificateAPI.createCertificate(payload);
      setSuccess('Medical certificate registered successfully.');
      setViewMode('list');
      loadData();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Error occurred while saving medical certificate.');
    }
  };

  const filtered = certificates.filter((c) =>
    c.patient_id?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    c.certificate_type?.toLowerCase().includes(search.toLowerCase())
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
              <ArrowLeft size={16} /> Back to Certificates List
            </button>
            <h1 className="page-title">Generate Medical Certificate</h1>
            <p className="page-subtitle">Issue sick leave slips, fitness certs, and referral documents</p>
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

            <div className="form-row" style={{ marginBottom: '16px' }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label" style={{ fontWeight: 'bold' }}>Certificate Type *</label>
                <select className="input-field" value={type} onChange={(e) => setType(e.target.value)} required>
                  <option value="Sick Leave">Sick Leave</option>
                  <option value="Medical Leave">Medical Leave</option>
                  <option value="Fitness Certificate">Fitness Certificate</option>
                  <option value="Medical Fitness">Medical Fitness</option>
                  <option value="Referral Certificate">Referral Certificate</option>
                  <option value="Return To Work">Return To Work</option>
                  <option value="General">General Certificate</option>
                </select>
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label" style={{ fontWeight: 'bold' }}>Validity Duration</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. 5 Days"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label className="form-label" style={{ fontWeight: 'bold' }}>Content Body Text *</label>
              <textarea
                className="input-field"
                style={{ height: '90px', fontFamily: 'inherit', resize: 'none' }}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: '24px' }}>
              <label className="form-label" style={{ fontWeight: 'bold' }}>Practitioner Remarks</label>
              <input
                type="text"
                className="input-field"
                placeholder="Avoid strenuous physical actions..."
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setViewMode('list')}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={patients.length === 0}>
                Generate & Issue Slip
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
          <h1 className="page-title">Medical Certificates</h1>
          <p className="page-subtitle">Generate sick leave slips, physical fitness documents, and referral forms</p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenAdd}>
          <PlusCircle size={14} /> Create Certificate
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
            placeholder="Search by patient or type..."
            style={{ paddingLeft: '32px' }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Search size={14} style={{ position: 'absolute', left: '10px', top: '12px', color: 'var(--color-text-tertiary)' }} />
        </div>
      </div>

      <div className="table-responsive">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-tertiary)' }}>Loading certificates database...</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-tertiary)' }}>No certificate records registered.</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Certificate Type</th>
                <th>Duration Validity</th>
                <th>Content Text</th>
                <th>Doctor</th>
                <th>Issue Date</th>
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
                  <td>
                    <span className="badge badge-warning" style={{ textTransform: 'capitalize' }}>
                      {c.certificate_type}
                    </span>
                  </td>
                  <td>{c.duration || 'N/A'}</td>
                  <td style={{ fontSize: '12px', maxWidth: '300px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                    {c.content}
                  </td>
                  <td>{c.doctor_id?.full_name || 'Clinic Doctor'}</td>
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
        title="Revoke Certificate"
        message="Are you sure you want to delete/revoke this medical certificate record?"
        loading={deleteLoading}
      />
    </div>
  );
}
