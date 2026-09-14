import React, { useState, useEffect } from 'react';
import { prescriptionAPI, patientAPI, medicineAPI, labAPI, templateAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useActiveClinicScope } from '../hooks/useActiveClinicScope';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import PdfPreviewModal from '../components/PdfPreviewModal';
import { 
  FileSpreadsheet, 
  PlusCircle, 
  Search, 
  User, 
  ArrowLeft, 
  Trash2, 
  Plus,
  Stethoscope,
  Pill,
  FlaskConical,
  Copy,
  Check,
  Sparkles,
  ChevronRight,
  Edit2,
  X,
  Printer,
  Calendar,
  Activity
} from 'lucide-react';
import ViewToggle from '../components/common/ViewToggle';

export default function Prescriptions() {
  const { user } = useAuth();
  const activeClinicId = useActiveClinicScope();
  const [displayMode, setDisplayMode] = useState(() => localStorage.getItem('adixon_view_mode_prescriptions') || 'list');
  const [prescriptions, setPrescriptions] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // PDF Preview State
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const [previewPrescription, setPreviewPrescription] = useState(null);

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
  
  // 3-Step Tab State
  const [prescriptionSubTab, setPrescriptionSubTab] = useState('case_history');

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

  // Medicines & Lab Arrays
  const [medicines, setMedicines] = useState([]);
  const [labs, setLabs] = useState([]);

  // Master Data & Template Pickers
  const [masterMedicines, setMasterMedicines] = useState([]);
  const [masterLabs, setMasterLabs] = useState([]);
  const [masterTemplates, setMasterTemplates] = useState([]);
  const [masterRoutes, setMasterRoutes] = useState(['Oral', 'Tablet', 'Capsule', 'Syrup', 'Injection', 'Topical', 'Drops', 'Inhaler', 'Ointment']);
  const [masterFrequencies, setMasterFrequencies] = useState(['1-0-1', '1-0-0', '0-0-1', '1-1-1', '1-0-1-1', '0-1-0', 'SOS', 'Once Weekly']);
  const [masterInstructions, setMasterInstructions] = useState(['After Food', 'Before Food', 'With Water', 'At Bedtime', 'Empty Stomach', 'With Milk']);
  const [showTemplatePicker, setShowTemplatePicker] = useState(null); // null | 'medicine' | 'lab'

  // Current Medicine Form Input State
  const [currentMed, setCurrentMed] = useState({ name: '', route: 'Oral', frequency: '1-0-1', no_of_days: 5, instruction: 'After Food', additional_comments: '' });
  const [editingMedIndex, setEditingMedIndex] = useState(null);
  const [showMedSuggestions, setShowMedSuggestions] = useState(false);

  // Current Lab Form Input State
  const [currentLabInput, setCurrentLabInput] = useState('');
  const [showLabSuggestions, setShowLabSuggestions] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const targetClinicId = activeClinicId || user?.clinic_id?._id || user?.clinic_id;
      const clinicFilter = targetClinicId ? { clinic_id: targetClinicId } : {};
      const [presRes, patientsRes, medsRes, labsRes, tempsRes, optsRes] = await Promise.allSettled([
        prescriptionAPI.getPrescriptions({ ...clinicFilter, limit: 2000 }),
        patientAPI.getPatients({ ...clinicFilter, limit: 2000 }),
        medicineAPI.getMedicines({ limit: 1000 }),
        labAPI.getLabs({ limit: 500 }),
        templateAPI.getTemplates({ ...clinicFilter, limit: 500 }),
        medicineAPI.getMedicineOptions(),
      ]);

      if (presRes.status === 'fulfilled' && presRes.value?.data) setPrescriptions(presRes.value.data);
      if (patientsRes.status === 'fulfilled' && patientsRes.value?.data) {
        setPatients(patientsRes.value.data);
        if (patientsRes.value.data.length > 0) setSelectedPatientId(patientsRes.value.data[0]._id);
      }
      if (medsRes.status === 'fulfilled') setMasterMedicines(medsRes.value?.data?.data || medsRes.value?.data || []);
      if (labsRes.status === 'fulfilled') setMasterLabs(labsRes.value?.data?.data || labsRes.value?.data || []);
      if (tempsRes.status === 'fulfilled') setMasterTemplates(tempsRes.value?.data?.data || tempsRes.value?.data || []);
      if (optsRes.status === 'fulfilled' && optsRes.value?.data) {
        if (optsRes.value.data.routes) setMasterRoutes(optsRes.value.data.routes);
        if (optsRes.value.data.frequencies) setMasterFrequencies(optsRes.value.data.frequencies);
        if (optsRes.value.data.instructions) setMasterInstructions(optsRes.value.data.instructions);
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
  }, [activeClinicId]);

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
    setMedicines([]);
    setLabs([]);
    setPrescriptionSubTab('case_history');
    setError('');
    setViewMode('editor');
  };

  const handleAddOrUpdateMedicine = () => {
    if (!currentMed.name || !currentMed.name.trim()) return;
    if (editingMedIndex !== null) {
      const updated = [...medicines];
      updated[editingMedIndex] = currentMed;
      setMedicines(updated);
      setEditingMedIndex(null);
    } else {
      setMedicines([...medicines.filter(m => m.name.trim() !== ''), currentMed]);
    }
    setCurrentMed({ name: '', route: 'Oral', frequency: '1-0-1', no_of_days: 5, instruction: 'After Food', additional_comments: '' });
    setShowMedSuggestions(false);
  };

  const handleEditMedicine = (index) => {
    setEditingMedIndex(index);
    setCurrentMed(medicines[index]);
    setPrescriptionSubTab('medicines');
  };

  const handleRemoveMedicineRow = (index) => {
    setMedicines(medicines.filter((_, i) => i !== index));
    if (editingMedIndex === index) {
      setEditingMedIndex(null);
      setCurrentMed({ name: '', route: 'Oral', frequency: '1-0-1', no_of_days: 5, instruction: 'After Food', additional_comments: '' });
    }
  };

  const handleAddLabTest = (testName) => {
    const val = (testName || currentLabInput).trim();
    if (!val) return;
    if (!labs.includes(val)) {
      setLabs([...labs, val]);
    }
    setCurrentLabInput('');
    setShowLabSuggestions(false);
  };

  const handleRemoveLabTest = (index) => {
    setLabs(labs.filter((_, i) => i !== index));
  };

  const handleApplyTemplate = (tpl) => {
    if (tpl.medicines && tpl.medicines.length > 0) {
      setMedicines(prev => [
        ...prev.filter(m => m.name.trim() !== ''),
        ...tpl.medicines.map(m => ({
          name: m.name || '',
          quantity: m.quantity || 1,
          frequency: m.frequency || '1-0-1',
          route: m.route || 'Oral',
          no_of_days: m.no_of_days || 5,
          instruction: m.instruction || 'After Food',
          additional_comments: m.additional_comments || '',
        }))
      ]);
    }
    if (tpl.labs && tpl.labs.length > 0) {
      setLabs(prev => Array.from(new Set([...prev, ...tpl.labs])));
    }
    setShowTemplatePicker(null);
  };

  const handleSetFollowUpDays = (days) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    setFollowUpDate(d.toISOString().split('T')[0]);
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
      doctor_id: user?._id,
      clinic_id: activeClinicId || user?.clinic_id?._id || user?.clinic_id,
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
      medicines: medicines.filter(m => m.name && m.name.trim() !== ''),
      labs: labs.filter(l => typeof l === 'string' && l.trim() !== ''),
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
            <p className="page-subtitle">Record clinical vitals, symptom checks, diagnoses, follow-up dates, medicine schedules, and lab orders</p>
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

            {/* Step Tab Indicator */}
            <div style={{ display: 'flex', gap: '6px', backgroundColor: 'var(--color-bg-secondary)', padding: '6px', borderRadius: 'var(--radius-md)', marginBottom: '20px' }}>
              <button
                type="button"
                onClick={() => setPrescriptionSubTab('case_history')}
                style={{
                  flex: 1,
                  padding: '10px 14px',
                  fontSize: '13px',
                  fontWeight: '600',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  backgroundColor: prescriptionSubTab === 'case_history' ? 'var(--color-bg)' : 'transparent',
                  color: prescriptionSubTab === 'case_history' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                  boxShadow: prescriptionSubTab === 'case_history' ? 'var(--shadow-sm)' : 'none',
                }}
              >
                <Stethoscope size={16} /> 1. Case History & Vitals
              </button>
              <button
                type="button"
                onClick={() => setPrescriptionSubTab('medicines')}
                style={{
                  flex: 1,
                  padding: '10px 14px',
                  fontSize: '13px',
                  fontWeight: '600',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  backgroundColor: prescriptionSubTab === 'medicines' ? 'var(--color-bg)' : 'transparent',
                  color: prescriptionSubTab === 'medicines' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                  boxShadow: prescriptionSubTab === 'medicines' ? 'var(--shadow-sm)' : 'none',
                }}
              >
                <Pill size={16} /> 2. Medicines ({medicines.filter(m => m.name && m.name.trim()).length})
              </button>
              <button
                type="button"
                onClick={() => setPrescriptionSubTab('labs')}
                style={{
                  flex: 1,
                  padding: '10px 14px',
                  fontSize: '13px',
                  fontWeight: '600',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  backgroundColor: prescriptionSubTab === 'labs' ? 'var(--color-bg)' : 'transparent',
                  color: prescriptionSubTab === 'labs' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                  boxShadow: prescriptionSubTab === 'labs' ? 'var(--shadow-sm)' : 'none',
                }}
              >
                <FlaskConical size={16} /> 3. Lab Tests ({labs.length})
              </button>
            </div>

            {/* TAB 1: CASE HISTORY & VITALS */}
            {prescriptionSubTab === 'case_history' && (
              <div>
                <h4 style={{ fontSize: '14px', fontWeight: 'bold', borderBottom: '1px solid var(--color-border)', paddingBottom: '6px', marginBottom: '16px', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Stethoscope size={16} /> Patient Vitals
                </h4>
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
                <div className="form-row" style={{ marginBottom: '12px' }}>
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
                <div className="form-row" style={{ marginBottom: '20px' }}>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">Blood Sugar (mg/dL)</label>
                    <input type="number" className="input-field" placeholder="110" value={bloodSugar} onChange={(e) => setBloodSugar(e.target.value)} />
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">Hemoglobin (g/dL)</label>
                    <input type="number" className="input-field" placeholder="13.5" value={hemoglobin} onChange={(e) => setHemoglobin(e.target.value)} />
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">Respiration Rate</label>
                    <input type="number" className="input-field" placeholder="16" value={respirationRate} onChange={(e) => setRespirationRate(e.target.value)} />
                  </div>
                </div>

                <h4 style={{ fontSize: '14px', fontWeight: 'bold', borderBottom: '1px solid var(--color-border)', paddingBottom: '6px', marginBottom: '16px', color: 'var(--color-primary)' }}>
                  Clinical Assessment & Diagnosis
                </h4>
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
                    <label className="form-label">Patient History</label>
                    <textarea className="input-field" style={{ height: '70px' }} placeholder="Pre-existing medical conditions..." value={history} onChange={(e) => setHistory(e.target.value)} />
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">Clinical Findings</label>
                    <textarea className="input-field" style={{ height: '70px' }} placeholder="Cavity on upper molar..." value={findings} onChange={(e) => setFindings(e.target.value)} />
                  </div>
                </div>
                <div className="form-row" style={{ marginBottom: '12px' }}>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">Clinical Diagnosis *</label>
                    <input type="text" className="input-field" placeholder="Acute Pulpitis" value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} required />
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">Treatment Plan / Advice</label>
                    <input type="text" className="input-field" placeholder="RCT advised, prescribe analgesics..." value={treatment} onChange={(e) => setTreatment(e.target.value)} />
                  </div>
                </div>
                <div className="form-group" style={{ marginBottom: '20px' }}>
                  <label className="form-label">Doctor Notes / Remarks</label>
                  <input type="text" className="input-field" placeholder="General doctor notes..." value={notes} onChange={(e) => setNotes(e.target.value)} />
                </div>

                <h4 style={{ fontSize: '14px', fontWeight: 'bold', borderBottom: '1px solid var(--color-border)', paddingBottom: '6px', marginBottom: '16px', color: 'var(--color-primary)' }}>
                  Follow-Up Schedule
                </h4>
                <div style={{ display: 'flex', gap: '6px', marginBottom: '12px', flexWrap: 'wrap' }}>
                  <button type="button" className="quick-chip" onClick={() => handleSetFollowUpDays(1)}>+ 1 Day</button>
                  <button type="button" className="quick-chip" onClick={() => handleSetFollowUpDays(7)}>+ 1 Week</button>
                  <button type="button" className="quick-chip" onClick={() => handleSetFollowUpDays(15)}>+ 15 Days</button>
                  <button type="button" className="quick-chip" onClick={() => handleSetFollowUpDays(30)}>+ 1 Month</button>
                </div>
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

                <div style={{ textAlign: 'right', marginTop: '16px' }}>
                  <button type="button" className="btn btn-primary" onClick={() => setPrescriptionSubTab('medicines')}>
                    Next: Prescribe Medicines <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}

            {/* TAB 2: MEDICINES */}
            {prescriptionSubTab === 'medicines' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--color-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Pill size={16} /> Prescribed Medicines ({medicines.length})
                  </h4>
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    style={{ padding: '4px 12px', fontSize: '12px', color: 'var(--color-primary)', borderColor: 'var(--color-primary)' }}
                    onClick={() => setShowTemplatePicker('medicine')}
                  >
                    <Copy size={14} /> Select Template
                  </button>
                </div>

                {/* Added Medicines List */}
                {medicines.length > 0 ? (
                  <div style={{ marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {medicines.map((med, idx) => (
                      <div key={idx} style={{ background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontWeight: 'bold', fontSize: '14px', color: 'var(--color-text-primary)' }}>
                            {med.name} <span className="badge badge-info">{med.route || 'Oral'}</span>
                          </div>
                          <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                            Frequency: <strong>{med.frequency || '1-0-1'}</strong> | Duration: <strong>{med.no_of_days} Days</strong> | Instruction: <strong>{med.instruction || 'After Food'}</strong>
                            {med.additional_comments && ` (${med.additional_comments})`}
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button type="button" className="icon-btn" style={{ color: 'var(--color-primary)' }} onClick={() => handleEditMedicine(idx)} title="Edit">
                            <Edit2 size={16} />
                          </button>
                          <button type="button" className="icon-btn" style={{ color: 'var(--color-danger)' }} onClick={() => handleRemoveMedicineRow(idx)} title="Delete">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ padding: '24px', textAlign: 'center', background: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-md)', marginBottom: '20px', color: 'var(--color-text-tertiary)', fontSize: '13px' }}>
                    No medicines added yet. Select a template above or enter medicine details below.
                  </div>
                )}

                {/* Medicine Entry Box */}
                <div style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border-strong)', borderRadius: 'var(--radius-lg)', padding: '18px', marginBottom: '20px' }}>
                  <div style={{ fontWeight: 'bold', fontSize: '13px', marginBottom: '12px', color: 'var(--color-text-primary)' }}>
                    {editingMedIndex !== null ? `Edit Medicine #${editingMedIndex + 1}` : 'Add New Medicine'}
                  </div>

                  {/* Medicine Name with Suggestions */}
                  <div className="form-group" style={{ marginBottom: '12px', position: 'relative' }}>
                    <label className="form-label" style={{ fontWeight: 'bold' }}>Medicine Name *</label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="Type medicine name (e.g. Paracetamol 500mg)..."
                      value={currentMed.name}
                      onChange={(e) => {
                        setCurrentMed({ ...currentMed, name: e.target.value });
                        setShowMedSuggestions(true);
                      }}
                      onFocus={() => setShowMedSuggestions(true)}
                    />
                    {showMedSuggestions && currentMed.name.trim().length > 0 && masterMedicines.length > 0 && (
                      <div className="suggestion-dropdown">
                        {masterMedicines
                          .filter(m => (m.name || m.medicine_name || '').toLowerCase().includes(currentMed.name.toLowerCase()))
                          .slice(0, 8)
                          .map((m, mIdx) => (
                            <div
                              key={mIdx}
                              className="suggestion-item"
                              onClick={() => {
                                setCurrentMed({
                                  name: m.name || m.medicine_name || '',
                                  quantity: m.quantity || m.qty || currentMed.quantity || 1,
                                  route: m.route || m.form || currentMed.route || 'Oral',
                                  frequency: m.frequency || m.freq || currentMed.frequency || '1-0-1',
                                  no_of_days: m.no_of_days || m.days || m.noOfDays || currentMed.no_of_days || 5,
                                  instruction: m.instruction || m.instructions || currentMed.instruction || 'After Food',
                                  additional_comments: m.additional_comments || m.comment || m.additionalComment || currentMed.additional_comments || '',
                                });
                                setShowMedSuggestions(false);
                              }}
                            >
                              <div style={{ fontWeight: '600', color: 'var(--color-text-primary)' }}>{m.name || m.medicine_name}</div>
                              <div style={{ fontSize: '10px', color: 'var(--color-text-tertiary)', marginTop: '2px' }}>
                                {[m.route || m.form, m.frequency || m.freq, (m.no_of_days || m.days || m.noOfDays) ? `${m.no_of_days || m.days || m.noOfDays} days` : null, m.instruction || m.instructions].filter(Boolean).join(' • ') || 'Medicine'}
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>

                  <div className="form-row" style={{ marginBottom: '12px' }}>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label className="form-label">Route / Type</label>
                      <select className="input-field" value={currentMed.route} onChange={(e) => setCurrentMed({ ...currentMed, route: e.target.value })}>
                        {masterRoutes.map(r => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label className="form-label">Frequency</label>
                      <select className="input-field" value={currentMed.frequency} onChange={(e) => setCurrentMed({ ...currentMed, frequency: e.target.value })}>
                        {masterFrequencies.map(f => (
                          <option key={f} value={f}>{f}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label className="form-label">Duration (Days)</label>
                      <input type="number" className="input-field" placeholder="5" value={currentMed.no_of_days} onChange={(e) => setCurrentMed({ ...currentMed, no_of_days: Number(e.target.value) })} />
                    </div>
                  </div>

                  <div className="form-row" style={{ marginBottom: '12px' }}>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label className="form-label">Instruction</label>
                      <select className="input-field" value={currentMed.instruction} onChange={(e) => setCurrentMed({ ...currentMed, instruction: e.target.value })}>
                        {masterInstructions.map(ins => (
                          <option key={ins} value={ins}>{ins}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label className="form-label">Additional Comments</label>
                      <input type="text" className="input-field" placeholder="Special note..." value={currentMed.additional_comments} onChange={(e) => setCurrentMed({ ...currentMed, additional_comments: e.target.value })} />
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                    {editingMedIndex !== null && (
                      <button type="button" className="btn btn-secondary" onClick={() => {
                        setEditingMedIndex(null);
                        setCurrentMed({ name: '', route: 'Oral', frequency: '1-0-1', no_of_days: 5, instruction: 'After Food', additional_comments: '' });
                      }}>
                        Cancel Edit
                      </button>
                    )}
                    <button type="button" className="btn btn-primary" onClick={handleAddOrUpdateMedicine}>
                      <Plus size={14} /> {editingMedIndex !== null ? 'Update Medicine' : 'Add Medicine'}
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setPrescriptionSubTab('case_history')}>
                    Back: Case History
                  </button>
                  <button type="button" className="btn btn-primary" onClick={() => setPrescriptionSubTab('labs')}>
                    Next: Lab Tests & Imaging <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}

            {/* TAB 3: LAB TESTS */}
            {prescriptionSubTab === 'labs' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--color-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <FlaskConical size={16} /> Lab Tests & Investigations ({labs.length})
                  </h4>
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    style={{ padding: '4px 12px', fontSize: '12px', color: 'var(--color-primary)', borderColor: 'var(--color-primary)' }}
                    onClick={() => setShowTemplatePicker('lab')}
                  >
                    <Copy size={14} /> Select Template
                  </button>
                </div>

                {/* Added Labs Chips */}
                <div style={{ marginBottom: '20px' }}>
                  {labs.length > 0 ? (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {labs.map((labName, idx) => (
                        <div key={idx} className="badge badge-info" style={{ padding: '8px 12px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span>{labName}</span>
                          <button type="button" onClick={() => handleRemoveLabTest(idx)} style={{ background: 'none', border: 'none', color: 'currentColor', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ padding: '24px', textAlign: 'center', background: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-md)', color: 'var(--color-text-tertiary)', fontSize: '13px' }}>
                      No lab tests added. Select quick suggestions below or search lab tests.
                    </div>
                  )}
                </div>

                {/* Quick Common Lab Test Chips */}
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--color-text-tertiary)', marginBottom: '8px' }}>
                    Quick Suggestions:
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {[
                      "CBC (Complete Blood Count)",
                      "Blood Sugar (Fast & PP)",
                      "HbA1c",
                      "Lipid Profile",
                      "Liver Function Test (LFT)",
                      "Kidney Function Test (KFT)",
                      "Thyroid Profile (T3 T4 TSH)",
                      "Urine Routine & Microscopy",
                      "Chest X-Ray PA View",
                      "ECG 12-Lead",
                      "USG Abdomen & Pelvis"
                    ].map((quickLab) => (
                      <button
                        key={quickLab}
                        type="button"
                        className={`quick-chip ${labs.includes(quickLab) ? 'active' : ''}`}
                        onClick={() => handleAddLabTest(quickLab)}
                      >
                        + {quickLab}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Search & Custom Lab Entry */}
                <div style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border-strong)', borderRadius: 'var(--radius-lg)', padding: '18px', marginBottom: '24px' }}>
                  <label className="form-label" style={{ fontWeight: 'bold' }}>Add Lab Test / Investigation *</label>
                  <div style={{ display: 'flex', gap: '8px', position: 'relative', marginTop: '6px' }}>
                    <div style={{ flex: 1, position: 'relative' }}>
                      <input
                        type="text"
                        className="input-field"
                        placeholder="Search or type lab test name..."
                        value={currentLabInput}
                        onChange={(e) => {
                          setCurrentLabInput(e.target.value);
                          setShowLabSuggestions(true);
                        }}
                        onFocus={() => setShowLabSuggestions(true)}
                      />
                      {showLabSuggestions && currentLabInput.trim().length > 0 && masterLabs.length > 0 && (
                        <div className="suggestion-dropdown">
                          {masterLabs
                            .filter(l => (l.name || l.lab_test || l.test_name || (typeof l === 'string' ? l : '')).toLowerCase().includes(currentLabInput.toLowerCase()))
                            .slice(0, 8)
                            .map((l, lIdx) => {
                              const lName = l.name || l.lab_test || l.test_name || (typeof l === 'string' ? l : '');
                              return (
                                <div
                                  key={lIdx}
                                  className="suggestion-item"
                                  onClick={() => handleAddLabTest(lName)}
                                >
                                  <span style={{ fontWeight: '600' }}>{lName}</span>
                                  <span style={{ fontSize: '11px', color: 'var(--color-text-tertiary)' }}>{l.category || 'Lab Test'}</span>
                                </div>
                              );
                            })}
                        </div>
                      )}
                    </div>
                    <button type="button" className="btn btn-primary" onClick={() => handleAddLabTest()}>
                      <Plus size={14} /> Add Test
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setPrescriptionSubTab('medicines')}>
                    Back: Medicines
                  </button>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--color-border)' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setViewMode('list')}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={patients.length === 0}>
                Save Prescription Document
              </button>
            </div>
          </form>
        </div>

        {/* TEMPLATE PICKER MODAL */}
        {showTemplatePicker && (
          <div className="right-drawer-backdrop" onClick={() => setShowTemplatePicker(null)}>
            <div className="right-drawer-panel" style={{ maxWidth: '520px' }} onClick={(e) => e.stopPropagation()}>
              <div className="right-drawer-header">
                <h3 className="right-drawer-title">
                  <Sparkles size={18} color="var(--color-primary)" /> Select {showTemplatePicker === 'medicine' ? 'Medicine' : 'Lab Test'} Template
                </h3>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <a
                    href="/templates"
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-secondary"
                    style={{ padding: '4px 10px', fontSize: '11px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                  >
                    <Plus size={12} /> New Template
                  </a>
                  <button type="button" className="icon-btn" onClick={() => setShowTemplatePicker(null)}>
                    <X size={18} />
                  </button>
                </div>
              </div>

              <div className="right-drawer-body">
                {masterTemplates.length > 0 ? (
                  masterTemplates
                    .filter(t => {
                      const tType = (t.type || '').toLowerCase();
                      if (showTemplatePicker === 'medicine') return (t.medicines && t.medicines.length > 0) || tType.includes('medicine') || tType.includes('prescription');
                      if (showTemplatePicker === 'lab') return (t.labs && t.labs.length > 0) || tType.includes('lab');
                      return true;
                    })
                    .map((tpl, tIdx) => (
                      <div key={tIdx} className="template-picker-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ fontWeight: 'bold', fontSize: '13px', color: 'var(--color-text-primary)' }}>{tpl.name}</div>
                          <span className="badge badge-info">{tpl.type || 'Template'}</span>
                        </div>

                        {tpl.medicines && tpl.medicines.length > 0 && (
                          <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginTop: '6px' }}>
                            <strong>Medicines ({tpl.medicines.length}):</strong> {tpl.medicines.map(m => m.name).join(', ')}
                          </div>
                        )}

                        {tpl.labs && tpl.labs.length > 0 && (
                          <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                            <strong>Labs ({tpl.labs.length}):</strong> {tpl.labs.join(', ')}
                          </div>
                        )}

                        <div style={{ textAlign: 'right', marginTop: '10px' }}>
                          <button type="button" className="btn btn-primary" style={{ padding: '4px 10px', fontSize: '11px' }} onClick={() => handleApplyTemplate(tpl)}>
                            Apply Template
                          </button>
                        </div>
                      </div>
                    ))
                ) : (
                  <div style={{ padding: '24px', textAlign: 'center', color: 'var(--color-text-tertiary)', fontSize: '13px' }}>
                    No templates created yet. You can manage prescription templates under the Templates menu.
                  </div>
                )}
              </div>

              <div className="right-drawer-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowTemplatePicker(null)}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
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

      <div className="card" style={{ padding: '12px 16px', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: '320px' }}>
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
        <ViewToggle 
          mode={displayMode} 
          onChange={(m) => {
            setDisplayMode(m);
            localStorage.setItem('adixon_view_mode_prescriptions', m);
          }} 
        />
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-tertiary)' }}>Loading prescriptions...</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-tertiary)' }}>No prescriptions created.</div>
      ) : displayMode === 'grid' ? (
        <div className="records-grid">
          {filtered.map((pr) => (
            <div key={pr._id} className="record-card">
              <div className="record-card-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'var(--color-info-light)', color: 'var(--color-info)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                    <FileSpreadsheet size={18} />
                  </div>
                  <div>
                    <div style={{ fontWeight: '600', fontSize: '14px', color: 'var(--color-text-primary)' }}>
                      {pr.patient_id?.full_name || 'Patient'}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Calendar size={11} /> {new Date(pr.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <span className="badge badge-info" style={{ fontSize: '11px', fontWeight: '600' }}>
                  {pr.clinical?.diagnosis || pr.diagnosis || 'General Rx'}
                </span>
              </div>

              <div className="record-card-body">
                {pr.clinical?.chief_complaint && (
                  <div className="record-card-row">
                    <span>Complaint: <strong>{pr.clinical.chief_complaint}</strong></span>
                  </div>
                )}
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '4px' }}>
                  <span className="badge badge-primary" style={{ fontSize: '11px' }}>
                    <Pill size={11} style={{ marginRight: '4px' }} />
                    {pr.medicines?.length || 0} Medicines
                  </span>
                  {pr.labs?.length > 0 && (
                    <span className="badge badge-success" style={{ fontSize: '11px' }}>
                      <FlaskConical size={11} style={{ marginRight: '4px' }} />
                      {pr.labs.length} Labs
                    </span>
                  )}
                </div>
                {pr.vitals && (pr.vitals.blood_pressure || pr.vitals.pulse_rate || pr.vitals.temperature) && (
                  <div style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', background: 'var(--color-bg-secondary)', padding: '6px 8px', borderRadius: '6px', marginTop: '4px' }}>
                    <Activity size={11} style={{ display: 'inline', marginRight: '4px', verticalAlign: '-1px' }} />
                    {[
                      pr.vitals.blood_pressure ? `${pr.vitals.blood_pressure} BP` : null,
                      pr.vitals.pulse_rate ? `${pr.vitals.pulse_rate} bpm` : null,
                      pr.vitals.temperature ? `${pr.vitals.temperature} °F` : null,
                    ].filter(Boolean).join(' • ')}
                  </div>
                )}
              </div>

              <div className="record-card-footer">
                <button 
                  className="btn btn-primary" 
                  style={{ padding: '4px 10px', fontSize: '11px', gap: '4px' }}
                  onClick={() => {
                    setPreviewPrescription(pr);
                    setPdfModalOpen(true);
                  }}
                >
                  <Printer size={12} /> PDF Preview
                </button>
                <button 
                  className="btn btn-secondary" 
                  style={{ padding: '4px 8px', fontSize: '11px', gap: '4px', color: 'var(--color-danger)' }} 
                  onClick={() => triggerDelete(pr._id)}
                >
                  <Trash2 size={12} /> Delete
                </button>
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
                <th>Chief Complaint</th>
                <th>Diagnosis</th>
                <th>Medicines Count</th>
                <th>Labs Count</th>
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
                    <span className="badge badge-success">{pr.labs?.length || 0} Labs</span>
                  </td>
                  <td>
                    {pr.vitals ? `${pr.vitals.blood_pressure || '-'} BP | ${pr.vitals.pulse_rate || '-'} bpm | ${pr.vitals.temperature || '-'} °F` : '-'}
                  </td>
                  <td>{new Date(pr.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button 
                        className="icon-btn" 
                        style={{ color: 'var(--color-primary)' }} 
                        onClick={() => {
                          setPreviewPrescription(pr);
                          setPdfModalOpen(true);
                        }} 
                        title="Print / View PDF"
                      >
                        <Printer size={14} />
                      </button>
                      <button className="icon-btn" style={{ color: 'var(--color-danger)' }} onClick={() => triggerDelete(pr._id)} title="Delete prescription">
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

      <ConfirmDeleteModal
        isOpen={deleteModalOpen}
        onClose={() => { setDeleteModalOpen(false); setDeleteId(null); }}
        onConfirm={confirmDelete}
        title="Delete Prescription Record"
        message="Are you sure you want to delete this prescription? This action cannot be undone."
        loading={deleteLoading}
      />

      {/* PDF PREVIEW MODAL */}
      {pdfModalOpen && previewPrescription && (
        <PdfPreviewModal
          isOpen={pdfModalOpen}
          onClose={() => {
            setPdfModalOpen(false);
            setPreviewPrescription(null);
          }}
          type="prescription"
          data={previewPrescription}
          patient={previewPrescription.patient_id || {}}
          clinic={previewPrescription.clinic_id || user?.clinic_id || {}}
          doctor={previewPrescription.doctor_id || user || {}}
        />
      )}
    </div>
  );
}
