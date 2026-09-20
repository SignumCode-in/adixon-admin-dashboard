import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  User, 
  CalendarDays, 
  FileSpreadsheet, 
  FileBadge, 
  FileText, 
  ClipboardCheck, 
  Plus, 
  ArrowLeft, 
  Phone, 
  Mail, 
  Printer,
  Trash2,
  Edit2,
  X,
  Stethoscope,
  Pill,
  FlaskConical,
  Copy,
  Check,
  Search,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { 
  patientAPI, 
  appointmentAPI, 
  prescriptionAPI, 
  certificateAPI, 
  instructionAPI, 
  consentAPI,
  medicineAPI,
  labAPI,
  templateAPI
} from '../services/api';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import PdfPreviewModal from '../components/PdfPreviewModal';

export default function PatientDetails() {
  const { patientId } = useParams();
  const [patient, setPatient] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);

  // PDF Preview State
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const [pdfType, setPdfType] = useState('prescription');
  const [pdfData, setPdfData] = useState(null);

  // Tab Data States
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [instructions, setInstructions] = useState([]);
  const [consents, setConsents] = useState([]);

  // Modals
  const [showModal, setShowModal] = useState(null); // 'appointment' | 'prescription' | 'certificate' | 'instruction' | 'consent'
  const [formData, setFormData] = useState({});

  // Dynamic Medicine & Lab arrays for Prescription Form
  const [prescriptionSubTab, setPrescriptionSubTab] = useState('case_history'); // 'case_history' | 'medicines' | 'labs'
  const [prescriptionMedicines, setPrescriptionMedicines] = useState([]);
  const [prescriptionLabTests, setPrescriptionLabTests] = useState([]);

  // Master Data for Auto-Suggestions & Presets
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

  useEffect(() => {
    if (patientId) {
      loadPatientDetails();
    }
    loadMasterPrescriptionData();
  }, [patientId]);

  const loadMasterPrescriptionData = async () => {
    try {
      const targetClinicId = patient?.clinic_id?._id || patient?.clinic_id || user?.clinic_id?._id || user?.clinic_id;
      const templateParams = targetClinicId ? { clinic_id: targetClinicId, limit: 100 } : { limit: 100 };
      const [medsRes, labsRes, tempsRes, optsRes] = await Promise.allSettled([
        medicineAPI.getMedicines({ ...templateParams, limit: 1000 }),
        labAPI.getLabs({ limit: 100 }),
        templateAPI.getTemplates(templateParams),
        medicineAPI.getMedicineOptions(),
      ]);
      if (medsRes.status === 'fulfilled') setMasterMedicines(medsRes.value?.data?.data || medsRes.value?.data || []);
      if (labsRes.status === 'fulfilled') setMasterLabs(labsRes.value?.data?.data || labsRes.value?.data || []);
      if (tempsRes.status === 'fulfilled') setMasterTemplates(tempsRes.value?.data?.data || tempsRes.value?.data || []);
      if (optsRes.status === 'fulfilled' && optsRes.value?.data) {
        if (optsRes.value.data.routes) setMasterRoutes(optsRes.value.data.routes);
        if (optsRes.value.data.frequencies) setMasterFrequencies(optsRes.value.data.frequencies);
        if (optsRes.value.data.instructions) setMasterInstructions(optsRes.value.data.instructions);
      }
    } catch (err) {
      console.error('Error loading master data:', err);
    }
  };

  const loadPatientDetails = async () => {
    setLoading(true);
    try {
      const patientRes = await patientAPI.getPatientById(patientId);
      const pData = patientRes.data?.data || patientRes.data;
      setPatient(pData);

      const [apptsRes, prescRes, certsRes, instsRes, consRes] = await Promise.allSettled([
        appointmentAPI.getAppointments({ patient_id: patientId }),
        prescriptionAPI.getPrescriptions({ patient_id: patientId }),
        certificateAPI.getCertificates({ patient_id: patientId }),
        instructionAPI.getInstructions({ patient_id: patientId }),
        consentAPI.getConsents({ patient_id: patientId }),
      ]);

      if (apptsRes.status === 'fulfilled') setAppointments(apptsRes.value?.data?.data || apptsRes.value?.data || []);
      if (prescRes.status === 'fulfilled') setPrescriptions(prescRes.value?.data?.data || prescRes.value?.data || []);
      if (certsRes.status === 'fulfilled') setCertificates(certsRes.value?.data?.data || certsRes.value?.data || []);
      if (instsRes.status === 'fulfilled') setInstructions(instsRes.value?.data?.data || instsRes.value?.data || []);
      if (consRes.status === 'fulfilled') setConsents(consRes.value?.data?.data || consRes.value?.data || []);

    } catch (err) {
      console.error('Error loading patient details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddOrUpdateMedicine = () => {
    if (!currentMed.name || !currentMed.name.trim()) return;
    if (editingMedIndex !== null) {
      const updated = [...prescriptionMedicines];
      updated[editingMedIndex] = currentMed;
      setPrescriptionMedicines(updated);
      setEditingMedIndex(null);
    } else {
      setPrescriptionMedicines([...prescriptionMedicines.filter(m => m.name.trim() !== ''), currentMed]);
    }
    setCurrentMed({ name: '', route: 'Oral', frequency: '1-0-1', no_of_days: 5, instruction: 'After Food', additional_comments: '' });
    setShowMedSuggestions(false);
  };

  const handleEditMedicine = (index) => {
    setEditingMedIndex(index);
    setCurrentMed(prescriptionMedicines[index]);
    setPrescriptionSubTab('medicines');
  };

  const handleRemoveMedicineRow = (index) => {
    setPrescriptionMedicines(prescriptionMedicines.filter((_, i) => i !== index));
    if (editingMedIndex === index) {
      setEditingMedIndex(null);
      setCurrentMed({ name: '', route: 'Oral', frequency: '1-0-1', no_of_days: 5, instruction: 'After Food', additional_comments: '' });
    }
  };

  const handleAddLabTest = (testName) => {
    const val = (testName || currentLabInput).trim();
    if (!val) return;
    if (!prescriptionLabTests.includes(val)) {
      setPrescriptionLabTests([...prescriptionLabTests, val]);
    }
    setCurrentLabInput('');
    setShowLabSuggestions(false);
  };

  const handleRemoveLabTest = (index) => {
    setPrescriptionLabTests(prescriptionLabTests.filter((_, i) => i !== index));
  };

  const handleApplyTemplate = (tpl) => {
    if (tpl.medicines && tpl.medicines.length > 0) {
      setPrescriptionMedicines(prev => [
        ...prev.filter(m => m.name && m.name.trim() !== ''),
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
      setPrescriptionLabTests(prev => Array.from(new Set([...prev, ...tpl.labs])));
    }
    if (tpl.content || tpl.remarks || tpl.duration || tpl.name) {
      setFormData(prev => ({
        ...prev,
        title: tpl.name || prev.title,
        certificate_type: tpl.name || prev.certificate_type,
        content: tpl.content || prev.content,
        description: tpl.content || prev.description,
        duration: tpl.duration || prev.duration,
        remark: tpl.remarks || prev.remark,
      }));
    }
    setShowTemplatePicker(null);
  };

  const handleSetFollowUpDays = (days) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    setFormData(prev => ({ ...prev, follow_up_date: d.toISOString().split('T')[0] }));
  };

  const handleCreateRecord = async (e) => {
    e.preventDefault();
    try {
      const clinicId = patient?.clinic_id?._id || patient?.clinic_id;
      const doctorId = patient?.doctor_id?._id || patient?.doctor_id;

      if (showModal === 'appointment') {
        await appointmentAPI.createAppointment({ 
          ...formData, 
          patient_id: patientId, 
          clinic_id: clinicId, 
          doctor_id: doctorId 
        });
      } else if (showModal === 'prescription') {
        const payload = {
          patient_id: patientId,
          clinic_id: clinicId,
          doctor_id: doctorId,
          vitals: {
            temperature: formData.temperature || '',
            blood_pressure: formData.blood_pressure || '',
            pulse_rate: formData.pulse_rate ? Number(formData.pulse_rate) : null,
            spo2: formData.spo2 ? Number(formData.spo2) : null,
            weight: formData.weight ? Number(formData.weight) : null,
            height: formData.height ? Number(formData.height) : null,
            blood_sugar: formData.blood_sugar ? Number(formData.blood_sugar) : null,
            hemoglobin: formData.hemoglobin ? Number(formData.hemoglobin) : null,
            respiration_rate: formData.respiration_rate ? Number(formData.respiration_rate) : null,
          },
          clinical: {
            chief_complaint: formData.chief_complaint || '',
            allergy: formData.allergy || '',
            patient_history: formData.patient_history || '',
            findings: formData.findings || '',
            diagnosis: formData.diagnosis || '',
            treatment: formData.treatment || '',
            notes: formData.notes || '',
            follow_up_date: formData.follow_up_date || null,
            follow_up_time: formData.follow_up_time || '',
            follow_up_purpose: formData.follow_up_purpose || '',
          },
          medicines: prescriptionMedicines.filter(m => m.name && m.name.trim() !== ''),
          labs: prescriptionLabTests.filter(l => typeof l === 'string' && l.trim() !== ''),
        };
        await prescriptionAPI.createPrescription(payload);
      } else if (showModal === 'certificate') {
        await certificateAPI.createCertificate({ 
          ...formData, 
          patient_id: patientId, 
          clinic_id: clinicId, 
          doctor_id: doctorId 
        });
      } else if (showModal === 'instruction') {
        await instructionAPI.createInstruction({ 
          ...formData, 
          patient_id: patientId, 
          clinic_id: clinicId, 
          doctor_id: doctorId 
        });
      } else if (showModal === 'consent') {
        await consentAPI.createConsent({ 
          ...formData, 
          patient_id: patientId, 
          clinic_id: clinicId, 
          doctor_id: doctorId 
        });
      }

      setShowModal(null);
      setFormData({});
      setPrescriptionMedicines([]);
      setPrescriptionLabTests([]);
      setEditingMedIndex(null);
      setCurrentMed({ name: '', route: 'Oral', frequency: '1-0-1', no_of_days: 5, instruction: 'After Food', additional_comments: '' });
      loadPatientDetails();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create record.');
    }
  };

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Loading Patient Details...</div>;
  }

  if (!patient) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h2>Patient Not Found</h2>
        <button onClick={() => window.history.back()} className="btn btn-secondary" style={{ marginTop: '16px' }}>
          <ArrowLeft size={14} /> Go Back
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Header Profile Card */}
      <div className="card" style={{ marginBottom: '20px', padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <div className="sidebar-user-avatar" style={{ width: '56px', height: '56px', fontSize: '20px' }}>
            {patient.full_name ? patient.full_name[0].toUpperCase() : 'P'}
          </div>
          <div style={{ flex: 1, minWidth: '240px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h1 style={{ fontSize: '22px', fontWeight: 'bold' }}>{patient.full_name}</h1>
              <span className="badge badge-info">{patient.gender || 'Gender N/A'}</span>
              <span className="badge badge-success">{patient.age ? `${patient.age} Yrs` : 'Age N/A'}</span>
            </div>
            <div style={{ display: 'flex', gap: '16px', marginTop: '6px', fontSize: '13px', color: 'var(--color-text-secondary)', flexWrap: 'wrap' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Phone size={14} /> {patient.phone || 'N/A'}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Mail size={14} /> {patient.email || 'N/A'}</span>
              <span>Blood Group: <strong>{patient.blood_group || 'N/A'}</strong></span>
              <span>Clinic: <strong>{patient.clinic_id?.name || 'Clinic'}</strong></span>
            </div>
          </div>
          <button className="btn btn-secondary" onClick={() => window.history.back()}>
            <ArrowLeft size={14} /> Back
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{ display: 'flex', gap: '4px', borderBottom: '1px solid var(--color-border)', marginBottom: '20px', overflowX: 'auto' }}>
        {[
          { id: 'profile', title: 'Profile & Info', icon: <User size={16} /> },
          { id: 'appointments', title: `Appointments (${appointments.length})`, icon: <CalendarDays size={16} /> },
          { id: 'prescriptions', title: `Prescriptions (${prescriptions.length})`, icon: <FileSpreadsheet size={16} /> },
          { id: 'certificates', title: `Certificates (${certificates.length})`, icon: <FileBadge size={16} /> },
          { id: 'instructions', title: `Instructions (${instructions.length})`, icon: <FileText size={16} /> },
          { id: 'consents', title: `Consents (${consents.length})`, icon: <ClipboardCheck size={16} /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="btn"
            style={{
              borderRadius: '8px 8px 0 0',
              borderBottom: activeTab === tab.id ? '2px solid var(--color-primary)' : 'none',
              color: activeTab === tab.id ? 'var(--color-primary)' : 'var(--color-text-secondary)',
              background: activeTab === tab.id ? 'var(--color-primary-light)' : 'transparent',
              fontWeight: activeTab === tab.id ? 'bold' : 'normal',
              padding: '8px 16px',
              fontSize: '13px'
            }}
          >
            {tab.icon}
            <span>{tab.title}</span>
          </button>
        ))}
      </div>

      {/* TAB CONTENT */}

      {/* Tab 1: Profile */}
      {activeTab === 'profile' && (
        <div className="card">
          <h3 style={{ fontSize: '15px', fontWeight: 'bold', marginBottom: '16px' }}>Demographic Details</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', fontSize: '13px' }}>
            <div>
              <div style={{ color: 'var(--color-text-tertiary)', fontSize: '11px' }}>Full Name</div>
              <div style={{ fontWeight: '500' }}>{patient.full_name}</div>
            </div>
            <div>
              <div style={{ color: 'var(--color-text-tertiary)', fontSize: '11px' }}>Phone Number</div>
              <div style={{ fontWeight: '500' }}>{patient.phone || 'N/A'}</div>
            </div>
            <div>
              <div style={{ color: 'var(--color-text-tertiary)', fontSize: '11px' }}>Email Address</div>
              <div style={{ fontWeight: '500' }}>{patient.email || 'N/A'}</div>
            </div>
            <div>
              <div style={{ color: 'var(--color-text-tertiary)', fontSize: '11px' }}>Gender / Age</div>
              <div style={{ fontWeight: '500' }}>{patient.gender || 'N/A'} ({patient.age ? `${patient.age} Yrs` : 'N/A'})</div>
            </div>
            <div>
              <div style={{ color: 'var(--color-text-tertiary)', fontSize: '11px' }}>Blood Group</div>
              <div style={{ fontWeight: '500' }}>{patient.blood_group || 'N/A'}</div>
            </div>
            <div>
              <div style={{ color: 'var(--color-text-tertiary)', fontSize: '11px' }}>Known Allergies</div>
              <div style={{ fontWeight: '500', color: patient.allergies ? 'var(--color-danger)' : 'inherit' }}>{patient.allergies || 'None'}</div>
            </div>
            <div>
              <div style={{ color: 'var(--color-text-tertiary)', fontSize: '11px' }}>Medical History & Notes</div>
              <div style={{ fontWeight: '500' }}>{patient.medical_notes || 'No recorded history.'}</div>
            </div>
            <div>
              <div style={{ color: 'var(--color-text-tertiary)', fontSize: '11px' }}>Physical Address</div>
              <div style={{ fontWeight: '500' }}>{patient.address || 'N/A'}</div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Appointments */}
      {activeTab === 'appointments' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 'bold' }}>Appointments History</h3>
            <button className="btn btn-primary" onClick={() => setShowModal('appointment')}>
              <Plus size={14} /> Schedule Appointment
            </button>
          </div>

          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Time Slot</th>
                  <th>Doctor</th>
                  <th>Notes</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((a) => (
                  <tr key={a._id}>
                    <td>{new Date(a.date).toLocaleDateString()}</td>
                    <td>{a.time || a.time_slot || '10:00 AM'}</td>
                    <td>{a.doctor_id?.full_name || 'Primary Doctor'}</td>
                    <td>{a.notes || '-'}</td>
                    <td>
                      <span className={`badge ${a.status === 'completed' ? 'badge-success' : a.status === 'cancelled' ? 'badge-danger' : 'badge-info'}`}>
                        {a.status || 'scheduled'}
                      </span>
                    </td>
                  </tr>
                ))}
                {appointments.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '24px', color: 'var(--color-text-tertiary)' }}>
                      No appointments recorded for this patient.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Prescriptions */}
      {activeTab === 'prescriptions' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 'bold' }}>Prescriptions Log</h3>
            <button className="btn btn-primary" onClick={() => setShowModal('prescription')}>
              <Plus size={14} /> Create Full Prescription
            </button>
          </div>

          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Diagnosis</th>
                  <th>Vitals (BP / Temp / Pulse)</th>
                  <th>Medicines Count</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {prescriptions.map((pr) => (
                  <tr key={pr._id}>
                    <td>{new Date(pr.createdAt).toLocaleDateString()}</td>
                    <td style={{ fontWeight: 'bold' }}>{pr.clinical?.diagnosis || pr.diagnosis || 'General Checkup'}</td>
                    <td>
                      {pr.vitals ? `${pr.vitals.blood_pressure || '-'} BP | ${pr.vitals.temperature || '-'} °F | ${pr.vitals.pulse_rate || '-'} bpm` : '-'}
                    </td>
                    <td>{pr.medicines?.length || 0} Medicines</td>
                    <td>
                      <button 
                        className="btn btn-secondary" 
                        style={{ padding: '4px 10px', fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                        onClick={() => {
                          setPdfType('prescription');
                          setPdfData(pr);
                          setPdfModalOpen(true);
                        }}
                      >
                        <Printer size={12} /> View/Print
                      </button>
                    </td>
                  </tr>
                ))}
                {prescriptions.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '24px', color: 'var(--color-text-tertiary)' }}>
                      No prescriptions created for this patient.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Certificates */}
      {activeTab === 'certificates' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 'bold' }}>Medical Certificates</h3>
            <button className="btn btn-primary" onClick={() => setShowModal('certificate')}>
              <Plus size={14} /> Generate Certificate
            </button>
          </div>

          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Issue Date</th>
                  <th>Duration</th>
                  <th>Remarks / Content</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {certificates.map((c) => (
                  <tr key={c._id}>
                    <td style={{ fontWeight: 'bold' }}>{c.certificate_type || 'Medical Certificate'}</td>
                    <td>{new Date(c.createdAt).toLocaleDateString()}</td>
                    <td>{c.duration || 'N/A'}</td>
                    <td>{c.content || c.remark || 'Medical clearance issued.'}</td>
                    <td>
                      <button 
                        className="btn btn-secondary" 
                        style={{ padding: '4px 10px', fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                        onClick={() => {
                          setPdfType('certificate');
                          setPdfData(c);
                          setPdfModalOpen(true);
                        }}
                      >
                        <Printer size={12} /> Print PDF
                      </button>
                    </td>
                  </tr>
                ))}
                {certificates.length === 0 && (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', padding: '24px', color: 'var(--color-text-tertiary)' }}>
                      No medical certificates issued for this patient.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 5: Instructions */}
      {activeTab === 'instructions' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 'bold' }}>Patient Instructions</h3>
            <button className="btn btn-primary" onClick={() => setShowModal('instruction')}>
              <Plus size={14} /> Add Instruction
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {instructions.map((inst) => (
              <div key={inst._id} className="card" style={{ padding: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{inst.title || 'Instruction Note'}</div>
                  <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>{inst.description || inst.content}</div>
                  <div style={{ fontSize: '10px', color: 'var(--color-text-tertiary)', marginTop: '8px' }}>
                    Added: {new Date(inst.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <button 
                  className="btn btn-secondary" 
                  style={{ padding: '4px 10px', fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                  onClick={() => {
                    setPdfType('instruction');
                    setPdfData(inst);
                    setPdfModalOpen(true);
                  }}
                >
                  <Printer size={12} /> Print PDF
                </button>
              </div>
            ))}
            {instructions.length === 0 && (
              <div className="card" style={{ textAlign: 'center', padding: '24px', color: 'var(--color-text-tertiary)' }}>
                No custom instructions added for this patient.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 6: Consents */}
      {activeTab === 'consents' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 'bold' }}>Consent Forms</h3>
            <button className="btn btn-primary" onClick={() => setShowModal('consent')}>
              <Plus size={14} /> Add Consent Form
            </button>
          </div>

          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Form Title</th>
                  <th>Content Summary</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {consents.map((cs) => (
                  <tr key={cs._id}>
                    <td style={{ fontWeight: 'bold' }}>{cs.title || 'General Medical Consent'}</td>
                    <td>{cs.content?.substring(0, 60)}...</td>
                    <td>{new Date(cs.createdAt).toLocaleDateString()}</td>
                    <td><span className="badge badge-success">Signed & Agreed</span></td>
                    <td>
                      <button 
                        className="btn btn-secondary" 
                        style={{ padding: '4px 10px', fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                        onClick={() => {
                          setPdfType('consent');
                          setPdfData(cs);
                          setPdfModalOpen(true);
                        }}
                      >
                        <Printer size={12} /> Print PDF
                      </button>
                    </td>
                  </tr>
                ))}
                {consents.length === 0 && (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', padding: '24px', color: 'var(--color-text-tertiary)' }}>
                      No consent forms on record for this patient.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* RIGHT SIDE FORM DRAWER MATCHING BACKEND SCHEMA EXACTLY */}
      {showModal && (
        <div className="right-drawer-backdrop" onClick={() => setShowModal(null)}>
          <div className={`right-drawer-panel ${showModal === 'prescription' ? 'wide' : ''}`} onClick={(e) => e.stopPropagation()}>
            <div className="right-drawer-header">
              <h3 className="right-drawer-title">
                Add {showModal} for {patient.full_name}
              </h3>
              <button 
                type="button" 
                className="icon-btn" 
                onClick={() => setShowModal(null)}
                title="Close"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateRecord} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
              <div className="right-drawer-body">
                {/* APPOINTMENT FORM */}
                {showModal === 'appointment' && (
                  <>
                    <div className="form-row" style={{ marginBottom: '12px' }}>
                      <div className="form-group" style={{ flex: 1 }}>
                        <label className="input-label">Appointment Date *</label>
                        <input type="date" className="input-field" required onChange={(e) => setFormData({ ...formData, date: e.target.value })} />
                      </div>
                      <div className="form-group" style={{ flex: 1 }}>
                        <label className="input-label">Appointment Time *</label>
                        <input type="text" className="input-field" placeholder="10:00 AM" required onChange={(e) => setFormData({ ...formData, time: e.target.value })} />
                      </div>
                    </div>
                    <div className="form-group" style={{ marginBottom: '12px' }}>
                      <label className="input-label">Status</label>
                      <select className="input-field" onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
                        <option value="scheduled">Scheduled</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="rescheduled">Rescheduled</option>
                      </select>
                    </div>
                    <div className="form-group" style={{ marginBottom: '12px' }}>
                      <label className="input-label">Appointment Notes</label>
                      <textarea className="input-field" placeholder="Reason for visit..." onChange={(e) => setFormData({ ...formData, notes: e.target.value })} />
                    </div>
                  </>
                )}

                {/* PRESCRIPTION FORM (3 STEP TABS: Case History, Medicines, Lab Tests) */}
                {showModal === 'prescription' && (
                  <div>
                    {/* Step Tab Indicator */}
                    <div style={{ display: 'flex', gap: '6px', backgroundColor: 'var(--color-bg-secondary)', padding: '4px', borderRadius: 'var(--radius-md)', marginBottom: '16px' }}>
                      <button
                        type="button"
                        onClick={() => setPrescriptionSubTab('case_history')}
                        style={{
                          flex: 1,
                          padding: '8px 10px',
                          fontSize: '12px',
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
                        <Stethoscope size={14} /> 1. Case History & Vitals
                      </button>
                      <button
                        type="button"
                        onClick={() => setPrescriptionSubTab('medicines')}
                        style={{
                          flex: 1,
                          padding: '8px 10px',
                          fontSize: '12px',
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
                        <Pill size={14} /> 2. Medicines ({prescriptionMedicines.filter(m => m.name && m.name.trim()).length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setPrescriptionSubTab('labs')}
                        style={{
                          flex: 1,
                          padding: '8px 10px',
                          fontSize: '12px',
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
                        <FlaskConical size={14} /> 3. Lab Tests ({prescriptionLabTests.length})
                      </button>
                    </div>

                    {/* SUB TAB 1: CASE HISTORY & VITALS */}
                    {prescriptionSubTab === 'case_history' && (
                      <div>
                        {/* Vitals Section */}
                        <h4 style={{ fontSize: '13px', fontWeight: 'bold', borderBottom: '1px solid var(--color-border)', paddingBottom: '4px', marginBottom: '12px', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Stethoscope size={14} /> Vitals (Optional)
                        </h4>
                        <div className="form-row" style={{ marginBottom: '10px' }}>
                          <div className="form-group" style={{ flex: 1 }}>
                            <label className="form-label" style={{ fontSize: '11px' }}>Weight (kg)</label>
                            <input type="number" className="input-field" placeholder="e.g. 65" value={formData.weight || ''} onChange={(e) => setFormData({ ...formData, weight: e.target.value })} />
                          </div>
                          <div className="form-group" style={{ flex: 1 }}>
                            <label className="form-label" style={{ fontSize: '11px' }}>Height (cm)</label>
                            <input type="number" className="input-field" placeholder="e.g. 170" value={formData.height || ''} onChange={(e) => setFormData({ ...formData, height: e.target.value })} />
                          </div>
                          <div className="form-group" style={{ flex: 1 }}>
                            <label className="form-label" style={{ fontSize: '11px' }}>Temp (°F)</label>
                            <input type="text" className="input-field" placeholder="e.g. 98.6" value={formData.temperature || ''} onChange={(e) => setFormData({ ...formData, temperature: e.target.value })} />
                          </div>
                        </div>
                        <div className="form-row" style={{ marginBottom: '10px' }}>
                          <div className="form-group" style={{ flex: 1 }}>
                            <label className="form-label" style={{ fontSize: '11px' }}>BP (mmHg)</label>
                            <input type="text" className="input-field" placeholder="e.g. 120/80" value={formData.blood_pressure || ''} onChange={(e) => setFormData({ ...formData, blood_pressure: e.target.value })} />
                          </div>
                          <div className="form-group" style={{ flex: 1 }}>
                            <label className="form-label" style={{ fontSize: '11px' }}>Pulse (bpm)</label>
                            <input type="number" className="input-field" placeholder="e.g. 72" value={formData.pulse_rate || ''} onChange={(e) => setFormData({ ...formData, pulse_rate: e.target.value })} />
                          </div>
                          <div className="form-group" style={{ flex: 1 }}>
                            <label className="form-label" style={{ fontSize: '11px' }}>SpO2 (%)</label>
                            <input type="number" className="input-field" placeholder="e.g. 98" value={formData.spo2 || ''} onChange={(e) => setFormData({ ...formData, spo2: e.target.value })} />
                          </div>
                        </div>
                        <div className="form-row" style={{ marginBottom: '16px' }}>
                          <div className="form-group" style={{ flex: 1 }}>
                            <label className="form-label" style={{ fontSize: '11px' }}>Blood Sugar (mg/dL)</label>
                            <input type="number" className="input-field" placeholder="e.g. 110" value={formData.blood_sugar || ''} onChange={(e) => setFormData({ ...formData, blood_sugar: e.target.value })} />
                          </div>
                          <div className="form-group" style={{ flex: 1 }}>
                            <label className="form-label" style={{ fontSize: '11px' }}>Hemoglobin (g/dL)</label>
                            <input type="number" className="input-field" placeholder="e.g. 13.5" value={formData.hemoglobin || ''} onChange={(e) => setFormData({ ...formData, hemoglobin: e.target.value })} />
                          </div>
                          <div className="form-group" style={{ flex: 1 }}>
                            <label className="form-label" style={{ fontSize: '11px' }}>Respiration Rate</label>
                            <input type="number" className="input-field" placeholder="e.g. 16" value={formData.respiration_rate || ''} onChange={(e) => setFormData({ ...formData, respiration_rate: e.target.value })} />
                          </div>
                        </div>

                        {/* Clinical Notes Section */}
                        <h4 style={{ fontSize: '13px', fontWeight: 'bold', borderBottom: '1px solid var(--color-border)', paddingBottom: '4px', marginBottom: '12px', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <FileText size={14} /> Clinical Assessment & Diagnosis
                        </h4>
                        <div className="form-row" style={{ marginBottom: '10px' }}>
                          <div className="form-group" style={{ flex: 1 }}>
                            <label className="form-label" style={{ fontSize: '11px' }}>Allergies</label>
                            <input type="text" className="input-field" placeholder="e.g. Penicillin, Dust" value={formData.allergy || ''} onChange={(e) => setFormData({ ...formData, allergy: e.target.value })} />
                          </div>
                          <div className="form-group" style={{ flex: 1 }}>
                            <label className="form-label" style={{ fontSize: '11px' }}>Chief Complaint</label>
                            <input type="text" className="input-field" placeholder="e.g. Severe toothache" value={formData.chief_complaint || ''} onChange={(e) => setFormData({ ...formData, chief_complaint: e.target.value })} />
                          </div>
                        </div>
                        <div className="form-row" style={{ marginBottom: '10px' }}>
                          <div className="form-group" style={{ flex: 1 }}>
                            <label className="form-label" style={{ fontSize: '11px' }}>Patient History</label>
                            <textarea className="input-field" style={{ height: '60px' }} placeholder="Pre-existing medical conditions..." value={formData.patient_history || ''} onChange={(e) => setFormData({ ...formData, patient_history: e.target.value })} />
                          </div>
                          <div className="form-group" style={{ flex: 1 }}>
                            <label className="form-label" style={{ fontSize: '11px' }}>Findings</label>
                            <textarea className="input-field" style={{ height: '60px' }} placeholder="Clinical observation findings..." value={formData.findings || ''} onChange={(e) => setFormData({ ...formData, findings: e.target.value })} />
                          </div>
                        </div>
                        <div className="form-row" style={{ marginBottom: '10px' }}>
                          <div className="form-group" style={{ flex: 1 }}>
                            <label className="form-label" style={{ fontSize: '11px' }}>Diagnosis</label>
                            <input type="text" className="input-field" placeholder="e.g. Acute Pulpitis" value={formData.diagnosis || ''} onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })} />
                          </div>
                          <div className="form-group" style={{ flex: 1 }}>
                            <label className="form-label" style={{ fontSize: '11px' }}>Treatment / Advice</label>
                            <input type="text" className="input-field" placeholder="e.g. Root Canal Treatment advised" value={formData.treatment || ''} onChange={(e) => setFormData({ ...formData, treatment: e.target.value })} />
                          </div>
                        </div>
                        <div className="form-group" style={{ marginBottom: '16px' }}>
                          <label className="form-label" style={{ fontSize: '11px' }}>End Note / General Doctor Note</label>
                          <input type="text" className="input-field" placeholder="e.g. Drink plenty of warm water" value={formData.notes || ''} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} />
                        </div>

                        {/* Follow-up Section */}
                        <h4 style={{ fontSize: '13px', fontWeight: 'bold', borderBottom: '1px solid var(--color-border)', paddingBottom: '4px', marginBottom: '12px', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <CalendarDays size={14} /> Followup Schedule
                        </h4>
                        <div style={{ display: 'flex', gap: '6px', marginBottom: '12px', flexWrap: 'wrap' }}>
                          <button type="button" className="quick-chip" onClick={() => handleSetFollowUpDays(1)}>+ 1 Day</button>
                          <button type="button" className="quick-chip" onClick={() => handleSetFollowUpDays(7)}>+ 1 Week</button>
                          <button type="button" className="quick-chip" onClick={() => handleSetFollowUpDays(15)}>+ 15 Days</button>
                          <button type="button" className="quick-chip" onClick={() => handleSetFollowUpDays(30)}>+ 1 Month</button>
                        </div>
                        <div className="form-row" style={{ marginBottom: '12px' }}>
                          <div className="form-group" style={{ flex: 1 }}>
                            <label className="form-label" style={{ fontSize: '11px' }}>Followup Date</label>
                            <input type="date" className="input-field" value={formData.follow_up_date || ''} onChange={(e) => setFormData({ ...formData, follow_up_date: e.target.value })} />
                          </div>
                          <div className="form-group" style={{ flex: 1 }}>
                            <label className="form-label" style={{ fontSize: '11px' }}>Time Slot</label>
                            <input type="text" className="input-field" placeholder="10:00 AM" value={formData.follow_up_time || ''} onChange={(e) => setFormData({ ...formData, follow_up_time: e.target.value })} />
                          </div>
                          <div className="form-group" style={{ flex: 1 }}>
                            <label className="form-label" style={{ fontSize: '11px' }}>Purpose</label>
                            <input type="text" className="input-field" placeholder="e.g. Review & checkup" value={formData.follow_up_purpose || ''} onChange={(e) => setFormData({ ...formData, follow_up_purpose: e.target.value })} />
                          </div>
                        </div>

                        <div style={{ textAlign: 'right', marginTop: '16px' }}>
                          <button type="button" className="btn btn-primary" onClick={() => setPrescriptionSubTab('medicines')}>
                            Next: Prescribe Medicines <ChevronRight size={14} />
                          </button>
                        </div>
                      </div>
                    )}

                    {/* SUB TAB 2: MEDICINES */}
                    {prescriptionSubTab === 'medicines' && (
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                          <h4 style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--color-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Pill size={14} /> Prescribed Medicines ({prescriptionMedicines.length})
                          </h4>
                          <button 
                            type="button" 
                            className="btn btn-secondary" 
                            style={{ padding: '4px 10px', fontSize: '12px', color: 'var(--color-primary)', borderColor: 'var(--color-primary)' }}
                            onClick={() => setShowTemplatePicker('medicine')}
                          >
                            <Copy size={13} /> Select Template
                          </button>
                        </div>

                        {/* List of Added Medicines */}
                        {prescriptionMedicines.length > 0 ? (
                          <div style={{ marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {prescriptionMedicines.map((med, idx) => (
                              <div key={idx} style={{ background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '10px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                  <div style={{ fontWeight: 'bold', fontSize: '13px', color: 'var(--color-text-primary)' }}>
                                    {med.name} <span className="badge badge-info">{med.route || 'Oral'}</span>
                                  </div>
                                  <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                                    Frequency: <strong>{med.frequency || '1-0-1'}</strong> | Duration: <strong>{med.no_of_days} Days</strong> | Instruction: <strong>{med.instruction || 'After Food'}</strong>
                                    {med.additional_comments && ` (${med.additional_comments})`}
                                  </div>
                                </div>
                                <div style={{ display: 'flex', gap: '4px' }}>
                                  <button type="button" className="icon-btn" style={{ color: 'var(--color-primary)' }} onClick={() => handleEditMedicine(idx)} title="Edit">
                                    <Edit2 size={14} />
                                  </button>
                                  <button type="button" className="icon-btn" style={{ color: 'var(--color-danger)' }} onClick={() => handleRemoveMedicineRow(idx)} title="Delete">
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div style={{ padding: '16px', textAlign: 'center', background: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-md)', marginBottom: '16px', color: 'var(--color-text-tertiary)', fontSize: '12px' }}>
                            No medicines added yet. Select a template or add a medicine below.
                          </div>
                        )}

                        {/* Medicine Entry Form Box */}
                        <div style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border-strong)', borderRadius: 'var(--radius-lg)', padding: '14px', marginBottom: '16px' }}>
                          <div style={{ fontWeight: 'bold', fontSize: '12px', marginBottom: '10px', color: 'var(--color-text-primary)' }}>
                            {editingMedIndex !== null ? `Edit Medicine #${editingMedIndex + 1}` : 'Add New Medicine'}
                          </div>

                          {/* Medicine Name with Suggestions */}
                          <div className="form-group" style={{ marginBottom: '10px', position: 'relative' }}>
                            <label className="form-label" style={{ fontSize: '11px', fontWeight: 'bold' }}>Medicine Name *</label>
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
                                          quantity: m.quantity || m.qty || 1,
                                          route: m.route || m.form || 'Oral',
                                          frequency: m.frequency || m.freq || '1-0-1',
                                          no_of_days: m.no_of_days || m.days || m.noOfDays || 5,
                                          instruction: m.instruction || m.instructions || 'After Food',
                                          additional_comments: m.additional_comments || m.comment || m.additionalComment || '',
                                        });
                                        setShowMedSuggestions(false);
                                      }}
                                    >
                                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                                        <div style={{ fontWeight: '600', color: 'var(--color-text-primary)' }}>{m.name || m.medicine_name}</div>
                                        {m.is_clinic_medicine ? (
                                          <span className="badge badge-primary" style={{ fontSize: '10px', padding: '1px 5px' }}>Clinic</span>
                                        ) : (
                                          <span className="badge badge-secondary" style={{ fontSize: '10px', padding: '1px 5px', opacity: 0.75 }}>Master</span>
                                        )}
                                      </div>
                                      <div style={{ fontSize: '10px', color: 'var(--color-text-tertiary)', marginTop: '2px' }}>
                                        {[m.route || m.form, m.frequency || m.freq, (m.no_of_days || m.days || m.noOfDays) ? `${m.no_of_days || m.days || m.noOfDays} days` : null, m.instruction || m.instructions].filter(Boolean).join(' • ') || 'Medicine'}
                                      </div>
                                    </div>
                                  ))}
                              </div>
                            )}
                          </div>

                          <div className="form-row" style={{ marginBottom: '10px' }}>
                            <div className="form-group" style={{ flex: 1 }}>
                              <label className="form-label" style={{ fontSize: '11px' }}>Route / Type</label>
                              <select className="input-field" value={currentMed.route} onChange={(e) => setCurrentMed({ ...currentMed, route: e.target.value })}>
                                {masterRoutes.map(r => (
                                  <option key={r} value={r}>{r}</option>
                                ))}
                              </select>
                            </div>
                            <div className="form-group" style={{ flex: 1 }}>
                              <label className="form-label" style={{ fontSize: '11px' }}>Frequency</label>
                              <select className="input-field" value={currentMed.frequency} onChange={(e) => setCurrentMed({ ...currentMed, frequency: e.target.value })}>
                                {masterFrequencies.map(f => (
                                  <option key={f} value={f}>{f}</option>
                                ))}
                              </select>
                            </div>
                            <div className="form-group" style={{ flex: 1 }}>
                              <label className="form-label" style={{ fontSize: '11px' }}>Duration (Days)</label>
                              <input type="number" className="input-field" placeholder="5" value={currentMed.no_of_days} onChange={(e) => setCurrentMed({ ...currentMed, no_of_days: Number(e.target.value) })} />
                            </div>
                          </div>

                          <div className="form-row" style={{ marginBottom: '10px' }}>
                            <div className="form-group" style={{ flex: 1 }}>
                              <label className="form-label" style={{ fontSize: '11px' }}>Instruction</label>
                              <select className="input-field" value={currentMed.instruction} onChange={(e) => setCurrentMed({ ...currentMed, instruction: e.target.value })}>
                                {masterInstructions.map(ins => (
                                  <option key={ins} value={ins}>{ins}</option>
                                ))}
                              </select>
                            </div>
                            <div className="form-group" style={{ flex: 1 }}>
                              <label className="form-label" style={{ fontSize: '11px' }}>Additional Comments</label>
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

                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px' }}>
                          <button type="button" className="btn btn-secondary" onClick={() => setPrescriptionSubTab('case_history')}>
                            Back: Case History
                          </button>
                          <button type="button" className="btn btn-primary" onClick={() => setPrescriptionSubTab('labs')}>
                            Next: Lab Tests & Imaging <ChevronRight size={14} />
                          </button>
                        </div>
                      </div>
                    )}

                    {/* SUB TAB 3: LAB TESTS */}
                    {prescriptionSubTab === 'labs' && (
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                          <h4 style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--color-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <FlaskConical size={14} /> Lab Tests & Investigations ({prescriptionLabTests.length})
                          </h4>
                          <button 
                            type="button" 
                            className="btn btn-secondary" 
                            style={{ padding: '4px 10px', fontSize: '12px', color: 'var(--color-primary)', borderColor: 'var(--color-primary)' }}
                            onClick={() => setShowTemplatePicker('lab')}
                          >
                            <Copy size={13} /> Select Template
                          </button>
                        </div>

                        {/* Added Lab Tests Chips */}
                        <div style={{ marginBottom: '16px' }}>
                          {prescriptionLabTests.length > 0 ? (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                              {prescriptionLabTests.map((labName, idx) => (
                                <div key={idx} className="badge badge-info" style={{ padding: '6px 10px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <span>{labName}</span>
                                  <button type="button" onClick={() => handleRemoveLabTest(idx)} style={{ background: 'none', border: 'none', color: 'currentColor', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                                    <X size={12} />
                                  </button>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div style={{ padding: '16px', textAlign: 'center', background: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-md)', color: 'var(--color-text-tertiary)', fontSize: '12px' }}>
                              No lab tests added. Pick from quick suggestions below or search lab tests.
                            </div>
                          )}
                        </div>

                        {/* Quick Common Lab Test Chips */}
                        <div style={{ marginBottom: '16px' }}>
                          <div style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--color-text-tertiary)', marginBottom: '6px' }}>
                            Quick Suggestions:
                          </div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
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
                                className={`quick-chip ${prescriptionLabTests.includes(quickLab) ? 'active' : ''}`}
                                onClick={() => handleAddLabTest(quickLab)}
                              >
                                + {quickLab}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Search & Custom Lab Entry */}
                        <div style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border-strong)', borderRadius: 'var(--radius-lg)', padding: '14px', marginBottom: '16px' }}>
                          <label className="form-label" style={{ fontSize: '11px', fontWeight: 'bold' }}>Add Lab Test / Investigation *</label>
                          <div style={{ display: 'flex', gap: '8px', position: 'relative', marginTop: '4px' }}>
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
                                          <span style={{ fontSize: '10px', color: 'var(--color-text-tertiary)' }}>{l.category || 'Lab Test'}</span>
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

                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px' }}>
                          <button type="button" className="btn btn-secondary" onClick={() => setPrescriptionSubTab('medicines')}>
                            Back: Medicines
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* CERTIFICATE FORM */}
                {showModal === 'certificate' && (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' }}>
                      <button type="button" className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '12px', color: 'var(--color-primary)', borderColor: 'var(--color-primary)' }} onClick={() => setShowTemplatePicker('certificate')}>
                        <Copy size={13} /> Select Template
                      </button>
                    </div>
                    <div className="form-group" style={{ marginBottom: '12px' }}>
                      <label className="input-label">Certificate Type *</label>
                      <select className="input-field" required value={formData.certificate_type || ''} onChange={(e) => setFormData({ ...formData, certificate_type: e.target.value })}>
                        <option value="">Select Certificate Type</option>
                        <option value="Medical Leave">Medical Leave</option>
                        <option value="Fitness Certificate">Fitness Certificate</option>
                        <option value="Medical Fitness">Medical Fitness</option>
                        <option value="Referral Certificate">Referral Certificate</option>
                        <option value="Sick Leave">Sick Leave</option>
                        <option value="Return To Work">Return To Work</option>
                        <option value="General">General</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div className="form-group" style={{ marginBottom: '12px' }}>
                      <label className="input-label">Duration</label>
                      <input type="text" className="input-field" placeholder="e.g. 3 Days (14th to 17th July)" value={formData.duration || ''} onChange={(e) => setFormData({ ...formData, duration: e.target.value })} />
                    </div>
                    <div className="form-group" style={{ marginBottom: '12px' }}>
                      <label className="input-label">Certificate Body Content *</label>
                      <textarea className="input-field" placeholder="This is to certify that..." required value={formData.content || ''} onChange={(e) => setFormData({ ...formData, content: e.target.value })} />
                    </div>
                    <div className="form-group" style={{ marginBottom: '12px' }}>
                      <label className="input-label">Remarks / Diagnosis</label>
                      <input type="text" className="input-field" placeholder="e.g. Advised complete bed rest" value={formData.remark || ''} onChange={(e) => setFormData({ ...formData, remark: e.target.value })} />
                    </div>
                  </>
                )}

                {/* INSTRUCTION FORM */}
                {showModal === 'instruction' && (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' }}>
                      <button type="button" className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '12px', color: 'var(--color-primary)', borderColor: 'var(--color-primary)' }} onClick={() => setShowTemplatePicker('instruction')}>
                        <Copy size={13} /> Select Template
                      </button>
                    </div>
                    <div className="form-group" style={{ marginBottom: '12px' }}>
                      <label className="input-label">Instruction Title *</label>
                      <input type="text" className="input-field" placeholder="e.g. Post Operative Care" required value={formData.title || ''} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
                    </div>
                    <div className="form-group" style={{ marginBottom: '12px' }}>
                      <label className="input-label">Description / Guidance *</label>
                      <textarea className="input-field" placeholder="Detailed instruction notes..." required value={formData.description || ''} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                    </div>
                  </>
                )}

                {/* CONSENT FORM */}
                {showModal === 'consent' && (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' }}>
                      <button type="button" className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '12px', color: 'var(--color-primary)', borderColor: 'var(--color-primary)' }} onClick={() => setShowTemplatePicker('consent')}>
                        <Copy size={13} /> Select Template
                      </button>
                    </div>
                    <div className="form-group" style={{ marginBottom: '12px' }}>
                      <label className="input-label">Consent Form Title *</label>
                      <input type="text" className="input-field" placeholder="e.g. Dental Surgery Consent" required value={formData.title || ''} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
                    </div>
                    <div className="form-group" style={{ marginBottom: '12px' }}>
                      <label className="input-label">Consent Agreement Body *</label>
                      <textarea className="input-field" placeholder="I hereby give consent..." required value={formData.content || ''} onChange={(e) => setFormData({ ...formData, content: e.target.value })} />
                    </div>
                  </>
                )}
              </div>

              <div className="right-drawer-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Record</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TEMPLATE PICKER MODAL */}
      {showTemplatePicker && (
        <div className="right-drawer-backdrop" onClick={() => setShowTemplatePicker(null)}>
          <div className="right-drawer-panel" style={{ maxWidth: '520px' }} onClick={(e) => e.stopPropagation()}>
            <div className="right-drawer-header">
              <h3 className="right-drawer-title">
                <Sparkles size={18} color="var(--color-primary)" /> Select {showTemplatePicker.charAt(0).toUpperCase() + showTemplatePicker.slice(1)} Template
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
                    if (showTemplatePicker === 'consent') return tType.includes('consent');
                    if (showTemplatePicker === 'instruction') return tType.includes('instruction');
                    if (showTemplatePicker === 'certificate') return tType.includes('certificate');
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

                      {(tpl.content || tpl.remarks) && (
                        <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginTop: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {tpl.content || tpl.remarks}
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
                  No templates created yet. You can manage templates under the Templates menu.
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

      {/* PDF PREVIEW MODAL */}
      {pdfModalOpen && pdfData && (
        <PdfPreviewModal
          isOpen={pdfModalOpen}
          onClose={() => {
            setPdfModalOpen(false);
            setPdfData(null);
          }}
          type={pdfType}
          data={pdfData}
          patient={patient || pdfData.patient_id || {}}
          clinic={patient?.clinic_id || pdfData.clinic_id || user?.clinic_id || {}}
          doctor={patient?.doctor_id || pdfData.doctor_id || user || {}}
        />
      )}
    </div>
  );
}
