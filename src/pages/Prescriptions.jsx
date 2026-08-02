import React, { useState, useEffect } from 'react';
import { prescriptionAPI, patientAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import { FileSpreadsheet, PlusCircle, Search, User, ArrowLeft, Trash2, Plus } from 'lucide-react';

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
  const [temp, setTemp] = useState('98.6');
  const [bp, setBp] = useState('120/80');
  const [pulse, setPulse] = useState('72');
  const [spo2, setSpo2] = useState('98');
  const [weight, setWeight] = useState('65');
  const [height, setHeight] = useState('170');
  const [bloodSugar, setBloodSugar] = useState('');
  const [hemoglobin, setHemoglobin] = useState('');
  const [respirationRate, setRespirationRate] = useState('');
  
  // Clinical
  const [complaint, setComplaint] = useState('');
  const [allergy, setAllergy] = useState('');
  const [history, setHistory] = useState('');
  const [findings, setFindings] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [treatment, setTreatment] = useState('');
  const [notes, setNotes] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [followUpTime, setFollowUpTime] = useState('');
  const [followUpPurpose, setFollowUpPurpose] = useState('');

  // Dynamic Medicines Array
  const [medicines, setMedicines] = useState([
    { name: '', quantity: 1, frequency: '1-0-1', route: 'Oral', no_of_days: 5, instruction: 'After Food', additional_comments: '' }
  ]);

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
    setHeight('170');
    setBloodSugar('');
    setHemoglobin('');
    setRespirationRate('');
    setComplaint('');
    setAllergy('');
    setHistory('');
    setFindings('');
    setDiagnosis('');
    setTreatment('');
    setNotes('');
    setFollowUpDate('');
    setFollowUpTime('');
    setFollowUpPurpose('');
    setMedicines([{ name: '', quantity: 1, frequency: '1-0-1', route: 'Oral', no_of_days: 5, instruction: 'After Food', additional_comments: '' }]);
    setError('');
    setViewMode('editor');
  };

  const handleAddMedicineRow = () => {
    setMedicines([
      ...medicines,
      { name: '', quantity: 1, frequency: '1-0-1', route: 'Oral', no_of_days: 5, instruction: 'After Food', additional_comments: '' }
    ]);
  };

  const handleMedicineChange = (index, field, value) => {
    const updated = [...medicines];
    updated[index][field] = value;
    setMedicines(updated);
  };

  const handleRemoveMedicineRow = (index) => {
    setMedicines(medicines.filter((_, i) => i !== index));
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
        height: height ? Number(height) : null,
        blood_sugar: bloodSugar ? Number(bloodSugar) : null,
        hemoglobin: hemoglobin ? Number(hemoglobin) : null,
        respiration_rate: respirationRate ? Number(respirationRate) : null,
      },
      clinical: {
        chief_complaint: complaint,
        allergy,
        patient_history: history,
        findings,
        diagnosis,
        treatment,
        notes,
        follow_up_date: followUpDate || null,
        follow_up_time: followUpTime || '',
        follow_up_purpose: followUpPurpose || '',
      },
      medicines: medicines.filter(m => m.name.trim() !== ''),
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
            <h1 className="page-title">Write Full Rx Prescription</h1>
            <p className="page-subtitle">Record clinical vitals, symptom checks, diagnoses, follow-up dates, and medicine schedules</p>
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
              <label className="form-label" style={{ fontWeight: 'bold' }}>Select Patient *</label>
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
                <label className="form-label">Pulse (bpm)</label>
                <input type="number" className="input-field" placeholder="72" value={pulse} onChange={(e) => setPulse(e.target.value)} />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">Temp (°F)</label>
                <input type="text" className="input-field" placeholder="98.6" value={temp} onChange={(e) => setTemp(e.target.value)} />
              </div>
            </div>
            <div className="form-row" style={{ marginBottom: '20px' }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">SPO2 (%)</label>
                <input type="number" className="input-field" placeholder="98" value={spo2} onChange={(e) => setSpo2(e.target.value)} />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">Weight (kg)</label>
                <input type="number" className="input-field" placeholder="65" value={weight} onChange={(e) => setWeight(e.target.value)} />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">Height (cm)</label>
                <input type="number" className="input-field" placeholder="170" value={height} onChange={(e) => setHeight(e.target.value)} />
              </div>
            </div>

            <h4 style={{ fontSize: '14px', fontWeight: 'bold', margin: '20px 0 12px', color: 'var(--color-primary)' }}>2. Clinical Assessment & Diagnosis</h4>
            <div className="form-row" style={{ marginBottom: '12px' }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">Chief Complaint *</label>
                <input type="text" className="input-field" placeholder="Severe tooth pain" value={complaint} onChange={(e) => setComplaint(e.target.value)} required />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">Allergies</label>
                <input type="text" className="input-field" placeholder="Penicillin, Dust" value={allergy} onChange={(e) => setAllergy(e.target.value)} />
              </div>
            </div>
            <div className="form-row" style={{ marginBottom: '12px' }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">Clinical Findings</label>
                <input type="text" className="input-field" placeholder="Cavity on upper molar" value={findings} onChange={(e) => setFindings(e.target.value)} />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">Clinical Diagnosis *</label>
                <input type="text" className="input-field" placeholder="Acute Pulpitis" value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} required />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label className="form-label">Treatment Plan / Notes</label>
              <textarea className="input-field" placeholder="RCT advised, prescribe analgesics..." value={treatment} onChange={(e) => setTreatment(e.target.value)} />
            </div>

            <h4 style={{ fontSize: '14px', fontWeight: 'bold', margin: '20px 0 12px', color: 'var(--color-primary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>3. Prescribed Medicines ({medicines.length})</span>
              <button type="button" className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '12px' }} onClick={handleAddMedicineRow}>
                + Add Medicine
              </button>
            </h4>

            {medicines.map((med, mIdx) => (
              <div key={mIdx} style={{ background: 'var(--color-bg-secondary)', padding: '12px', borderRadius: 'var(--radius-md)', marginBottom: '10px' }}>
                <div className="form-row" style={{ marginBottom: '6px' }}>
                  <div className="form-group" style={{ flex: 2 }}>
                    <label className="form-label" style={{ fontSize: '11px' }}>Medicine Name *</label>
                    <input type="text" className="input-field" placeholder="e.g. Amoxicillin 500mg" required value={med.name} onChange={(e) => handleMedicineChange(mIdx, 'name', e.target.value)} />
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label" style={{ fontSize: '11px' }}>Frequency</label>
                    <input type="text" className="input-field" placeholder="1-0-1" value={med.frequency} onChange={(e) => handleMedicineChange(mIdx, 'frequency', e.target.value)} />
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label" style={{ fontSize: '11px' }}>Days</label>
                    <input type="number" className="input-field" placeholder="5" value={med.no_of_days} onChange={(e) => handleMedicineChange(mIdx, 'no_of_days', e.target.value)} />
                  </div>
                  <button type="button" className="icon-btn" style={{ color: 'var(--color-danger)', alignSelf: 'flex-end', marginBottom: '4px' }} onClick={() => handleRemoveMedicineRow(mIdx)}>
                    <Trash2 size={16} />
                  </button>
                </div>
                <div className="form-row">
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label" style={{ fontSize: '11px' }}>Instruction</label>
                    <input type="text" className="input-field" placeholder="After Meals" value={med.instruction} onChange={(e) => handleMedicineChange(mIdx, 'instruction', e.target.value)} />
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label" style={{ fontSize: '11px' }}>Route</label>
                    <input type="text" className="input-field" placeholder="Oral" value={med.route} onChange={(e) => handleMedicineChange(mIdx, 'route', e.target.value)} />
                  </div>
                </div>
              </div>
            ))}

            <h4 style={{ fontSize: '14px', fontWeight: 'bold', margin: '20px 0 12px', color: 'var(--color-primary)' }}>4. Follow-Up Schedule</h4>
            <div className="form-row" style={{ marginBottom: '24px' }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">Follow-up Date</label>
                <input type="date" className="input-field" value={followUpDate} onChange={(e) => setFollowUpDate(e.target.value)} />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">Time Slot</label>
                <input type="text" className="input-field" placeholder="10:00 AM" value={followUpTime} onChange={(e) => setFollowUpTime(e.target.value)} />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">Purpose</label>
                <input type="text" className="input-field" placeholder="Root Canal Review" value={followUpPurpose} onChange={(e) => setFollowUpPurpose(e.target.value)} />
              </div>
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
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-tertiary)' }}>No prescriptions created.</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Chief Complaint</th>
                <th>Diagnosis</th>
                <th>Medicines Count</th>
                <th>Vitals (BP/Pulse/Temp)</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((pr) => (
                <tr key={pr._id}>
                  <td style={{ fontWeight: 'bold' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <User size={16} color="var(--color-primary)" />
                      {pr.patient_id?.full_name || 'Patient'}
                    </span>
                  </td>
                  <td>{pr.clinical?.chief_complaint || 'N/A'}</td>
                  <td style={{ fontWeight: 'bold', color: 'var(--color-primary)' }}>
                    {pr.clinical?.diagnosis || pr.diagnosis || 'General'}
                  </td>
                  <td>
                    <span className="badge badge-info">{pr.medicines?.length || 0} Meds</span>
                  </td>
                  <td>
                    {pr.vitals ? `${pr.vitals.blood_pressure || '-'} BP | ${pr.vitals.pulse_rate || '-'} bpm | ${pr.vitals.temperature || '-'} °F` : '-'}
                  </td>
                  <td>{new Date(pr.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button className="icon-btn" style={{ color: 'var(--color-danger)' }} onClick={() => triggerDelete(pr._id)} title="Delete prescription">
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <ConfirmDeleteModal
        isOpen={deleteModalOpen}
        onClose={() => { setDeleteModalOpen(false); setDeleteId(null); }}
        onConfirm={confirmDelete}
        title="Delete Prescription"
        message="Are you sure you want to delete this prescription?"
        loading={deleteLoading}
      />
    </div>
  );
}
