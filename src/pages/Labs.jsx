import React, { useState, useEffect } from 'react';
import { labAPI, patientAPI, prescriptionAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import { FlaskConical, PlusCircle, Search, Trash2, User, ArrowLeft } from 'lucide-react';

export default function Labs() {
  const { user } = useAuth();
  const [labs, setLabs] = useState([]);
  const [patients, setPatients] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
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
  const [selectedPresId, setSelectedPresId] = useState('');
  const [testInput, setTestInput] = useState(''); // Comma separated

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [labsRes, patientsRes, presRes] = await Promise.all([
        labAPI.getLabs(),
        patientAPI.getPatients(),
        prescriptionAPI.getPrescriptions(),
      ]);

      if (labsRes && labsRes.data) setLabs(labsRes.data);
      if (patientsRes && patientsRes.data) {
        setPatients(patientsRes.data);
        if (patientsRes.data.length > 0) setSelectedPatientId(patientsRes.data[0]._id);
      }
      if (presRes && presRes.data) {
        setPrescriptions(presRes.data);
        if (presRes.data.length > 0) setSelectedPresId(presRes.data[0]._id);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch lab logs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAdd = () => {
    setTestInput('CBC, Blood Sugar, Urine Routine');
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
      await labAPI.deleteLab(deleteId);
      setSuccess('Lab order deleted successfully.');
      setDeleteModalOpen(false);
      setDeleteId(null);
      loadData();
    } catch (err) {
      setError('Failed to delete lab order.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const testArray = testInput.split(',').map((t) => t.trim()).filter((t) => t.length > 0);
    if (testArray.length === 0) {
      setError('You must input at least one lab test.');
      return;
    }

    const payload = {
      patient_id: selectedPatientId,
      doctor_id: user?._id || '6a55ce3df5878a83c6b4e275',
      clinic_id: user?.clinic_id || '6a55ce3cf5878a83c6b4e274',
      prescription_id: selectedPresId || '6a55ce3df5878a83c6b4e277',
      lab_test: testArray,
    };

    try {
      await labAPI.createLab(payload);
      setSuccess('Lab test order placed successfully.');
      setViewMode('list');
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Error occurred while booking lab tests.');
    }
  };

  // Helper to safely format prescription reference tag
  const getPrescriptionRef = (l) => {
    if (!l.prescription_id) return 'CORE_RX';
    const idStr = typeof l.prescription_id === 'object' 
      ? String(l.prescription_id._id || '') 
      : String(l.prescription_id);
    return idStr ? `#${idStr.slice(-6).toUpperCase()}` : 'CORE_RX';
  };

  const filtered = labs.filter((l) => {
    const patientName = l.patient_id?.full_name || l.patient_id?.name || '';
    const testNames = Array.isArray(l.lab_test) ? l.lab_test.join(', ') : String(l.lab_test || '');
    return (
      patientName.toLowerCase().includes(search.toLowerCase()) ||
      testNames.toLowerCase().includes(search.toLowerCase())
    );
  });

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
              <ArrowLeft size={16} /> Back to Orders List
            </button>
            <h1 className="page-title">Order Diagnostic Lab Tests</h1>
            <p className="page-subtitle">Request pathology, blood tests, and radiology diagnostic scans</p>
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
              <label className="form-label" style={{ fontWeight: 'bold' }}>Prescription Reference *</label>
              <select className="input-field" value={selectedPresId} onChange={(e) => setSelectedPresId(e.target.value)} required>
                {prescriptions.map((pr) => (
                  <option key={pr._id} value={pr._id}>
                    Rx Date: {new Date(pr.createdAt).toLocaleDateString()} ({pr.clinical?.diagnosis || 'Diagnosis'})
                  </option>
                ))}
                {prescriptions.length === 0 && (
                  <option value="">No prescription reference found</option>
                )}
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: '24px' }}>
              <label className="form-label" style={{ fontWeight: 'bold' }}>Lab Tests (Comma-separated) *</label>
              <input
                type="text"
                className="input-field"
                placeholder="e.g. CBC, Lipid Profile, Thyroid T3 T4"
                value={testInput}
                onChange={(e) => setTestInput(e.target.value)}
                required
              />
              <span style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', marginTop: '4px', display: 'block' }}>
                Separate multiple test codes with a comma.
              </span>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setViewMode('list')}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={patients.length === 0}>
                Place Lab Order
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
          <h1 className="page-title">Lab Test Orders</h1>
          <p className="page-subtitle">Track patient blood tests, radiology scans, and pathology requests</p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenAdd}>
          <PlusCircle size={14} /> Order Lab Test
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
            placeholder="Search by patient or test name..."
            style={{ paddingLeft: '32px' }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Search size={14} style={{ position: 'absolute', left: '10px', top: '12px', color: 'var(--color-text-tertiary)' }} />
        </div>
      </div>

      <div className="table-responsive">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-tertiary)' }}>Loading lab logs...</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-tertiary)' }}>No lab test orders logged.</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Requested Lab Tests</th>
                <th>Prescription Reference</th>
                <th>Doctor</th>
                <th>Date Ordered</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((l) => (
                <tr key={l._id}>
                  <td style={{ fontWeight: 'bold' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <User size={16} color="var(--color-primary)" />
                      {l.patient_id?.full_name || 'Walk-in'}
                    </span>
                  </td>
                  <td>
                    {Array.isArray(l.lab_test) ? (
                      l.lab_test.map((t) => (
                        <span key={t} className="badge badge-info" style={{ marginRight: '4px' }}>{t}</span>
                      ))
                    ) : (
                      <span className="badge badge-info">{String(l.lab_test || 'General Lab')}</span>
                    )}
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '11px' }}>
                    {getPrescriptionRef(l)}
                  </td>
                  <td>{l.doctor_id?.full_name || 'Clinic Doctor'}</td>
                  <td>{new Date(l.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button className="icon-btn" style={{ color: 'var(--color-danger)' }} onClick={() => triggerDelete(l._id)}>
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
        title="Delete Lab Order"
        message="Are you sure you want to delete this lab order record?"
        loading={deleteLoading}
      />
    </div>
  );
}
