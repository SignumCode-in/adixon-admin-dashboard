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
  Edit2
} from 'lucide-react';
import { 
  patientAPI, 
  appointmentAPI, 
  prescriptionAPI, 
  certificateAPI, 
  instructionAPI, 
  consentAPI 
} from '../services/api';

export default function PatientDetails() {
  const { patientId } = useParams();
  const [patient, setPatient] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);

  // Tab Data States
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [instructions, setInstructions] = useState([]);
  const [consents, setConsents] = useState([]);

  // Modals
  const [showModal, setShowModal] = useState(null); // 'appointment' | 'prescription' | 'certificate' | 'instruction' | 'consent'
  const [formData, setFormData] = useState({});

  // Dynamic Medicine array for Prescription Form
  const [prescriptionMedicines, setPrescriptionMedicines] = useState([
    { name: '', quantity: 1, frequency: '1-0-1', route: 'Oral', no_of_days: 5, instruction: 'After Food', additional_comments: '' }
  ]);

  useEffect(() => {
    if (patientId) {
      loadPatientDetails();
    }
  }, [patientId]);

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

  const handleAddMedicineRow = () => {
    setPrescriptionMedicines([
      ...prescriptionMedicines,
      { name: '', quantity: 1, frequency: '1-0-1', route: 'Oral', no_of_days: 5, instruction: 'After Food', additional_comments: '' }
    ]);
  };

  const handleMedicineChange = (index, field, value) => {
    const updated = [...prescriptionMedicines];
    updated[index][field] = value;
    setPrescriptionMedicines(updated);
  };

  const handleRemoveMedicineRow = (index) => {
    setPrescriptionMedicines(prescriptionMedicines.filter((_, i) => i !== index));
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
          medicines: prescriptionMedicines.filter(m => m.name.trim() !== ''),
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
      setPrescriptionMedicines([{ name: '', quantity: 1, frequency: '1-0-1', route: 'Oral', no_of_days: 5, instruction: 'After Food', additional_comments: '' }]);
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
                      <button className="btn btn-secondary" style={{ padding: '2px 8px', fontSize: '11px' }}>
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
                </tr>
              </thead>
              <tbody>
                {certificates.map((c) => (
                  <tr key={c._id}>
                    <td style={{ fontWeight: 'bold' }}>{c.certificate_type || 'Medical Certificate'}</td>
                    <td>{new Date(c.createdAt).toLocaleDateString()}</td>
                    <td>{c.duration || 'N/A'}</td>
                    <td>{c.content || c.remark || 'Medical clearance issued.'}</td>
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
              <div key={inst._id} className="card" style={{ padding: '14px' }}>
                <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{inst.title || 'Instruction Note'}</div>
                <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>{inst.description || inst.content}</div>
                <div style={{ fontSize: '10px', color: 'var(--color-text-tertiary)', marginTop: '8px' }}>
                  Added: {new Date(inst.createdAt).toLocaleDateString()}
                </div>
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
                </tr>
              </thead>
              <tbody>
                {consents.map((cs) => (
                  <tr key={cs._id}>
                    <td style={{ fontWeight: 'bold' }}>{cs.title || 'General Medical Consent'}</td>
                    <td>{cs.content?.substring(0, 60)}...</td>
                    <td>{new Date(cs.createdAt).toLocaleDateString()}</td>
                    <td><span className="badge badge-success">Signed & Agreed</span></td>
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

      {/* FULL FORM CREATION MODALS MATCHING BACKEND SCHEMA EXACTLY */}
      {showModal && (
        <div className="modal-backdrop">
          <div className="modal-card" style={{ maxWidth: showModal === 'prescription' ? '750px' : '550px', maxHeight: '85vh', overflowY: 'auto' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '16px', textTransform: 'capitalize' }}>
              Add {showModal} for {patient.full_name}
            </h3>
            <form onSubmit={handleCreateRecord}>

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

              {/* PRESCRIPTION FORM (Full Vitals, Clinical, Medicines) */}
              {showModal === 'prescription' && (
                <>
                  {/* Vitals Section */}
                  <h4 style={{ fontSize: '13px', fontWeight: 'bold', borderBottom: '1px solid var(--color-border)', paddingBottom: '4px', marginBottom: '12px', color: 'var(--color-primary)' }}>
                    Patient Vitals
                  </h4>
                  <div className="form-row" style={{ marginBottom: '10px' }}>
                    <div className="form-group" style={{ flex: 1 }}><input type="text" className="input-field" placeholder="Blood Pressure (e.g. 120/80)" onChange={(e) => setFormData({ ...formData, blood_pressure: e.target.value })} /></div>
                    <div className="form-group" style={{ flex: 1 }}><input type="text" className="input-field" placeholder="Temperature (°F)" onChange={(e) => setFormData({ ...formData, temperature: e.target.value })} /></div>
                    <div className="form-group" style={{ flex: 1 }}><input type="number" className="input-field" placeholder="Pulse (bpm)" onChange={(e) => setFormData({ ...formData, pulse_rate: e.target.value })} /></div>
                  </div>
                  <div className="form-row" style={{ marginBottom: '12px' }}>
                    <div className="form-group" style={{ flex: 1 }}><input type="number" className="input-field" placeholder="SPO2 (%)" onChange={(e) => setFormData({ ...formData, spo2: e.target.value })} /></div>
                    <div className="form-group" style={{ flex: 1 }}><input type="number" className="input-field" placeholder="Weight (kg)" onChange={(e) => setFormData({ ...formData, weight: e.target.value })} /></div>
                    <div className="form-group" style={{ flex: 1 }}><input type="number" className="input-field" placeholder="Height (cm)" onChange={(e) => setFormData({ ...formData, height: e.target.value })} /></div>
                  </div>

                  {/* Clinical Info Section */}
                  <h4 style={{ fontSize: '13px', fontWeight: 'bold', borderBottom: '1px solid var(--color-border)', paddingBottom: '4px', marginBottom: '12px', color: 'var(--color-primary)' }}>
                    Clinical Diagnosis & Notes
                  </h4>
                  <div className="form-row" style={{ marginBottom: '10px' }}>
                    <div className="form-group" style={{ flex: 1 }}><input type="text" className="input-field" placeholder="Chief Complaint" onChange={(e) => setFormData({ ...formData, chief_complaint: e.target.value })} /></div>
                    <div className="form-group" style={{ flex: 1 }}><input type="text" className="input-field" placeholder="Diagnosis" onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })} /></div>
                  </div>
                  <div className="form-group" style={{ marginBottom: '12px' }}>
                    <textarea className="input-field" placeholder="Treatment & Clinical Notes..." onChange={(e) => setFormData({ ...formData, notes: e.target.value })} />
                  </div>

                  {/* Dynamic Medicines Section */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <h4 style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--color-primary)', margin: 0 }}>
                      Prescribed Medicines ({prescriptionMedicines.length})
                    </h4>
                    <button type="button" className="btn btn-secondary" style={{ padding: '2px 8px', fontSize: '11px' }} onClick={handleAddMedicineRow}>
                      + Add Medicine
                    </button>
                  </div>

                  {prescriptionMedicines.map((med, mIdx) => (
                    <div key={mIdx} style={{ background: 'var(--color-bg-secondary)', padding: '10px', borderRadius: 'var(--radius-md)', marginBottom: '8px' }}>
                      <div className="form-row" style={{ marginBottom: '6px' }}>
                        <div className="form-group" style={{ flex: 2 }}>
                          <input type="text" className="input-field" placeholder="Medicine Name *" required value={med.name} onChange={(e) => handleMedicineChange(mIdx, 'name', e.target.value)} />
                        </div>
                        <div className="form-group" style={{ flex: 1 }}>
                          <input type="text" className="input-field" placeholder="Frequency (1-0-1)" value={med.frequency} onChange={(e) => handleMedicineChange(mIdx, 'frequency', e.target.value)} />
                        </div>
                        <div className="form-group" style={{ flex: 1 }}>
                          <input type="number" className="input-field" placeholder="Days" value={med.no_of_days} onChange={(e) => handleMedicineChange(mIdx, 'no_of_days', e.target.value)} />
                        </div>
                        <button type="button" className="icon-btn" style={{ color: 'var(--color-danger)', alignSelf: 'center' }} onClick={() => handleRemoveMedicineRow(mIdx)}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                      <div className="form-row">
                        <div className="form-group" style={{ flex: 1 }}>
                          <input type="text" className="input-field" placeholder="Instruction (After Food)" value={med.instruction} onChange={(e) => handleMedicineChange(mIdx, 'instruction', e.target.value)} />
                        </div>
                        <div className="form-group" style={{ flex: 1 }}>
                          <input type="text" className="input-field" placeholder="Route (Oral)" value={med.route} onChange={(e) => handleMedicineChange(mIdx, 'route', e.target.value)} />
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              )}

              {/* CERTIFICATE FORM */}
              {showModal === 'certificate' && (
                <>
                  <div className="form-group" style={{ marginBottom: '12px' }}>
                    <label className="input-label">Certificate Type *</label>
                    <select className="input-field" required onChange={(e) => setFormData({ ...formData, certificate_type: e.target.value })}>
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
                    <input type="text" className="input-field" placeholder="e.g. 3 Days (14th to 17th July)" onChange={(e) => setFormData({ ...formData, duration: e.target.value })} />
                  </div>
                  <div className="form-group" style={{ marginBottom: '12px' }}>
                    <label className="input-label">Certificate Body Content *</label>
                    <textarea className="input-field" placeholder="This is to certify that..." required onChange={(e) => setFormData({ ...formData, content: e.target.value })} />
                  </div>
                  <div className="form-group" style={{ marginBottom: '12px' }}>
                    <label className="input-label">Remarks / Diagnosis</label>
                    <input type="text" className="input-field" placeholder="e.g. Advised complete bed rest" onChange={(e) => setFormData({ ...formData, remark: e.target.value })} />
                  </div>
                </>
              )}

              {/* INSTRUCTION FORM */}
              {showModal === 'instruction' && (
                <>
                  <div className="form-group" style={{ marginBottom: '12px' }}>
                    <label className="input-label">Instruction Title *</label>
                    <input type="text" className="input-field" placeholder="e.g. Post Operative Care" required onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
                  </div>
                  <div className="form-group" style={{ marginBottom: '12px' }}>
                    <label className="input-label">Description / Guidance *</label>
                    <textarea className="input-field" placeholder="Detailed instruction notes..." required onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                  </div>
                </>
              )}

              {/* CONSENT FORM */}
              {showModal === 'consent' && (
                <>
                  <div className="form-group" style={{ marginBottom: '12px' }}>
                    <label className="input-label">Consent Form Title *</label>
                    <input type="text" className="input-field" placeholder="e.g. Dental Surgery Consent" required onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
                  </div>
                  <div className="form-group" style={{ marginBottom: '12px' }}>
                    <label className="input-label">Consent Agreement Body *</label>
                    <textarea className="input-field" placeholder="I hereby give consent..." required onChange={(e) => setFormData({ ...formData, content: e.target.value })} />
                  </div>
                </>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '20px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Record</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
