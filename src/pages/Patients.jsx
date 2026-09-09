import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { patientAPI, dashboardAPI, appointmentAPI, instructionAPI, consentAPI, prescriptionAPI, labAPI, certificateAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useActiveClinicScope } from '../hooks/useActiveClinicScope';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import { 
  User, 
  PlusCircle, 
  Search, 
  Trash2, 
  Edit2, 
  Heart, 
  Calendar, 
  Stethoscope, 
  FileText, 
  ClipboardCheck, 
  FlaskConical, 
  Clipboard, 
  X, 
  ArrowLeft, 
  CheckCircle2, 
  ExternalLink 
} from 'lucide-react';

export default function Patients() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const activeClinicId = useActiveClinicScope();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Search & Clinic Filter State
  const [search, setSearch] = useState('');
  const [filterClinicId, setFilterClinicId] = useState(activeClinicId || 'all');

  // Page View Mode: 'list' | 'editor'
  const [viewMode, setViewMode] = useState('list');
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState(null);

  // Delete Confirmation Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Form states for Patient
  const [fullName, setFullName] = useState('');
  const [gender, setGender] = useState('Male');
  const [dob, setDob] = useState('');
  const [age, setAge] = useState(0);
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [allergies, setAllergies] = useState('');
  const [notes, setNotes] = useState('');
  const [address, setAddress] = useState('');

  // Clinic Search & Dropdown State
  const [clinicSearch, setClinicSearch] = useState('');
  const [selectedClinic, setSelectedClinic] = useState(null);
  const [clinicsList, setClinicsList] = useState([]);

  // Doctor Search & Dropdown State
  const [doctorSearch, setDoctorSearch] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [doctorsList, setDoctorsList] = useState([]);

  // Patient Profile Details Side Panel State
  const [profilePanelOpen, setProfilePanelOpen] = useState(false);
  const [viewingPatient, setViewingPatient] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Related Sub-Lists for the viewing patient
  const [patientAppointments, setPatientAppointments] = useState([]);
  const [patientInstructions, setPatientInstructions] = useState([]);
  const [patientConsents, setPatientConsents] = useState([]);
  const [patientPrescriptions, setPatientPrescriptions] = useState([]);
  const [patientLabs, setPatientLabs] = useState([]);
  const [patientCertificates, setPatientCertificates] = useState([]);

  const [showQuickForm, setShowQuickForm] = useState(false);

  // Quick Form Input states
  const [quickDate, setQuickDate] = useState('');
  const [quickTime, setQuickTime] = useState('10:00 AM');
  const [quickNotes, setQuickNotes] = useState('');

  const [quickTitle, setQuickTitle] = useState('');
  const [quickDesc, setQuickDesc] = useState('');

  const [quickCertType, setQuickCertType] = useState('Medical Fitness');
  const [quickCertContent, setQuickCertContent] = useState('');
  const [quickCertDuration, setQuickCertDuration] = useState('3 Days');
  const [quickCertRemark, setQuickCertRemark] = useState('');

  const [quickConsentTitle, setQuickConsentTitle] = useState('Dental Surgery Consent');
  const [quickConsentContent, setQuickConsentContent] = useState('');
  const [quickPatSig, setQuickPatSig] = useState('');
  const [quickDocSig, setQuickDocSig] = useState('');

  const [quickBp, setQuickBp] = useState('120/80');
  const [quickPulse, setQuickPulse] = useState('72');
  const [quickTemp, setQuickTemp] = useState('98.6');
  const [quickComplaint, setQuickComplaint] = useState('');
  const [quickDiagnosis, setQuickDiagnosis] = useState('');
  const [quickTreatment, setQuickTreatment] = useState('');

  const [quickTests, setQuickTests] = useState('CBC, Blood Sugar');

  // Fetch Default Dropdown items on mount
  const loadDefaultMasterData = async () => {
    try {
      const [clinicRes, docRes] = await Promise.all([
        dashboardAPI.getMasterData({ type: 'clinic', limit: 50 }),
        dashboardAPI.getMasterData({ type: 'doctor', limit: 50 })
      ]);

      if (clinicRes && clinicRes.data) setClinicsList(clinicRes.data);
      if (docRes && docRes.data) setDoctorsList(docRes.data);
    } catch (err) {
      console.error('Error fetching master dropdown data:', err);
    }
  };

  // Debounced search for Clinics
  useEffect(() => {
    if (!clinicSearch.trim()) return;
    const delayDebounceFn = setTimeout(async () => {
      try {
        const res = await dashboardAPI.getMasterData({ type: 'clinic', search: clinicSearch, limit: 50 });
        if (res && res.data) {
          const newList = selectedClinic
            ? [selectedClinic, ...res.data.filter(c => c._id !== selectedClinic._id)]
            : res.data;
          setClinicsList(newList);
        }
      } catch (err) {
        console.error(err);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [clinicSearch]);

  // Debounced search for Doctors
  useEffect(() => {
    if (!doctorSearch.trim()) return;
    const delayDebounceFn = setTimeout(async () => {
      try {
        const res = await dashboardAPI.getMasterData({ type: 'doctor', search: doctorSearch, limit: 50 });
        if (res && res.data) {
          const newList = selectedDoctor
            ? [selectedDoctor, ...res.data.filter(d => d._id !== selectedDoctor._id)]
            : res.data;
          setDoctorsList(newList);
        }
      } catch (err) {
        console.error(err);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [doctorSearch]);

  const loadPatients = async () => {
    setLoading(true);
    setError('');
    try {
      const params = { limit: 200 };
      const targetClinic = (activeClinicId && activeClinicId !== 'all') 
        ? activeClinicId 
        : (filterClinicId && filterClinicId !== 'all' ? filterClinicId : null);
      if (targetClinic) {
        params.clinic_id = targetClinic;
      }
      const res = await patientAPI.getPatients(params);
      if (res && res.data) {
        setPatients(res.data);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load patient records database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPatients();
  }, [activeClinicId, filterClinicId]);

  const loadPatientSubData = async (patientId) => {
    try {
      const targetClinic = (activeClinicId && activeClinicId !== 'all') 
        ? activeClinicId 
        : (filterClinicId && filterClinicId !== 'all' ? filterClinicId : null);
      const subParams = { patient_id: patientId, limit: 50 };
      if (targetClinic) subParams.clinic_id = targetClinic;

      const [apptsRes, instRes, consentRes, presRes, labsRes, certRes] = await Promise.all([
        appointmentAPI.getAppointments(subParams),
        instructionAPI.getInstructions(subParams),
        consentAPI.getConsents(subParams),
        prescriptionAPI.getPrescriptions(subParams),
        labAPI.getLabs(subParams),
        certificateAPI.getCertificates(subParams)
      ]);

      const filterById = (item) => {
        const pId = item.patient_id?._id || item.patient_id;
        return pId === patientId;
      };

      if (apptsRes && apptsRes.data) setPatientAppointments(apptsRes.data.filter(filterById));
      if (instRes && instRes.data) setPatientInstructions(instRes.data.filter(filterById));
      if (consentRes && consentRes.data) setPatientConsents(consentRes.data.filter(filterById));
      if (presRes && presRes.data) setPatientPrescriptions(presRes.data.filter(filterById));
      if (labsRes && labsRes.data) setPatientLabs(labsRes.data.filter(filterById));
      if (certRes && certRes.data) setPatientCertificates(certRes.data.filter(filterById));
    } catch (err) {
      console.error("Error loading patient details sub-lists:", err);
    }
  };

  useEffect(() => {
    loadPatients();
    if (user?.role === 'admin') {
      loadDefaultMasterData();
    }
  }, [filterClinicId]);

  const handleOpenAdd = () => {
    setIsEdit(false);
    setEditId(null);
    setFullName('');
    setGender('Male');
    setDob('');
    setAge(0);
    setPhone('');
    setEmail('');
    setBloodGroup('O+');
    setAllergies('');
    setNotes('');
    setAddress('');
    
    setSelectedClinic(null);
    setClinicSearch('');
    setSelectedDoctor(null);
    setDoctorSearch('');

    setError('');
    setViewMode('editor');
    loadDefaultMasterData();
  };

  const handleOpenEdit = (p) => {
    setIsEdit(true);
    setEditId(p._id);
    setFullName(p.full_name || '');
    setGender(p.gender || 'Male');
    setDob(p.date_of_birth ? p.date_of_birth.substring(0, 10) : '');
    setAge(p.age || 0);
    setPhone(p.phone || '');
    setEmail(p.email || '');
    setBloodGroup(p.blood_group || 'O+');
    setAllergies(p.allergies || '');
    setNotes(p.medical_notes || '');
    setAddress(p.address || '');

    if (p.clinic_id && typeof p.clinic_id === 'object') {
      setSelectedClinic(p.clinic_id);
      setClinicSearch(p.clinic_id.name || '');
      setClinicsList([p.clinic_id]);
    } else {
      setSelectedClinic(null);
      setClinicSearch('');
    }

    if (p.doctor_id && typeof p.doctor_id === 'object') {
      setSelectedDoctor(p.doctor_id);
      setDoctorSearch(p.doctor_id.name || p.doctor_id.full_name || '');
      setDoctorsList([p.doctor_id]);
    } else {
      setSelectedDoctor(null);
      setDoctorSearch('');
    }

    setError('');
    setViewMode('editor');
    loadDefaultMasterData();
  };

  const handleOpenProfile = (p) => {
    setViewingPatient(p);
    setActiveTab('overview');
    setShowQuickForm(false);
    setProfilePanelOpen(true);
    loadPatientSubData(p._id);
  };

  const triggerDelete = (id) => {
    setDeleteId(id);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    setDeleteLoading(true);
    try {
      await patientAPI.deletePatient(deleteId);
      setSuccess('Patient record deleted successfully.');
      loadPatients();
      if (profilePanelOpen && viewingPatient?._id === deleteId) {
        setProfilePanelOpen(false);
      }
      setDeleteModalOpen(false);
      setDeleteId(null);
    } catch (err) {
      console.error(err);
      setError('Failed to delete patient record.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Phone validation
    if (!/^[6-9]\d{9}$/.test(phone)) {
      setError('Phone number must start with 6-9 and contain exactly 10 digits.');
      return;
    }

    let finalClinicId = selectedClinic?._id;
    let finalDoctorId = selectedDoctor?._id;

    if (user?.role !== 'admin') {
      finalClinicId = user?.clinic_id;
      finalDoctorId = user?._id; // Wait, actually the user might be a staff. Let's use user?.doctor_id?._id || user?._id
    }

    // Need to handle staff as well! In user controller:
    // doctorId = req.user.role === 'doctor' ? req.user._id : req.user.doctor_id._id;
    if (user?.role === 'doctor') {
      finalDoctorId = user?._id;
    } else if (user?.role === 'staff') {
      finalDoctorId = user?.doctor_id?._id || user?.doctor_id;
    }

    if (!finalClinicId) {
      setError('Please select a clinic from the dropdown options list.');
      return;
    }

    if (!finalDoctorId) {
      setError('Please select an assigned doctor from the dropdown options list.');
      return;
    }

    const payload = {
      full_name: fullName,
      gender,
      date_of_birth: dob,
      age: Number(age),
      phone,
      email,
      blood_group: bloodGroup,
      allergies,
      medical_notes: notes,
      address,
      clinic_id: finalClinicId,
      doctor_id: finalDoctorId,
    };

    try {
      if (isEdit) {
        await patientAPI.updatePatient(editId, payload);
        setSuccess('Patient profile updated successfully.');
      } else {
        await patientAPI.createPatient(payload);
        setSuccess('Patient registered successfully.');
      }
      setViewMode('list');
      loadPatients();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Error occurred while saving patient records.');
    }
  };

  const handleQuickFormSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const docId = viewingPatient.doctor_id?._id || viewingPatient.doctor_id || user?._id || '6a55ce3df5878a83c6b4e275';
      const clinicId = viewingPatient.clinic_id?._id || viewingPatient.clinic_id || user?.clinic_id || '6a55ce3cf5878a83c6b4e274';

      if (activeTab === 'appointments') {
        await appointmentAPI.createAppointment({
          patient_id: viewingPatient._id,
          doctor_id: docId,
          clinic_id: clinicId,
          date: quickDate,
          time: quickTime,
          notes: quickNotes
        });
        setSuccess('Appointment slot booked successfully.');
      } else if (activeTab === 'instructions') {
        await instructionAPI.createInstruction({
          patient_id: viewingPatient._id,
          doctor_id: docId,
          clinic_id: clinicId,
          title: quickTitle,
          description: quickDesc
        });
        setSuccess('Clinical recovery instruction guide recorded.');
      } else if (activeTab === 'consents') {
        await consentAPI.createConsent({
          patient_id: viewingPatient._id,
          doctor_id: docId,
          clinic_id: clinicId,
          title: quickConsentTitle,
          content: quickConsentContent || 'I consent to the dental checkup and basic clinical procedures.',
          patient_signature: quickPatSig,
          doctor_signature: quickDocSig || 'Dr. Witness'
        });
        setSuccess('Consent agreement signature logged.');
      } else if (activeTab === 'prescriptions') {
        await prescriptionAPI.createPrescription({
          patient_id: viewingPatient._id,
          doctor_id: docId,
          clinic_id: clinicId,
          vitals: {
            temperature: quickTemp,
            blood_pressure: quickBp,
            pulse_rate: Number(quickPulse)
          },
          clinical: {
            chief_complaint: quickComplaint,
            diagnosis: quickDiagnosis,
            treatment: quickTreatment
          }
        });
        setSuccess('Rx prescription slip created successfully.');
      } else if (activeTab === 'labs') {
        const testArray = quickTests.split(',').map(t => t.trim()).filter(Boolean);
        await labAPI.createLab({
          patient_id: viewingPatient._id,
          doctor_id: docId,
          clinic_id: clinicId,
          prescription_id: '6a55ce3df5878a83c6b4e277',
          lab_test: testArray
        });
        setSuccess('Lab diagnostic order requested.');
      } else if (activeTab === 'certificates') {
        await certificateAPI.createCertificate({
          patient_id: viewingPatient._id,
          doctor_id: docId,
          clinic_id: clinicId,
          certificate_type: quickCertType,
          content: quickCertContent || 'Certified fit for clinical discharge and recovery rest.',
          duration: quickCertDuration,
          remark: quickCertRemark
        });
        setSuccess('Certificate logged successfully.');
      }

      setShowQuickForm(false);
      loadPatientSubData(viewingPatient._id);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Error occurred while saving sub-records.');
    }
  };

  const calculateAge = (dobString) => {
    if (!dobString) return;
    const birthday = new Date(dobString);
    const today = new Date();
    let calculatedAge = today.getFullYear() - birthday.getFullYear();
    const m = today.getMonth() - birthday.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthday.getDate())) {
      calculatedAge--;
    }
    setAge(calculatedAge < 0 ? 0 : calculatedAge);
  };

  const filtered = patients.filter((p) =>
    p.full_name.toLowerCase().includes(search.toLowerCase()) ||
    p.phone.includes(search)
  );

  // If in 'editor' viewMode, render FULL PAGE SCREEN EDITOR instead of popup modal!
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
              <ArrowLeft size={16} /> Back to Directory
            </button>
            <h1 className="page-title">{isEdit ? 'Edit Patient File' : 'Register New Patient'}</h1>
            <p className="page-subtitle">Fill in full medical profile and clinic details</p>
          </div>
        </div>

        <div className="card" style={{ width: '100%', padding: '24px', borderRadius: '16px' }}>
          {error && (
            <div className="badge badge-danger" style={{ display: 'block', width: '100%', padding: '12px', borderRadius: '8px', marginBottom: '20px' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleFormSubmit}>
            <div className="form-row" style={{ marginBottom: '16px' }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label" style={{ fontWeight: 'bold' }}>Full Name *</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. Rahul Sharma"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label" style={{ fontWeight: 'bold' }}>Gender *</label>
                <select className="input-field" value={gender} onChange={(e) => setGender(e.target.value)}>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="form-row" style={{ marginBottom: '16px' }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label" style={{ fontWeight: 'bold' }}>Date of Birth *</label>
                <input
                  type="date"
                  className="input-field"
                  value={dob}
                  onChange={(e) => {
                    setDob(e.target.value);
                    calculateAge(e.target.value);
                  }}
                  required
                />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label" style={{ fontWeight: 'bold' }}>Age (Auto calculated)</label>
                <input
                  type="number"
                  className="input-field"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  required
                  min={0}
                />
              </div>
            </div>

            <div className="form-row" style={{ marginBottom: '16px' }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label" style={{ fontWeight: 'bold' }}>Phone Number *</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. 9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label" style={{ fontWeight: 'bold' }}>Email Address</label>
                <input
                  type="email"
                  className="input-field"
                  placeholder="e.g. rahul@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Clinic Dropdown */}
            {user?.role === 'admin' && (
              <div className="form-group" style={{ marginBottom: '16px', position: 'relative' }}>
                <label className="form-label" style={{ fontWeight: 'bold' }}>Assigned Clinic Facility *</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Search clinic name or email..."
                  value={clinicSearch}
                  onChange={(e) => {
                    setClinicSearch(e.target.value);
                    setSelectedClinic(null);
                  }}
                  required={!selectedClinic}
                />
                {selectedClinic && (
                  <div style={{ marginTop: '6px', fontSize: '13px', color: 'var(--color-success)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <CheckCircle2 size={14} /> Selected: {selectedClinic.name} ({selectedClinic.email || 'No Email'})
                  </div>
                )}

                {clinicSearch.trim() && !selectedClinic && clinicsList.length > 0 && (
                  <div style={{ 
                    position: 'absolute', 
                    top: '100%', 
                    left: 0, 
                    right: 0, 
                    backgroundColor: 'var(--color-bg)', 
                    border: '1px solid var(--color-border)', 
                    borderRadius: 'var(--radius-md)', 
                    maxHeight: '180px', 
                    overflowY: 'auto', 
                    zIndex: 20, 
                    boxShadow: 'var(--shadow-md)' 
                  }}>
                    {clinicsList.map(c => (
                      <div 
                        key={c._id} 
                        onClick={() => {
                          setSelectedClinic(c);
                          setClinicSearch(c.name);
                        }}
                        style={{ padding: '8px 12px', borderBottom: '1px solid var(--color-border)', cursor: 'pointer' }}
                      >
                        <div style={{ fontWeight: 'bold', fontSize: '13px' }}>{c.name}</div>
                        <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>{c.email || 'No email'}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Doctor Dropdown */}
            {user?.role === 'admin' && (
              <div className="form-group" style={{ marginBottom: '16px', position: 'relative' }}>
                <label className="form-label" style={{ fontWeight: 'bold' }}>Assigned Practitioner Doctor *</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Search doctor name or email..."
                  value={doctorSearch}
                  onChange={(e) => {
                    setDoctorSearch(e.target.value);
                    setSelectedDoctor(null);
                  }}
                  required={!selectedDoctor}
                />
                {selectedDoctor && (
                  <div style={{ marginTop: '6px', fontSize: '13px', color: 'var(--color-success)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <CheckCircle2 size={14} /> Selected: {selectedDoctor.name || selectedDoctor.full_name} ({selectedDoctor.email || 'No Email'})
                  </div>
                )}

                {doctorSearch.trim() && !selectedDoctor && doctorsList.length > 0 && (
                  <div style={{ 
                    position: 'absolute', 
                    top: '100%', 
                    left: 0, 
                    right: 0, 
                    backgroundColor: 'var(--color-bg)', 
                    border: '1px solid var(--color-border)', 
                    borderRadius: 'var(--radius-md)', 
                    maxHeight: '180px', 
                    overflowY: 'auto', 
                    zIndex: 20, 
                    boxShadow: 'var(--shadow-md)' 
                  }}>
                    {doctorsList.map(d => (
                      <div 
                        key={d._id} 
                        onClick={() => {
                          setSelectedDoctor(d);
                          setDoctorSearch(d.name || d.full_name);
                        }}
                        style={{ padding: '8px 12px', borderBottom: '1px solid var(--color-border)', cursor: 'pointer' }}
                      >
                        <div style={{ fontWeight: 'bold', fontSize: '13px' }}>{d.name || d.full_name}</div>
                        <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>{d.email || 'No email'}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="form-row" style={{ marginBottom: '16px' }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label" style={{ fontWeight: 'bold' }}>Blood Group</label>
                <select className="input-field" value={bloodGroup} onChange={(e) => setBloodGroup(e.target.value)}>
                  {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label" style={{ fontWeight: 'bold' }}>Known Allergies</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. Penicillin, Dust"
                  value={allergies}
                  onChange={(e) => setAllergies(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label className="form-label" style={{ fontWeight: 'bold' }}>Residential Address</label>
              <input
                type="text"
                className="input-field"
                placeholder="Full residential address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>

            <div className="form-group" style={{ marginBottom: '24px' }}>
              <label className="form-label" style={{ fontWeight: 'bold' }}>Medical Notes / Clinical Background</label>
              <textarea
                className="input-field"
                placeholder="Pre-existing conditions, surgery history..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                style={{ height: '80px', resize: 'none' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setViewMode('list')}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                {isEdit ? 'Update Patient File' : 'Save & Register Patient'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', gap: '20px', position: 'relative' }}>
      {/* Left Patient List Directory */}
      <div style={{ flex: profilePanelOpen ? 1.2 : 1, transition: 'all 0.3s ease' }}>
        <div className="page-header">
          <div>
            <h1 className="page-title">Patient Directory</h1>
            <p className="page-subtitle">Select a patient to open their clinical profile cockpit</p>
          </div>
          <button className="btn btn-primary" onClick={handleOpenAdd}>
            <PlusCircle size={14} /> Add Patient File
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

        <div className="card" style={{ padding: '12px 16px', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: '300px' }}>
            <input
              type="text"
              className="input-field"
              placeholder="Search by name or phone..."
              style={{ paddingLeft: '32px' }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Search size={14} style={{ position: 'absolute', left: '10px', top: '12px', color: 'var(--color-text-tertiary)' }} />
          </div>

          {user?.role === 'admin' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <label className="form-label" style={{ fontSize: '13px', margin: 0, whiteSpace: 'nowrap', fontWeight: 'bold' }}>
                Filter Clinic:
              </label>
              <select
                className="input-field"
                style={{ maxWidth: '240px', fontSize: '13px' }}
                value={filterClinicId}
                onChange={(e) => setFilterClinicId(e.target.value)}
              >
                <option value="all">All Clinics (Master Admin)</option>
                {clinicsList.map(c => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="table-responsive">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-tertiary)' }}>Loading patient files...</div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-tertiary)' }}>No patient files registered.</div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Patient Name</th>
                  <th>Age / Gender</th>
                  <th>Phone Number</th>
                  {user?.role === 'admin' && <th>Clinic Facility</th>}
                  <th>Blood Group</th>
                  <th>Allergies</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p._id} onClick={() => navigate(`/patients/${p._id}`)} style={{ cursor: 'pointer' }}>
                    <td style={{ fontWeight: 'bold' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-primary)' }}>
                        <User size={16} />
                        <span>{p.full_name}</span>
                        <ExternalLink size={12} style={{ opacity: 0.7 }} />
                      </span>
                    </td>
                    <td>{p.age} Yrs / {p.gender}</td>
                    <td>{p.phone}</td>
                    {user?.role === 'admin' && (
                      <td>
                        <span className="badge badge-info">{p.clinic_id?.name || 'Clinic'}</span>
                      </td>
                    )}
                    <td>
                      <span className="badge badge-info">{p.blood_group || 'Unknown'}</span>
                    </td>
                    <td style={{ color: p.allergies ? 'var(--color-danger)' : 'inherit' }}>
                      {p.allergies || 'None'}
                    </td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="icon-btn" onClick={() => handleOpenEdit(p)} title="Edit patient profile">
                          <Edit2 size={14} />
                        </button>
                        <button className="icon-btn" style={{ color: 'var(--color-danger)' }} onClick={() => triggerDelete(p._id)} title="Delete patient profile">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Right Patient Profile Dashboard Side Panel */}
      {profilePanelOpen && viewingPatient && (
        <div style={{ 
          width: '450px', 
          backgroundColor: 'var(--color-bg)', 
          border: '1px solid var(--color-border)', 
          borderRadius: 'var(--radius-lg)', 
          padding: '20px', 
          boxShadow: 'var(--shadow-lg)',
          display: 'flex',
          flexDirection: 'column',
          alignSelf: 'flex-start',
          maxHeight: '85vh',
          overflowY: 'auto'
        }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ 
                width: '56px', 
                height: '56px', 
                borderRadius: '50%', 
                backgroundColor: 'var(--color-primary-light)', 
                color: 'var(--color-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px',
                fontWeight: 'bold'
              }}>
                {viewingPatient.full_name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0 }}>{viewingPatient.full_name}</h3>
                <div style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', marginTop: '2px' }}>
                  {viewingPatient.age} Yrs • {viewingPatient.gender} • {viewingPatient.blood_group || 'O+'}
                </div>
              </div>
            </div>
            <button className="icon-btn" onClick={() => setProfilePanelOpen(false)}>
              <X size={18} />
            </button>
          </div>

          {/* Quick Info Chips */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', marginBottom: '16px', backgroundColor: 'var(--color-bg-secondary)', padding: '10px', borderRadius: 'var(--radius-md)' }}>
            {viewingPatient.phone && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-text-secondary)' }}>
                <span>Phone:</span> <span style={{ fontWeight: 'bold', color: 'var(--color-text-primary)' }}>{viewingPatient.phone}</span>
              </div>
            )}
            {viewingPatient.address && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-text-secondary)' }}>
                <span>Address:</span> <span>{viewingPatient.address}</span>
              </div>
            )}
            {viewingPatient.allergies && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-danger)' }}>
                <Heart size={13} /> <span>Allergies: {viewingPatient.allergies}</span>
              </div>
            )}
          </div>

          {/* Tabs Navigation */}
          <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--color-border)', paddingBottom: '8px', marginBottom: '16px', overflowX: 'auto', whiteSpace: 'nowrap' }}>
            {[
              { id: 'overview', label: 'Overview', icon: User },
              { id: 'prescriptions', label: 'Rx', icon: Stethoscope },
              { id: 'certificates', label: 'Certificates', icon: Clipboard },
              { id: 'instructions', label: 'Guides', icon: FileText },
              { id: 'consents', label: 'Consents', icon: ClipboardCheck },
              { id: 'appointments', label: 'Appts', icon: Calendar },
              { id: 'labs', label: 'Labs', icon: FlaskConical }
            ].map(tab => (
              <button 
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setShowQuickForm(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '6px 10px',
                  fontSize: '12px',
                  fontWeight: '600',
                  borderRadius: '16px',
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: activeTab === tab.id ? 'var(--color-primary-light)' : 'transparent',
                  color: activeTab === tab.id ? 'var(--color-primary)' : 'var(--color-text-secondary)'
                }}
              >
                <tab.icon size={12} />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Sub-tab content */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h4 style={{ fontSize: '14px', fontWeight: 'bold', textTransform: 'capitalize' }}>
                Patient {activeTab}
              </h4>
              {activeTab !== 'overview' && !showQuickForm && (
                <button 
                  className="btn btn-secondary" 
                  onClick={() => {
                    setQuickDate(new Date().toISOString().substring(0, 10));
                    setShowQuickForm(true);
                  }}
                  style={{ padding: '3px 8px', fontSize: '11px' }}
                >
                  <PlusCircle size={10} /> Log New
                </button>
              )}
            </div>

            {/* Quick add form */}
            {showQuickForm && (
              <form onSubmit={handleQuickFormSubmit} style={{ backgroundColor: 'var(--color-bg-secondary)', padding: '12px', borderRadius: 'var(--radius-md)', marginBottom: '12px' }}>
                {activeTab === 'appointments' && (
                  <>
                    <div className="form-group">
                      <label className="form-label" style={{ fontSize: '10px' }}>Date</label>
                      <input type="date" className="input-field" value={quickDate} onChange={e => setQuickDate(e.target.value)} required />
                    </div>
                    <div className="form-group">
                      <label className="form-label" style={{ fontSize: '10px' }}>Time Slot</label>
                      <input type="text" className="input-field" value={quickTime} onChange={e => setQuickTime(e.target.value)} required />
                    </div>
                    <div className="form-group">
                      <label className="form-label" style={{ fontSize: '10px' }}>Symptom Notes</label>
                      <input type="text" className="input-field" value={quickNotes} onChange={e => setQuickNotes(e.target.value)} placeholder="Toothache..." />
                    </div>
                  </>
                )}

                {activeTab === 'instructions' && (
                  <>
                    <div className="form-group">
                      <label className="form-label" style={{ fontSize: '10px' }}>Title</label>
                      <input type="text" className="input-field" value={quickTitle} onChange={e => setQuickTitle(e.target.value)} placeholder="Post Extraction Guide" required />
                    </div>
                    <div className="form-group">
                      <label className="form-label" style={{ fontSize: '10px' }}>Description</label>
                      <textarea className="input-field" value={quickDesc} onChange={e => setQuickDesc(e.target.value)} placeholder="Avoid hot drinks..." required style={{ height: '50px', fontSize: '12px', resize: 'none' }} />
                    </div>
                  </>
                )}

                {activeTab === 'certificates' && (
                  <>
                    <div className="form-group">
                      <label className="form-label" style={{ fontSize: '10px' }}>Certificate Type</label>
                      <select className="input-field" value={quickCertType} onChange={e => setQuickCertType(e.target.value)}>
                        <option value="Medical Fitness">Medical Fitness</option>
                        <option value="Sick Leave">Sick Leave</option>
                        <option value="Referral Slip">Referral Slip</option>
                        <option value="Discharge Summary">Discharge Summary</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label" style={{ fontSize: '10px' }}>Content Body</label>
                      <textarea className="input-field" value={quickCertContent} onChange={e => setQuickCertContent(e.target.value)} placeholder="Certified fit for clinical discharge..." required style={{ height: '50px', fontSize: '12px', resize: 'none' }} />
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label" style={{ fontSize: '10px' }}>Duration</label>
                        <input type="text" className="input-field" value={quickCertDuration} onChange={e => setQuickCertDuration(e.target.value)} placeholder="3 Days" />
                      </div>
                      <div className="form-group">
                        <label className="form-label" style={{ fontSize: '10px' }}>Remarks</label>
                        <input type="text" className="input-field" value={quickCertRemark} onChange={e => setQuickCertRemark(e.target.value)} placeholder="Recommended complete bed rest" />
                      </div>
                    </div>
                  </>
                )}

                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '10px' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowQuickForm(false)} style={{ padding: '4px 8px', fontSize: '11px' }}>Cancel</button>
                  <button type="submit" className="btn btn-primary" style={{ padding: '4px 8px', fontSize: '11px' }}>Save Log</button>
                </div>
              </form>
            )}

            {/* List entries for the selected tab */}
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {activeTab === 'overview' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {viewingPatient.allergies && (
                    <div style={{ 
                      backgroundColor: 'rgba(226, 75, 74, 0.1)', 
                      border: '1px solid rgba(226, 75, 74, 0.2)', 
                      borderRadius: '8px', 
                      padding: '12px', 
                      display: 'flex', 
                      alignItems: 'flex-start', 
                      gap: '8px',
                      color: '#E24B4A'
                    }}>
                      <Heart size={16} style={{ marginTop: '2px' }} />
                      <div>
                        <div style={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase' }}>Allergies</div>
                        <div style={{ fontSize: '13px', marginTop: '2px' }}>{viewingPatient.allergies}</div>
                      </div>
                    </div>
                  )}

                  {/* Demographics & Contact Card */}
                  <div style={{ border: '1px solid var(--color-border)', borderRadius: '8px', padding: '16px' }}>
                    <h5 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '12px' }}>Demographics & Contact</h5>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--color-text-secondary)' }}>Date of Birth</span>
                        <span style={{ fontWeight: '500' }}>
                          {viewingPatient.date_of_birth 
                            ? new Date(viewingPatient.date_of_birth).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                            : 'N/A'}
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--color-text-secondary)' }}>Email</span>
                        <span style={{ fontWeight: '500' }}>{viewingPatient.email || 'N/A'}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--color-text-secondary)' }}>Address</span>
                        <span style={{ fontWeight: '500', textAlign: 'right' }}>{viewingPatient.address || 'N/A'}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--color-text-secondary)' }}>Added By</span>
                        <span style={{ fontWeight: '500' }}>{viewingPatient.doctor_id?.full_name || 'Bhumesh Kewat'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Medical Notes Card */}
                  <div style={{ border: '1px solid var(--color-border)', borderRadius: '8px', padding: '16px' }}>
                    <h5 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '8px' }}>Medical Notes</h5>
                    <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', margin: 0, whiteSpace: 'pre-wrap' }}>
                      {viewingPatient.medical_notes || 'No medical notes logged.'}
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 'certificates' && (
                patientCertificates.length === 0 ? (
                  <div style={{ textAlign: 'center', fontSize: '12px', color: 'var(--color-text-tertiary)', padding: '20px' }}>No medical certificates recorded.</div>
                ) : (
                  patientCertificates.map(cert => (
                    <div key={cert._id} style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '10px', fontSize: '13px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                        <span style={{ color: 'var(--color-primary)' }}>{cert.certificate_type}</span>
                        <span style={{ fontSize: '11px', color: 'var(--color-text-tertiary)' }}>{new Date(cert.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div style={{ color: 'var(--color-text-secondary)', marginTop: '4px', fontSize: '12px' }}>
                        {cert.content}
                      </div>
                      {cert.duration && (
                        <div style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', marginTop: '4px' }}>
                          Duration: {cert.duration}
                        </div>
                      )}
                      {cert.remark && (
                        <div style={{ fontSize: '11px', color: 'var(--color-warning)', marginTop: '2px', fontWeight: '600' }}>
                          Remark: {cert.remark}
                        </div>
                      )}
                    </div>
                  ))
                )
              )}

              {activeTab === 'appointments' && (
                patientAppointments.length === 0 ? (
                  <div style={{ textAlign: 'center', fontSize: '12px', color: 'var(--color-text-tertiary)', padding: '20px' }}>No appointments booked.</div>
                ) : (
                  patientAppointments.map(appt => (
                    <div key={appt._id} style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '10px', fontSize: '13px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                        <span>{appt.time}</span>
                        <span className="badge badge-info" style={{ textTransform: 'capitalize' }}>{appt.status}</span>
                      </div>
                      <div style={{ color: 'var(--color-text-secondary)', marginTop: '4px', fontSize: '12px' }}>
                        Date: {new Date(appt.date).toLocaleDateString()}
                      </div>
                      {appt.notes && <div style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', marginTop: '2px' }}>Note: {appt.notes}</div>}
                    </div>
                  ))
                )
              )}
            </div>
          </div>
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
        title="Delete Patient Record"
        message="Are you sure you want to delete this patient profile? All associated clinical notes and sub-records will be deleted."
        loading={deleteLoading}
      />
    </div>
  );
}
