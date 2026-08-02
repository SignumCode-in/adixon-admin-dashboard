import React, { useState, useEffect } from 'react';
import { prescriptionAPI, patientAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import { FileSpreadsheet, PlusCircle, Search, User, ArrowLeft, Trash2 } from 'lucide-react';

export default function Prescriptions() {
  const { user } = useAuth();
  const [prescriptions, setPrescriptions] = useState([]);
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

  // Form states
  const [selectedPatientId, setSelectedPatientId] = useState('');
  
  // Vitals
  const [temp, setTemp] = useState('');
  const [bp, setBp] = useState('');
  const [pulse, setPulse] = useState('');
  const [spo2, setSpo2] = useState('');
  const [weight, setWeight] = useState('');
  
  // Clinical
  const [complaint, setComplaint] = useState('');
  const [history, setHistory] = useState('');
  const [findings, setFindings] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [treatment, setTreatment] = useState('');

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [presRes, patientsRes] = await Promise.all([
        prescriptionAPI.getPrescriptions(),
        patientAPI.getPatients(),
      ]);

      if (presRes && presRes.data) setPrescriptions(presRes.data);
      if (patientsRes && patientsRes.data) {
        setPatients(patientsRes.data);
        if (patientsRes.data.length > 0) setSelectedPatientId(patientsRes.data[0]._id);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch prescription records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAdd = () => {
    setTemp('98.6');
    setBp('120/80');
    setPulse('72');
    setSpo2('98');
    setWeight('65');
    setComplaint('');
    setHistory('');
    setFindings('');
    setDiagnosis('');
    setTreatment('');
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
      await prescriptionAPI.deletePrescription(deleteId);
      setSuccess('Prescription deleted successfully.');
      setDeleteModalOpen(false);
      setDeleteId(null);
      loadData();
    } catch (err) {
      setError('Failed to delete prescription.');
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
      vitals: {
        temperature: temp,
        blood_pressure: bp,
        pulse_rate: pulse ? Number(pulse) : null,
        spo2: spo2 ? Number(spo2) : null,
        weight: weight ? Number(weight) : null,
      },
      clinical: {
        chief_complaint: complaint,
        patient_history: history,
        findings,
        diagnosis,
        treatment,
      }
    };

    try {
      await prescriptionAPI.createPrescription(payload);
      setSuccess('Prescription document saved successfully.');
      setViewMode('list');
      loadData();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Error occurred while saving prescription details.');
    }
  };

  const filtered = prescriptions.filter((p) =>
    p.patient_id?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    p.clinical?.diagnosis?.toLowerCase().includes(search.toLowerCase())
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
              <ArrowLeft size={16} /> Back to Prescriptions List
            </button>
            <h1 className="page-title">Write Rx Prescription Document</h1>
            <p className="page-subtitle">Record clinical vitals, chief complaints, diagnosis, and prescribed medicine schedules</p>
          </div>
        </div>

        <div className="card" style={{ width: '100%', padding: '24px', borderRadius: '16px' }}>
          {error && (
            <div className="badge badge-danger" style={{ display: 'block', width: '100%', padding: '12px', borderRadius: '8px', marginBottom: '20px' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleFormSubmit}>
            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label className="form-label" style={{ fontWeight: 'bold' }}>Patient Profile *</label>
              <select className="input-field" value={selectedPatientId} onChange={(e) => setSelectedPatientId(e.target.value)} required>
                {patients.map((p) => (
                  <option key={p._id} value={p._id}>{p.full_name} ({p.phone})</option>
                ))}
              </select>
            </div>

            <h4 style={{ fontSize: '14px', fontWeight: 'bold', margin: '20px 0 12px', color: 'var(--color-primary)' }}>1. Patient Vitals</h4>
            <div className="form-row" style={{ marginBottom: '12px' }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">BP (mmHg)</label>
                <input type="text" className="input-field" placeholder="120/80" value={bp} onChange={(e) => setBp(e.target.value)} />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">Pulse Rate (bpm)</label>
                <input type="number" className="input-field" placeholder="72" value={pulse} onChange={(e) => setPulse(e.target.value)} />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">Body Temp (°F)</label>
                <input type="text" className="input-field" placeholder="98.6" value={temp} onChange={(e) => setTemp(e.target.value)} />
              </div>
            </div>

            <div className="form-row" style={{ marginBottom: '20px' }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">SPO2 (%)</label>
                <input type="number" className="input-field" placeholder="98" value={spo2} onChange={(e) => setSpo2(e.target.value)} />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">Body Weight (kg)</label>
                <input type="number" className="input-field" placeholder="65" value={weight} onChange={(e) => setWeight(e.target.value)} />
              </div>
            </div>

            <h4 style={{ fontSize: '14px', fontWeight: 'bold', margin: '20px 0 12px', color: 'var(--color-primary)' }}>2. Clinical Findings & Diagnosis</h4>
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label className="form-label">Chief Complaint *</label>
              <input type="text" className="input-field" placeholder="Tooth pain, bleeding gums" value={complaint} onChange={(e) => setComplaint(e.target.value)} required />
            </div>

            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label className="form-label">Clinical Diagnosis *</label>
              <input type="text" className="input-field" placeholder="e.g. Gingivitis, Acute Pulpitis" value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} required />
            </div>

            <div className="form-group" style={{ marginBottom: '24px' }}>
              <label className="form-label">Rx Treatment Plan (Medicines, Dosage & Schedule) *</label>
              <textarea
                className="input-field"
                style={{ height: '100px', fontFamily: 'inherit', resize: 'none' }}
                placeholder="e.g. Tab Amoxicillin 500mg - 3 times a day for 5 days after meals"
                value={treatment}
                onChange={(e) => setTreatment(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setViewMode('list')}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={patients.length === 0}>
                Save Prescription Document
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
          <h1 className="page-title">Prescriptions Directory</h1>
          <p className="page-subtitle">Record clinical vitals, symptom checks, diagnoses, and treatments guidelines</p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenAdd}>
          <PlusCircle size={14} /> Write Prescription
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
            placeholder="Search by patient or diagnosis..."
            style={{ paddingLeft: '32px' }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Search size={14} style={{ position: 'absolute', left: '10px', top: '12px', color: 'var(--color-text-tertiary)' }} />
        </div>
      </div>

      <div className="table-responsive">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-tertiary)' }}>Loading prescriptions...</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-tertiary)' }}>No prescriptions documented.</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Vitals Checked</th>
                <th>Chief Complaints</th>
                <th>Diagnosis Summary</th>
                <th>Treatment Prescribed</th>
                <th>Doctor</th>
                <th>Created Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p._id}>
                  <td style={{ fontWeight: 'bold' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <User size={16} color="var(--color-primary)" />
                      {p.patient_id?.full_name || 'Walk-in'}
                    </span>
                  </td>
                  <td style={{ fontSize: '11px', lineHeight: 1.3 }}>
                    BP: {p.vitals?.blood_pressure || 'N/A'}<br />
                    PR: {p.vitals?.pulse_rate || 'N/A'} bpm<br />
                    Temp: {p.vitals?.temperature || 'N/A'} °F
                  </td>
                  <td>{p.clinical?.chief_complaint || 'N/A'}</td>
                  <td>
                    <span className="badge badge-warning" style={{ textTransform: 'capitalize' }}>
                      {p.clinical?.diagnosis || 'Unspecified'}
                    </span>
                  </td>
                  <td style={{ fontSize: '12px' }}>{p.clinical?.treatment || 'N/A'}</td>
                  <td>{p.doctor_id?.full_name || 'Practitioner'}</td>
                  <td>{new Date(p.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button className="icon-btn" style={{ color: 'var(--color-danger)' }} onClick={() => triggerDelete(p._id)}>
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
        title="Delete Prescription Slip"
        message="Are you sure you want to delete this Rx prescription record?"
        loading={deleteLoading}
      />
    </div>
  );
}
