import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useActiveClinicScope } from '../hooks/useActiveClinicScope';
import { userAPI, clinicAPI, medicineAPI, uploadAPI } from '../services/api';
import { 
  User, 
  Hospital, 
  Key, 
  Save, 
  RefreshCw, 
  CheckCircle2, 
  Pill, 
  Plus, 
  Trash2, 
  Upload, 
  Lock, 
  PenTool, 
  Image as ImageIcon, 
  Check, 
  AlertTriangle,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  ShieldAlert,
  UserCheck,
  CalendarDays,
  FileSpreadsheet,
  FlaskConical,
  FileBadge,
  FileText,
  ClipboardCheck,
  Layout,
  Users as UsersIcon,
  Stethoscope,
  Building,
  Mail,
  Phone,
  Calendar,
  Award,
  Info
} from 'lucide-react';

export default function Settings() {
  const { user, refreshUserProfile } = useAuth();
  const activeClinicId = useActiveClinicScope();
  
  // Tabs: 'clinic' | 'profile' | 'security' | 'medicine_presets'
  const [activeTab, setActiveTab] = useState('clinic');
  
  // UI states
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingAsset, setUploadingAsset] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Doctor / Staff Profile Form States
  const [profName, setProfName] = useState(user?.full_name || '');
  const [profEmail, setProfEmail] = useState(user?.email || '');
  const [profPhone, setProfPhone] = useState(user?.phone || '');
  const [qualification, setQualification] = useState(user?.qualification || '');
  const [regNumber, setRegNumber] = useState(user?.registration_number || '');

  // Clinic Practice Settings Form States
  const [clinicId, setClinicId] = useState('');
  const [clinicName, setClinicName] = useState('');
  const [clinicTagline, setClinicTagline] = useState('');
  const [clinicPhone, setClinicPhone] = useState('');
  const [clinicEmail, setClinicEmail] = useState('');
  const [clinicAddress, setClinicAddress] = useState('');
  const [openDays, setOpenDays] = useState('Mon - Sat');
  const [visitHours, setVisitHours] = useState('09:00 AM - 08:00 PM');
  
  // Branding Assets (Objects with secure_url or strings)
  const [clinicLogo, setClinicLogo] = useState('');
  const [clinicStamp, setClinicStamp] = useState('');
  const [doctorSignature, setDoctorSignature] = useState('');

  // Toggles for Document Print Header & Footer
  const [isLogo, setIsLogo] = useState(true);
  const [isOpenDays, setIsOpenDays] = useState(true);
  const [isVisitingHours, setIsVisitingHours] = useState(true);
  const [isStamp, setIsStamp] = useState(true);
  const [isDoctorSignature, setIsDoctorSignature] = useState(true);

  // Primary Doctor state for the clinic
  const [primaryDoctor, setPrimaryDoctor] = useState(null);
  const [docName, setDocName] = useState('');
  const [docPhone, setDocPhone] = useState('');
  const [docQualification, setDocQualification] = useState('');
  const [docRegNumber, setDocRegNumber] = useState('');
  const [savingDoc, setSavingDoc] = useState(false);

  // Security password states
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Master Admin Medicine Presets States
  const [routesList, setRoutesList] = useState([]);
  const [frequenciesList, setFrequenciesList] = useState([]);
  const [instructionsList, setInstructionsList] = useState([]);
  const [newRouteInput, setNewRouteInput] = useState('');
  const [newFreqInput, setNewFreqInput] = useState('');
  const [newInstructionInput, setNewInstructionInput] = useState('');

  // Interactive Digital Signature Canvas State
  const [showSignCanvas, setShowSignCanvas] = useState(false);
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  // Role checks
  const isStaff = user?.role === 'staff';
  const isAdmin = user?.role === 'admin';
  const isPrimaryDoctor = user?.is_primary || (primaryDoctor && user?._id === primaryDoctor._id);
  const canEditPrimaryDoc = isAdmin || isPrimaryDoctor;

  // Comprehensive Permission Suites Matrix for Doctor and Staff Visibility
  const SYSTEM_PERMISSION_SUITES = [
    {
      id: 'clinical_suite',
      title: 'Clinical Care & EHR Workflow',
      description: 'Core consultation, patient records, clinical history, and digital prescription issuance',
      icon: <Stethoscope size={18} />,
      permissions: [
        {
          key: 'patients',
          title: 'Patients & Health Records (EHR)',
          description: 'Search, register new patients, view clinical consultation history, and update vital indicators.',
          icon: <UserCheck size={16} />
        },
        {
          key: 'prescriptions',
          title: 'Digital Prescriptions (Rx)',
          description: 'Generate, edit, and print official electronic prescriptions with dosage, frequency, and clinical notes.',
          icon: <FileSpreadsheet size={16} />
        },
        {
          key: 'appointments',
          title: 'Appointments & Patient Queue',
          description: 'Schedule patient visits, manage appointment slots, and coordinate real-time OPD waiting queue.',
          icon: <CalendarDays size={16} />
        }
      ]
    },
    {
      id: 'assets_suite',
      title: 'Diagnostics & Clinical Assets',
      description: 'Laboratory investigations, prescription templates, certificates, and clinical documentation',
      icon: <FlaskConical size={18} />,
      permissions: [
        {
          key: 'medicines',
          title: 'Medicines & Dispensary Inventory',
          description: 'Browse pharmaceutical formulary, dosage recommendations, and manage clinic dispensary stock.',
          icon: <Pill size={16} />
        },
        {
          key: 'labs',
          title: 'Labs & Diagnostics',
          description: 'Order lab investigations, radiology tests, and record diagnostic pathology results.',
          icon: <FlaskConical size={16} />
        },
        {
          key: 'certificates',
          title: 'Medical Certificates',
          description: 'Issue official medical certificates, fitness approvals, and medical leave verification documents.',
          icon: <FileBadge size={16} />
        },
        {
          key: 'instructions',
          title: 'Patient Instructions',
          description: 'Issue personalized dietary, lifestyle advice, and post-consultation discharge summaries.',
          icon: <FileText size={16} />
        },
        {
          key: 'consents',
          title: 'Clinical Consent Forms',
          description: 'Capture informed procedural and general treatment consents with digital verification.',
          icon: <ClipboardCheck size={16} />
        },
        {
          key: 'templates',
          title: 'Clinical Presets & Templates',
          description: 'Access standardized chief complaint presets, diagnosis codes, and medication presets.',
          icon: <Layout size={16} />
        }
      ]
    },
    {
      id: 'admin_suite',
      title: 'Practice Administration & Platform Control',
      description: 'Practice branding, official seals, team management, analytics, and credential governance',
      icon: <Building size={18} />,
      permissions: [
        {
          key: 'stats',
          title: 'Clinic Analytics & Performance Stats',
          description: 'Monitor daily patient throughput, consultation counts, and clinic operational metrics.',
          icon: <Sparkles size={16} />
        },
        {
          key: 'settings',
          title: 'Practice Branding & Document Headers',
          description: 'Manage clinic logo, official seal/stamp, doctor signature, and printed letterhead headers.',
          icon: <PenTool size={16} />,
          doctorOrAdminOnly: true
        },
        {
          key: 'users',
          title: 'Clinic Staff & Team Management',
          description: 'Add new staff members, configure operational access privileges, and manage roles.',
          icon: <UsersIcon size={16} />,
          doctorOrAdminOnly: true
        },
        {
          key: 'security',
          title: 'Password & Credential Security',
          description: 'Update and manage account passwords, credential rotations, and security settings.',
          icon: <Lock size={16} />,
          doctorOrAdminOnly: true
        }
      ]
    }
  ];

  const getPermissionStatus = (perm) => {
    if (isAdmin) {
      return {
        granted: true,
        label: 'Granted',
        isGranted: true,
        color: '#10b981',
        bg: 'rgba(16, 185, 129, 0.1)',
        detail: 'Platform Superadmin Superuser Clearance'
      };
    }

    if (!isStaff) {
      return {
        granted: true,
        label: 'Granted',
        isGranted: true,
        color: '#0d9488',
        bg: 'rgba(13, 148, 136, 0.1)',
        detail: 'Primary Doctor Full Clinical Authority'
      };
    }

    // For staff users
    if (perm.doctorOrAdminOnly) {
      return {
        granted: false,
        label: 'Restricted',
        isGranted: false,
        color: '#ef4444',
        bg: 'rgba(239, 68, 68, 0.1)',
        detail: 'Locked (Requires Primary Doctor / Admin privilege)'
      };
    }

    const staffPerms = user?.permissions || [];
    const hasPerm = staffPerms.includes(perm.key);
    if (hasPerm) {
      return {
        granted: true,
        label: 'Granted',
        isGranted: true,
        color: '#10b981',
        bg: 'rgba(16, 185, 129, 0.1)',
        detail: 'Active Permission Assigned'
      };
    }

    return {
      granted: false,
      label: 'Not Assigned',
      isGranted: false,
      color: '#f59e0b',
      bg: 'rgba(245, 158, 11, 0.1)',
      detail: 'Contact Supervising Doctor to enable'
    };
  };

  const allPermissionsList = SYSTEM_PERMISSION_SUITES.flatMap(s => s.permissions);
  const totalGrantedCount = allPermissionsList.filter(p => getPermissionStatus(p).isGranted).length;
  const totalPermissionsCount = allPermissionsList.length;

  const loadMedicineOptions = async () => {
    try {
      const res = await medicineAPI.getMedicineOptions();
      if (res && res.data) {
        setRoutesList(res.data.routes || []);
        setFrequenciesList(res.data.frequencies || []);
        setInstructionsList(res.data.instructions || []);
      }
    } catch (err) {
      console.error('Failed to fetch medicine options:', err);
    }
  };

  const handleAddOption = async (type, value) => {
    if (!value || !value.trim()) return;
    setSaving(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      await medicineAPI.addMedicineOption({ type, value: value.trim() });
      setSuccessMsg(`Added new ${type} option: "${value.trim()}"`);
      if (type === 'route') setNewRouteInput('');
      if (type === 'frequency') setNewFreqInput('');
      if (type === 'instruction') setNewInstructionInput('');
      await loadMedicineOptions();
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || `Failed to add ${type} option.`);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteOption = async (type, value) => {
    setSaving(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      await medicineAPI.deleteMedicineOption({ type, value });
      setSuccessMsg(`Removed ${type} option: "${value}"`);
      await loadMedicineOptions();
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || `Failed to delete ${type} option.`);
    } finally {
      setSaving(false);
    }
  };

  const resolveAssetUrl = (asset) => {
    if (!asset) return '';
    if (typeof asset === 'string') {
      const trimmed = asset.trim();
      if (trimmed === 'null' || trimmed === 'undefined' || trimmed.startsWith('{') || trimmed.length === 0) return '';
      return trimmed;
    }
    if (typeof asset === 'object') {
      return asset.secure_url || asset.url || '';
    }
    return '';
  };

  // Load User & Clinic initial settings data
  const loadInitialSettings = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      if (user?._id) {
        setProfName(user.full_name || '');
        setProfEmail(user.email || '');
        setProfPhone(user.phone || '');
        setQualification(user.qualification || '');
        setRegNumber(user.registration_number || '');
      }

      await loadMedicineOptions();

      // Resolve targeted clinic:
      const targetClinicId = activeClinicId || user?.clinic_id?._id || user?.clinic_id;
      
      let targetClinic = null;
      if (targetClinicId) {
        try {
          const singleRes = await clinicAPI.getClinicById(targetClinicId);
          if (singleRes && singleRes.data) {
            targetClinic = singleRes.data;
          }
        } catch (e) {
          console.warn('Direct clinic fetch fallback to list:', e);
        }
      }

      if (!targetClinic) {
        const res = await clinicAPI.getClinics();
        const clinicList = Array.isArray(res?.data) ? res.data : (res?.data?.data || []);
        if (clinicList.length > 0) {
          targetClinic = clinicList.find(c => c._id === targetClinicId) || clinicList[0];
        }
      }

      if (targetClinic) {
        setClinicId(targetClinic._id);
        setClinicName(targetClinic.name || '');
        setClinicTagline(targetClinic.tagline || '');
        setClinicPhone(targetClinic.phone || '');
        setClinicEmail(targetClinic.email || '');
        setClinicAddress(targetClinic.address || '');
        setOpenDays(targetClinic.open_days || 'Mon - Sat');
        setVisitHours(targetClinic.visit_hours || '09:00 AM - 08:00 PM');
        
        setIsLogo(targetClinic.is_logo ?? true);
        setIsOpenDays(targetClinic.is_open_days ?? true);
        setIsVisitingHours(targetClinic.is_visiting_hours ?? true);
        setIsStamp(targetClinic.is_stamp ?? true);
        setIsDoctorSignature(targetClinic.is_doctor_signature ?? true);

        // Assets: supports both direct Cloudinary URL strings and { secure_url } objects
        const resolvedLogo = resolveAssetUrl(targetClinic.logo) || resolveAssetUrl(targetClinic.profile_url);
        const resolvedStamp = resolveAssetUrl(targetClinic.stamp);
        const resolvedSignature = resolveAssetUrl(targetClinic.doctor_signature);

        setClinicLogo(resolvedLogo);
        setClinicStamp(resolvedStamp);
        setDoctorSignature(resolvedSignature);

        // Resolve Primary Doctor of this clinic
        const doctors = targetClinic.doctors || [];
        const primaryDoc = doctors.find(d => d.is_primary) || doctors[0] || null;
        if (primaryDoc) {
          setPrimaryDoctor(primaryDoc);
          setDocName(primaryDoc.full_name || '');
          setDocPhone(primaryDoc.phone || '');
          setDocQualification(primaryDoc.qualification || '');
          setDocRegNumber(primaryDoc.registration_number || '');
        }
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to load setting configurations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialSettings();
  }, [user, activeClinicId]);

  // Submit Profile Information API
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg('');
    setSuccessMsg('');

    if (profPhone && !/^[6-9]\d{9}$/.test(profPhone)) {
      setErrorMsg('Phone number must start with 6-9 and contain exactly 10 digits.');
      setSaving(false);
      return;
    }

    try {
      const payload = {
        full_name: profName,
        phone: profPhone,
        qualification,
        registration_number: regNumber,
      };

      await userAPI.updateUser(user._id, payload);
      if (refreshUserProfile) {
        await refreshUserProfile();
      }
      setSuccessMsg('Profile credentials and settings updated successfully.');
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || 'Failed to update profile settings.');
    } finally {
      setSaving(false);
    }
  };

  // Submit Primary Doctor Credentials (for Primary Doctor / Admin)
  const handlePrimaryDoctorSubmit = async (e) => {
    e.preventDefault();
    if (!canEditPrimaryDoc) return;
    if (!primaryDoctor?._id) {
      setErrorMsg('No primary doctor profile found for this clinic.');
      return;
    }

    setSavingDoc(true);
    setErrorMsg('');
    setSuccessMsg('');

    if (docPhone && !/^[6-9]\d{9}$/.test(docPhone)) {
      setErrorMsg('Primary Doctor phone number must be a valid 10-digit number starting with 6-9.');
      setSavingDoc(false);
      return;
    }

    try {
      await userAPI.updateUser(primaryDoctor._id, {
        full_name: docName,
        phone: docPhone,
        qualification: docQualification,
        registration_number: docRegNumber,
      });

      setSuccessMsg('Primary Doctor credentials updated successfully.');
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || 'Failed to update primary doctor credentials.');
    } finally {
      setSavingDoc(false);
    }
  };

  // Submit Clinic Practice Settings API
  const handleClinicSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg('');
    setSuccessMsg('');

    if (!clinicId) {
      setErrorMsg('No clinic assigned to update.');
      setSaving(false);
      return;
    }

    try {
      const payload = {
        name: clinicName,
        tagline: clinicTagline,
        phone: clinicPhone,
        email: clinicEmail,
        address: clinicAddress,
        open_days: openDays,
        visit_hours: visitHours,
        is_logo: isLogo,
        is_open_days: isOpenDays,
        is_visiting_hours: isVisitingHours,
        is_stamp: isStamp,
        is_doctor_signature: isDoctorSignature,
      };

      // Strict check: Only send Cloudinary URLs or empty strings, NEVER binary/base64 strings
      if (typeof clinicLogo === 'string' && !clinicLogo.startsWith('data:')) {
        payload.logo = clinicLogo;
        payload.profile_url = clinicLogo;
      }
      if (typeof clinicStamp === 'string' && !clinicStamp.startsWith('data:')) {
        payload.stamp = clinicStamp;
      }
      if (typeof doctorSignature === 'string' && !doctorSignature.startsWith('data:')) {
        payload.doctor_signature = doctorSignature;
      }

      await clinicAPI.updateClinic(clinicId, payload);
      setSuccessMsg('Clinic practice configurations and branding updated successfully.');
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || 'Failed to update clinic settings.');
    } finally {
      setSaving(false);
    }
  };

  // Upload Asset (Logo, Stamp, Doctor Signature) via multipart/form-data ONLY
  const handleAssetUpload = async (field, file) => {
    if (!file) return;
    if (!clinicId) {
      setErrorMsg('No clinic assigned to upload asset.');
      return;
    }
    setUploadingAsset(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const formData = new FormData();
      formData.append('model', 'Clinic');
      formData.append('document_id', clinicId);
      formData.append(field, file);

      const res = await uploadAPI.uploadFile(formData);
      if (res.success && res.data) {
        const uploadedAsset = res.data[field];
        const secureUrl = resolveAssetUrl(uploadedAsset);

        if (field === 'logo') setClinicLogo(secureUrl);
        if (field === 'stamp') setClinicStamp(secureUrl);
        if (field === 'doctor_signature') setDoctorSignature(secureUrl);

        const assetLabel = field === 'logo' ? 'Clinic Logo' : field === 'stamp' ? 'Official Stamp' : 'Doctor Signature';
        setSuccessMsg(`${assetLabel} uploaded and saved successfully.`);
      } else {
        throw new Error(res.message || 'Upload failed');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || err.message || 'Failed to upload asset.');
    } finally {
      setUploadingAsset(false);
    }
  };

  const handleRemoveAsset = async (field) => {
    if (!clinicId) return;
    setErrorMsg('');
    setSuccessMsg('');
    setUploadingAsset(true);
    try {
      // Use deleteFile API which cleans Cloudinary and MongoDB
      const fieldsToDelete = field === 'logo' ? ['logo', 'profile_url'] : [field];
      await uploadAPI.deleteFile({
        model: 'Clinic',
        document_id: clinicId,
        field_names: fieldsToDelete
      });

      if (field === 'logo') setClinicLogo('');
      if (field === 'stamp') setClinicStamp('');
      if (field === 'doctor_signature') setDoctorSignature('');

      const assetLabel = field === 'logo' ? 'Clinic Logo' : field === 'stamp' ? 'Official Stamp' : 'Doctor Signature';
      setSuccessMsg(`${assetLabel} removed successfully.`);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || 'Failed to remove asset.');
    } finally {
      setUploadingAsset(false);
    }
  };

  // Interactive Digital Signature Drawing Pad Handlers
  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    setHasDrawn(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#1e293b';
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  // Converts canvas drawing to Blob, wraps in File, and uploads strictly as multipart/form-data
  const applyCanvasSignature = async () => {
    const canvas = canvasRef.current;
    if (!canvas || !hasDrawn) {
      setErrorMsg('Please draw a signature on the canvas first.');
      return;
    }
    if (!clinicId) {
      setErrorMsg('No clinic assigned to save signature.');
      return;
    }

    setUploadingAsset(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      // Convert HTML5 canvas drawing to a binary Blob
      const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
      if (!blob) {
        throw new Error('Failed to create image blob from canvas.');
      }

      // Create a standard File object from the blob
      const file = new File([blob], `doctor_signature_${Date.now()}.png`, { type: 'image/png' });
      const formData = new FormData();
      formData.append('model', 'Clinic');
      formData.append('document_id', clinicId);
      formData.append('doctor_signature', file);

      const res = await uploadAPI.uploadFile(formData);
      if (res.success && res.data) {
        const uploadedAsset = res.data.doctor_signature;
        const secureUrl = resolveAssetUrl(uploadedAsset);
        setDoctorSignature(secureUrl);
        setShowSignCanvas(false);
        clearCanvas();
        setSuccessMsg('Doctor digital signature uploaded and saved successfully.');
      } else {
        throw new Error(res.message || 'Signature upload failed');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || err.message || 'Failed to save digital signature.');
    } finally {
      setUploadingAsset(false);
    }
  };

  // Submit Password Security API (Restricted for staff)
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (isStaff) {
      setErrorMsg('Staff members do not have permission to change passwords. Please contact your Clinic Administrator or Primary Doctor.');
      return;
    }

    setSaving(true);
    setErrorMsg('');
    setSuccessMsg('');

    if (newPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      setSaving(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      setSaving(false);
      return;
    }

    try {
      await userAPI.updateUser(user._id, { password: newPassword });
      setSuccessMsg('Account password changed successfully.');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || 'Failed to update account password.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ paddingBottom: '60px' }}>
      <div className="page-header" style={{ marginBottom: '20px' }}>
        <div>
          <h1 className="page-title">Clinic Practice & System Settings</h1>
          <p className="page-subtitle">Manage clinic branding, official stamps, digital signatures, practitioner profiles, and security</p>
        </div>
      </div>

      {successMsg && (
        <div className="badge badge-success" style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px' }}>
          <CheckCircle2 size={16} /> {successMsg}
        </div>
      )}

      {errorMsg && (
        <div className="badge badge-danger" style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px' }}>
          <AlertTriangle size={16} /> {errorMsg}
        </div>
      )}

      <div className="settings-grid" style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '24px' }}>
        {/* Left Settings Navigation Sidebar */}
        <div className="settings-sidebar" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div
            className={`settings-nav-item ${activeTab === 'clinic' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('clinic');
              setErrorMsg('');
              setSuccessMsg('');
            }}
            style={{ 
              padding: '12px 16px', 
              borderRadius: '10px', 
              cursor: 'pointer',
              fontWeight: activeTab === 'clinic' ? '600' : '500',
              backgroundColor: activeTab === 'clinic' ? 'var(--color-primary-light)' : 'transparent',
              color: activeTab === 'clinic' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
              transition: 'all 0.2s'
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px' }}>
              <Hospital size={18} /> Clinic Practice & Branding
            </span>
          </div>

          <div
            className={`settings-nav-item ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('profile');
              setErrorMsg('');
              setSuccessMsg('');
            }}
            style={{ 
              padding: '12px 16px', 
              borderRadius: '10px', 
              cursor: 'pointer',
              fontWeight: activeTab === 'profile' ? '600' : '500',
              backgroundColor: activeTab === 'profile' ? 'var(--color-primary-light)' : 'transparent',
              color: activeTab === 'profile' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
              transition: 'all 0.2s'
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px' }}>
              <ShieldCheck size={18} /> My Profile & Permissions
            </span>
          </div>

          <div
            className={`settings-nav-item ${activeTab === 'security' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('security');
              setErrorMsg('');
              setSuccessMsg('');
            }}
            style={{ 
              padding: '12px 16px', 
              borderRadius: '10px', 
              cursor: 'pointer',
              fontWeight: activeTab === 'security' ? '600' : '500',
              backgroundColor: activeTab === 'security' ? 'var(--color-primary-light)' : 'transparent',
              color: activeTab === 'security' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              transition: 'all 0.2s'
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px' }}>
              <Key size={18} /> Password Security
            </span>
            {isStaff && (
              <span className="badge-pill badge-warning" style={{ fontSize: '10px', padding: '2px 6px' }}>
                <Lock size={10} /> Locked
              </span>
            )}
          </div>

          {isAdmin && (
            <div
              className={`settings-nav-item ${activeTab === 'medicine_presets' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('medicine_presets');
                setErrorMsg('');
                setSuccessMsg('');
              }}
              style={{ 
                padding: '12px 16px', 
                borderRadius: '10px', 
                cursor: 'pointer',
                fontWeight: activeTab === 'medicine_presets' ? '600' : '500',
                backgroundColor: activeTab === 'medicine_presets' ? 'var(--color-primary-light)' : 'transparent',
                color: activeTab === 'medicine_presets' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                transition: 'all 0.2s'
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px' }}>
                <Pill size={18} /> Medicine Presets
              </span>
            </div>
          )}
        </div>

        {/* Right Settings Content Panel */}
        <div className="card" style={{ padding: '28px', borderRadius: '16px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--color-text-tertiary)' }}>
              <RefreshCw size={24} className="spin" style={{ margin: '0 auto 12px', display: 'block', color: 'var(--color-primary)' }} />
              Loading clinic settings and branding...
            </div>
          ) : (
            <>
              {/* TAB 1: CLINIC PRACTICE & BRANDING */}
              {activeTab === 'clinic' && (
                <div>
                  <form onSubmit={handleClinicSubmit}>
                    {/* SECTION 1: PRIMARY DOCTOR CREDENTIALS */}
                    <div style={{ background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', borderRadius: '14px', padding: '20px', marginBottom: '28px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <h3 style={{ fontSize: '16px', fontWeight: 'bold', margin: 0, color: 'var(--color-text-primary)' }}>
                              Primary Doctor Credentials
                            </h3>
                            {canEditPrimaryDoc ? (
                              <span className="badge-pill badge-primary" style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <ShieldCheck size={12} /> Primary Doctor (Editable)
                              </span>
                            ) : (
                              <span className="badge-pill badge-warning" style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Lock size={12} /> Read-Only (Assigned by Clinic Admin)
                              </span>
                            )}
                          </div>
                          <p style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', marginTop: '4px' }}>
                            {canEditPrimaryDoc 
                              ? 'Primary doctor credentials printed on official clinic prescriptions and medical certificates.'
                              : 'Staff members cannot modify primary doctor details. This is managed by the Primary Doctor or Administrator.'}
                          </p>
                        </div>

                        {canEditPrimaryDoc && primaryDoctor && (
                          <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={handlePrimaryDoctorSubmit}
                            disabled={savingDoc}
                            style={{ fontSize: '12px', gap: '6px' }}
                          >
                            {savingDoc ? <RefreshCw size={14} className="spin" /> : <Save size={14} />}
                            {savingDoc ? 'Updating...' : 'Save Doctor Info'}
                          </button>
                        )}
                      </div>

                      <div className="form-row" style={{ marginBottom: '14px' }}>
                        <div className="form-group" style={{ flex: 1 }}>
                          <label className="form-label" style={{ fontWeight: '600' }}>Primary Doctor Full Name</label>
                          <input
                            type="text"
                            className="input-field"
                            placeholder="Dr. Practitioner Name"
                            value={docName}
                            onChange={(e) => setDocName(e.target.value)}
                            disabled={!canEditPrimaryDoc}
                            style={{ backgroundColor: !canEditPrimaryDoc ? 'var(--color-bg-primary)' : undefined, cursor: !canEditPrimaryDoc ? 'not-allowed' : undefined }}
                          />
                        </div>
                        <div className="form-group" style={{ flex: 1 }}>
                          <label className="form-label" style={{ fontWeight: '600' }}>Medical Council Reg. Number</label>
                          <input
                            type="text"
                            className="input-field"
                            placeholder="e.g. MCI-2024-XXXXX"
                            value={docRegNumber}
                            onChange={(e) => setDocRegNumber(e.target.value)}
                            disabled={!canEditPrimaryDoc}
                            style={{ backgroundColor: !canEditPrimaryDoc ? 'var(--color-bg-primary)' : undefined, cursor: !canEditPrimaryDoc ? 'not-allowed' : undefined }}
                          />
                        </div>
                      </div>

                      <div className="form-row">
                        <div className="form-group" style={{ flex: 1 }}>
                          <label className="form-label" style={{ fontWeight: '600' }}>Medical Qualifications</label>
                          <input
                            type="text"
                            className="input-field"
                            placeholder="e.g. MBBS, MS, BDS, MDS"
                            value={docQualification}
                            onChange={(e) => setDocQualification(e.target.value)}
                            disabled={!canEditPrimaryDoc}
                            style={{ backgroundColor: !canEditPrimaryDoc ? 'var(--color-bg-primary)' : undefined, cursor: !canEditPrimaryDoc ? 'not-allowed' : undefined }}
                          />
                        </div>
                        <div className="form-group" style={{ flex: 1 }}>
                          <label className="form-label" style={{ fontWeight: '600' }}>Doctor Contact Phone</label>
                          <input
                            type="text"
                            className="input-field"
                            placeholder="e.g. 9876543210"
                            value={docPhone}
                            onChange={(e) => setDocPhone(e.target.value)}
                            disabled={!canEditPrimaryDoc}
                            style={{ backgroundColor: !canEditPrimaryDoc ? 'var(--color-bg-primary)' : undefined, cursor: !canEditPrimaryDoc ? 'not-allowed' : undefined }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* SECTION 2: CLINIC BRANDING SUITE (LOGO, STAMP, SIGNATURE) */}
                    <div style={{ background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', borderRadius: '14px', padding: '20px', marginBottom: '28px' }}>
                      <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '6px', color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <ImageIcon size={18} style={{ color: 'var(--color-primary)' }} />
                        Clinic Branding & Authentication Assets
                      </h3>
                      <p style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', marginBottom: '20px' }}>
                        Upload your clinic logo, official seal/stamp, and authorized digital signature for automated document generation.
                      </p>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
                        {/* 1. CLINIC LOGO CARD */}
                        <div style={{ background: 'var(--color-bg-primary)', border: '1px solid var(--color-border)', borderRadius: '12px', padding: '16px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                            <span style={{ fontWeight: '600', fontSize: '13px', color: 'var(--color-text-primary)' }}>Clinic Logo</span>
                            {clinicLogo && (
                              <button
                                type="button"
                                onClick={() => handleRemoveAsset('logo')}
                                style={{ background: 'none', border: 'none', color: 'var(--color-danger)', cursor: 'pointer', padding: '4px' }}
                                title="Remove Logo"
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>

                          <div style={{ height: '110px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px dashed var(--color-border)', borderRadius: '8px', marginBottom: '12px', overflow: 'hidden', background: 'var(--color-bg-secondary)' }}>
                            {clinicLogo ? (
                              <img src={clinicLogo} alt="Clinic Logo" style={{ maxHeight: '90px', maxWidth: '100%', objectFit: 'contain' }} />
                            ) : (
                              <div style={{ textAlign: 'center', color: 'var(--color-text-tertiary)' }}>
                                <ImageIcon size={24} style={{ margin: '0 auto 4px', display: 'block', opacity: 0.5 }} />
                                <span style={{ fontSize: '11px' }}>No logo uploaded</span>
                              </div>
                            )}
                          </div>

                          <label className="btn btn-secondary" style={{ width: '100%', fontSize: '12px', justifyContent: 'center', cursor: 'pointer', gap: '6px' }}>
                            <Upload size={14} /> Upload Logo
                            <input
                              type="file"
                              accept="image/png, image/jpeg, image/svg+xml"
                              style={{ display: 'none' }}
                              onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                  handleAssetUpload('logo', e.target.files[0]);
                                }
                              }}
                            />
                          </label>

                          <div style={{ marginTop: '10px' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', cursor: 'pointer' }}>
                              <input type="checkbox" checked={isLogo} onChange={(e) => setIsLogo(e.target.checked)} />
                              <span>Show on Prescriptions</span>
                            </label>
                          </div>
                        </div>

                        {/* 2. CLINIC OFFICIAL STAMP CARD */}
                        <div style={{ background: 'var(--color-bg-primary)', border: '1px solid var(--color-border)', borderRadius: '12px', padding: '16px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                            <span style={{ fontWeight: '600', fontSize: '13px', color: 'var(--color-text-primary)' }}>Official Stamp / Seal</span>
                            {clinicStamp && (
                              <button
                                type="button"
                                onClick={() => handleRemoveAsset('stamp')}
                                style={{ background: 'none', border: 'none', color: 'var(--color-danger)', cursor: 'pointer', padding: '4px' }}
                                title="Remove Stamp"
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>

                          <div style={{ height: '110px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px dashed var(--color-border)', borderRadius: '8px', marginBottom: '12px', overflow: 'hidden', background: 'var(--color-bg-secondary)' }}>
                            {clinicStamp ? (
                              <img src={clinicStamp} alt="Clinic Stamp" style={{ maxHeight: '90px', maxWidth: '100%', objectFit: 'contain' }} />
                            ) : (
                              <div style={{ textAlign: 'center', color: 'var(--color-text-tertiary)' }}>
                                <ShieldCheck size={24} style={{ margin: '0 auto 4px', display: 'block', opacity: 0.5 }} />
                                <span style={{ fontSize: '11px' }}>No stamp uploaded</span>
                              </div>
                            )}
                          </div>

                          <label className="btn btn-secondary" style={{ width: '100%', fontSize: '12px', justifyContent: 'center', cursor: 'pointer', gap: '6px' }}>
                            <Upload size={14} /> Upload Stamp Image
                            <input
                              type="file"
                              accept="image/png, image/jpeg"
                              style={{ display: 'none' }}
                              onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                  handleAssetUpload('stamp', e.target.files[0]);
                                }
                              }}
                            />
                          </label>

                          <div style={{ marginTop: '10px' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', cursor: 'pointer' }}>
                              <input type="checkbox" checked={isStamp} onChange={(e) => setIsStamp(e.target.checked)} />
                              <span>Show on Certificates</span>
                            </label>
                          </div>
                        </div>

                        {/* 3. DOCTOR DIGITAL SIGNATURE CARD */}
                        <div style={{ background: 'var(--color-bg-primary)', border: '1px solid var(--color-border)', borderRadius: '12px', padding: '16px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                            <span style={{ fontWeight: '600', fontSize: '13px', color: 'var(--color-text-primary)' }}>Doctor Signature</span>
                            {doctorSignature && (
                              <button
                                type="button"
                                onClick={() => handleRemoveAsset('doctor_signature')}
                                style={{ background: 'none', border: 'none', color: 'var(--color-danger)', cursor: 'pointer', padding: '4px' }}
                                title="Remove Signature"
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>

                          <div style={{ height: '110px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px dashed var(--color-border)', borderRadius: '8px', marginBottom: '12px', overflow: 'hidden', background: 'var(--color-bg-secondary)' }}>
                            {doctorSignature ? (
                              <img src={doctorSignature} alt="Doctor Signature" style={{ maxHeight: '75px', maxWidth: '100%', objectFit: 'contain' }} />
                            ) : (
                              <div style={{ textAlign: 'center', color: 'var(--color-text-tertiary)' }}>
                                <PenTool size={24} style={{ margin: '0 auto 4px', display: 'block', opacity: 0.5 }} />
                                <span style={{ fontSize: '11px' }}>No signature attached</span>
                              </div>
                            )}
                          </div>

                          <div style={{ display: 'flex', gap: '8px' }}>
                            <label className="btn btn-secondary" style={{ flex: 1, fontSize: '12px', justifyContent: 'center', cursor: 'pointer', gap: '4px' }}>
                              <Upload size={13} /> Upload
                              <input
                                type="file"
                                accept="image/png, image/jpeg"
                                style={{ display: 'none' }}
                                onChange={(e) => {
                                  if (e.target.files && e.target.files[0]) {
                                    handleAssetUpload('doctor_signature', e.target.files[0]);
                                  }
                                }}
                              />
                            </label>

                            <button
                              type="button"
                              className="btn btn-primary"
                              style={{ flex: 1, fontSize: '12px', justifyContent: 'center', gap: '4px' }}
                              onClick={() => setShowSignCanvas(!showSignCanvas)}
                            >
                              <PenTool size={13} /> Draw Pad
                            </button>
                          </div>

                          <div style={{ marginTop: '10px' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', cursor: 'pointer' }}>
                              <input type="checkbox" checked={isDoctorSignature} onChange={(e) => setIsDoctorSignature(e.target.checked)} />
                              <span>Show on Prescriptions</span>
                            </label>
                          </div>
                        </div>
                      </div>

                      {/* ON-SCREEN SIGNATURE DRAWING PAD MODAL / EXPANDER */}
                      {showSignCanvas && (
                        <div style={{ marginTop: '20px', padding: '16px', background: 'var(--color-bg-primary)', border: '1px solid var(--color-border)', borderRadius: '12px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                            <div style={{ fontWeight: '600', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <PenTool size={14} style={{ color: 'var(--color-primary)' }} />
                              Draw Digital Signature on Screen
                            </div>
                            <span style={{ fontSize: '11px', color: 'var(--color-text-tertiary)' }}>Sign with mouse or stylus</span>
                          </div>

                          <div style={{ border: '1px solid #cbd5e1', borderRadius: '8px', background: '#ffffff', touchAction: 'none' }}>
                            <canvas
                              ref={canvasRef}
                              width={500}
                              height={140}
                              style={{ width: '100%', height: '140px', cursor: 'crosshair', display: 'block' }}
                              onMouseDown={startDrawing}
                              onMouseMove={draw}
                              onMouseUp={stopDrawing}
                              onMouseLeave={stopDrawing}
                              onTouchStart={startDrawing}
                              onTouchMove={draw}
                              onTouchEnd={stopDrawing}
                            />
                          </div>

                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                            <button
                              type="button"
                              className="btn btn-secondary"
                              onClick={clearCanvas}
                              style={{ fontSize: '12px', gap: '4px' }}
                            >
                              <RotateCcw size={13} /> Clear Canvas
                            </button>

                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={() => setShowSignCanvas(false)}
                                style={{ fontSize: '12px' }}
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                className="btn btn-primary"
                                onClick={applyCanvasSignature}
                                disabled={uploadingAsset || !hasDrawn}
                                style={{ fontSize: '12px', gap: '4px' }}
                              >
                                {uploadingAsset ? <RefreshCw size={14} className="spin" /> : <Check size={14} />}
                                {uploadingAsset ? 'Uploading Signature...' : 'Apply Signature'}
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* SECTION 3: LIVE LETTERHEAD & PRESCRIPTION PRINT PREVIEW */}
                    <div style={{ background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', borderRadius: '14px', padding: '20px', marginBottom: '28px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                        <div>
                          <h3 style={{ fontSize: '15px', fontWeight: 'bold', margin: 0, color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Sparkles size={16} style={{ color: 'var(--color-primary)' }} />
                            Live Printable Letterhead & Rx Preview
                          </h3>
                          <p style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', margin: '4px 0 0' }}>
                            Interactive mockup of how the Clinic Letterhead, Official Stamp, and Doctor Signature will render on physical printouts and PDFs.
                          </p>
                        </div>
                      </div>

                      <div style={{ background: '#ffffff', color: '#1e293b', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                        {/* Letterhead Top Row */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #0f766e', paddingBottom: '16px', marginBottom: '16px' }}>
                          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                            {isLogo && clinicLogo && (
                              <img src={clinicLogo} alt="Logo" style={{ height: '60px', width: '60px', objectFit: 'contain' }} />
                            )}
                            <div>
                              <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#0f766e', letterSpacing: '-0.3px' }}>
                                {clinicName || 'Clinic Practice Name'}
                              </div>
                              <div style={{ fontSize: '12px', color: '#475569', fontStyle: 'italic', marginBottom: '4px' }}>
                                {clinicTagline || 'Advanced Healthcare & Medical Services'}
                              </div>
                              <div style={{ fontSize: '11px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                                {clinicAddress && <span>📍 {clinicAddress}</span>}
                                {clinicPhone && <span>📞 {clinicPhone}</span>}
                                {clinicEmail && <span>✉️ {clinicEmail}</span>}
                              </div>
                            </div>
                          </div>

                          <div style={{ textAlign: 'right', fontSize: '11px', color: '#475569' }}>
                            {isOpenDays && (
                              <div style={{ fontWeight: '600', color: '#0f766e' }}>🗓️ Days: {openDays}</div>
                            )}
                            {isVisitingHours && (
                              <div>⏰ Hours: {visitHours}</div>
                            )}
                            {primaryDoctor && (
                              <div style={{ marginTop: '4px', fontWeight: '600' }}>
                                {docName || primaryDoctor.full_name} ({docQualification || primaryDoctor.qualification || 'Consultant'})
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Simulated Medical Consultation Body */}
                        <div style={{ padding: '24px 0', borderBottom: '1px dashed #cbd5e1' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#64748b', marginBottom: '12px' }}>
                            <span><strong>Patient:</strong> Jane Doe (Age: 32 / Female)</span>
                            <span><strong>Rx Date:</strong> {new Date().toLocaleDateString()}</span>
                          </div>
                          <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#0f766e', margin: '12px 0 6px' }}>℞ Medical Orders</div>
                          <div style={{ fontSize: '12px', color: '#94a3b8', fontStyle: 'italic' }}>
                            [Standard prescription medications, clinical instructions, and vital records appear here]
                          </div>
                        </div>

                        {/* Letterhead Bottom Row (Stamp & Signature) */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingTop: '16px' }}>
                          <div>
                            {isStamp && clinicStamp && (
                              <div style={{ textAlign: 'center' }}>
                                <img src={clinicStamp} alt="Stamp" style={{ height: '65px', width: '65px', objectFit: 'contain' }} />
                                <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>Clinic Official Seal</div>
                              </div>
                            )}
                          </div>

                          <div style={{ textAlign: 'center', minWidth: '160px' }}>
                            {isDoctorSignature && doctorSignature ? (
                              <img src={doctorSignature} alt="Signature" style={{ height: '45px', objectFit: 'contain', marginBottom: '4px' }} />
                            ) : (
                              <div style={{ height: '35px' }} />
                            )}
                            <div style={{ borderTop: '1px solid #94a3b8', paddingTop: '4px', fontSize: '11px', fontWeight: '600', color: '#1e293b' }}>
                              Authorized Doctor Signature
                            </div>
                            <div style={{ fontSize: '10px', color: '#64748b' }}>
                              {docName || primaryDoctor?.full_name || 'Chief Medical Officer'}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* SECTION 4: PRACTICE INFORMATION & SCHEDULE */}
                    <div style={{ background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', borderRadius: '14px', padding: '20px', marginBottom: '24px' }}>
                      <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '16px', color: 'var(--color-text-primary)' }}>
                        Clinic Contact Details & Operating Schedule
                      </h3>

                      <div className="form-row" style={{ marginBottom: '14px' }}>
                        <div className="form-group" style={{ flex: 1 }}>
                          <label className="form-label" style={{ fontWeight: '600' }}>Clinic Name *</label>
                          <input
                            type="text"
                            className="input-field"
                            value={clinicName}
                            onChange={(e) => setClinicName(e.target.value)}
                            required
                          />
                        </div>
                        <div className="form-group" style={{ flex: 1 }}>
                          <label className="form-label" style={{ fontWeight: '600' }}>Clinic Tagline</label>
                          <input
                            type="text"
                            className="input-field"
                            placeholder="e.g. Caring for Smiles Everyday"
                            value={clinicTagline}
                            onChange={(e) => setClinicTagline(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="form-row" style={{ marginBottom: '14px' }}>
                        <div className="form-group" style={{ flex: 1 }}>
                          <label className="form-label" style={{ fontWeight: '600' }}>Clinic Phone Number *</label>
                          <input
                            type="text"
                            className="input-field"
                            value={clinicPhone}
                            onChange={(e) => setClinicPhone(e.target.value)}
                            required
                          />
                        </div>
                        <div className="form-group" style={{ flex: 1 }}>
                          <label className="form-label" style={{ fontWeight: '600' }}>Clinic Email</label>
                          <input
                            type="email"
                            className="input-field"
                            value={clinicEmail}
                            onChange={(e) => setClinicEmail(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="form-group" style={{ marginBottom: '14px' }}>
                        <label className="form-label" style={{ fontWeight: '600' }}>Clinic Physical Address</label>
                        <input
                          type="text"
                          className="input-field"
                          placeholder="Street, Landmark, City, Pincode"
                          value={clinicAddress}
                          onChange={(e) => setClinicAddress(e.target.value)}
                        />
                      </div>

                      <div className="form-row">
                        <div className="form-group" style={{ flex: 1 }}>
                          <label className="form-label" style={{ fontWeight: '600' }}>Operating Days</label>
                          <input
                            type="text"
                            className="input-field"
                            placeholder="e.g. Mon - Sat"
                            value={openDays}
                            onChange={(e) => setOpenDays(e.target.value)}
                          />
                        </div>
                        <div className="form-group" style={{ flex: 1 }}>
                          <label className="form-label" style={{ fontWeight: '600' }}>Visiting Hours</label>
                          <input
                            type="text"
                            className="input-field"
                            placeholder="e.g. 09:00 AM - 08:00 PM"
                            value={visitHours}
                            onChange={(e) => setVisitHours(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <button 
                        type="submit" 
                        className="btn btn-primary" 
                        disabled={saving || uploadingAsset}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 24px' }}
                      >
                        {saving ? <RefreshCw size={16} className="spin" /> : <Save size={16} />}
                        {saving ? 'Saving...' : 'Save Clinic Practice Settings'}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* TAB 2: MY ACCOUNT PROFILE & SYSTEM PERMISSIONS */}
              {activeTab === 'profile' && (
                <div>
                  {/* HERO IDENTITY & SCOPE OVERVIEW CARD */}
                  <div style={{ background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', borderRadius: '16px', padding: '24px', marginBottom: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '20px', flexWrap: 'wrap', marginBottom: '20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
                        <div 
                          style={{ 
                            width: '64px', 
                            height: '64px', 
                            borderRadius: '16px', 
                            background: isStaff 
                              ? 'linear-gradient(135deg, #0284c7, #2563eb)' 
                              : isAdmin 
                                ? 'linear-gradient(135deg, #6366f1, #4f46e5)' 
                                : 'linear-gradient(135deg, #0d9488, #059669)',
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            color: '#ffffff',
                            fontSize: '24px',
                            fontWeight: '700',
                            boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
                          }}
                        >
                          {user?.full_name ? user.full_name[0].toUpperCase() : 'U'}
                        </div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                            <h2 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0, color: 'var(--color-text-primary)' }}>
                              {user?.full_name || 'Healthcare Professional'}
                            </h2>
                            {/* Role Badge */}
                            <span 
                              style={{ 
                                display: 'inline-flex', 
                                alignItems: 'center', 
                                gap: '6px', 
                                padding: '4px 12px', 
                                borderRadius: '20px', 
                                fontSize: '11px', 
                                fontWeight: '700',
                                letterSpacing: '0.4px',
                                textTransform: 'uppercase',
                                background: isStaff 
                                  ? 'rgba(2, 132, 199, 0.12)' 
                                  : isAdmin 
                                    ? 'rgba(99, 102, 241, 0.12)' 
                                    : 'rgba(13, 148, 136, 0.12)',
                                color: isStaff ? '#0284c7' : isAdmin ? '#6366f1' : '#0d9488'
                              }}
                            >
                              {isAdmin ? (
                                <><ShieldCheck size={14} /> Master Administrator</>
                              ) : isStaff ? (
                                <><UserCheck size={14} /> Clinic Operations Staff</>
                              ) : isPrimaryDoctor ? (
                                <><Stethoscope size={14} /> Primary Clinic Doctor</>
                              ) : (
                                <><Stethoscope size={14} /> Associate Practitioner</>
                              )}
                            </span>
                            {/* Status Pill */}
                            <span 
                              style={{ 
                                display: 'inline-flex', 
                                alignItems: 'center', 
                                gap: '6px', 
                                padding: '4px 10px', 
                                borderRadius: '20px', 
                                fontSize: '11px', 
                                fontWeight: '600',
                                background: 'rgba(16, 185, 129, 0.1)',
                                color: '#10b981'
                              }}
                            >
                              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }} />
                              Active Account
                            </span>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '8px', fontSize: '13px', color: 'var(--color-text-secondary)', flexWrap: 'wrap' }}>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                              <Mail size={14} style={{ color: 'var(--color-text-tertiary)' }} /> {user?.email || 'No email registered'}
                            </span>
                            {user?.phone && (
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                <Phone size={14} style={{ color: 'var(--color-text-tertiary)' }} /> {user.phone}
                              </span>
                            )}
                            {user?.createdAt && (
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                <Calendar size={14} style={{ color: 'var(--color-text-tertiary)' }} /> Member since {new Date(user.createdAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Quick Clearance Counter Pill */}
                      <div 
                        style={{ 
                          background: 'var(--color-bg-primary)', 
                          border: '1px solid var(--color-border)', 
                          borderRadius: '12px', 
                          padding: '12px 18px',
                          textAlign: 'right'
                        }}
                      >
                        <div style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          Account Privileges
                        </div>
                        <div style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--color-primary)', marginTop: '2px' }}>
                          {totalGrantedCount} / {totalPermissionsCount} Active
                        </div>
                      </div>
                    </div>

                    {/* METADATA CARDS: CLINIC SCOPE & SUPERVISION */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px', paddingTop: '16px', borderTop: '1px solid var(--color-border)' }}>
                      {/* Assigned Clinic */}
                      <div style={{ background: 'var(--color-bg-primary)', border: '1px solid var(--color-border)', borderRadius: '12px', padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(13, 148, 136, 0.1)', color: '#0d9488', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Hospital size={16} />
                          </div>
                          <div>
                            <div style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', fontWeight: '600', textTransform: 'uppercase' }}>Assigned Clinic</div>
                            <div style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--color-text-primary)' }}>
                              {user?.clinic_id?.name || clinicName || 'Adixon Central Healthcare'}
                            </div>
                          </div>
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', paddingLeft: '42px', lineHeight: '1.4' }}>
                          {user?.clinic_id?.address || clinicAddress || 'Registered Clinic Facility Address'}
                        </div>
                      </div>

                      {/* Supervising Doctor (if staff) or Registered Medical Credentials (if doctor) */}
                      {isStaff ? (
                        <div style={{ background: 'var(--color-bg-primary)', border: '1px solid var(--color-border)', borderRadius: '12px', padding: '14px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(2, 132, 199, 0.1)', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <Stethoscope size={16} />
                            </div>
                            <div>
                              <div style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', fontWeight: '600', textTransform: 'uppercase' }}>Supervising Practitioner</div>
                              <div style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--color-text-primary)' }}>
                                {user?.doctor_id?.full_name || primaryDoctor?.full_name || 'Primary Clinic Doctor'}
                              </div>
                            </div>
                          </div>
                          <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', paddingLeft: '42px', lineHeight: '1.4' }}>
                            {user?.doctor_id?.qualification || primaryDoctor?.qualification || 'Consultant'} • Reg: {user?.doctor_id?.registration_number || primaryDoctor?.registration_number || 'N/A'}
                          </div>
                        </div>
                      ) : (
                        <div style={{ background: 'var(--color-bg-primary)', border: '1px solid var(--color-border)', borderRadius: '12px', padding: '14px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(13, 148, 136, 0.1)', color: '#0d9488', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <Award size={16} />
                            </div>
                            <div>
                              <div style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', fontWeight: '600', textTransform: 'uppercase' }}>Medical Qualifications</div>
                              <div style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--color-text-primary)' }}>
                                {user?.qualification || 'Registered Practitioner'}
                              </div>
                            </div>
                          </div>
                          <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', paddingLeft: '42px', lineHeight: '1.4' }}>
                            Medical Council Reg: <strong>{user?.registration_number || 'Reg. Verified'}</strong>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* SECTION 1: PERSONAL CREDENTIALS & EDIT FORM */}
                  <div style={{ background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', borderRadius: '16px', padding: '24px', marginBottom: '28px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <div>
                        <h3 style={{ fontSize: '16px', fontWeight: 'bold', margin: 0, color: 'var(--color-text-primary)' }}>
                          Personal Profile & Contact Information
                        </h3>
                        <p style={{ fontSize: '13px', color: 'var(--color-text-tertiary)', margin: '4px 0 0' }}>
                          Update your display name, official contact number, and professional qualifications
                        </p>
                      </div>
                    </div>

                    <form onSubmit={handleProfileSubmit}>
                      <div className="form-row" style={{ marginBottom: '16px' }}>
                        <div className="form-group" style={{ flex: 1 }}>
                          <label className="form-label" style={{ fontWeight: '600' }}>Full Name *</label>
                          <input
                            type="text"
                            className="input-field"
                            value={profName}
                            onChange={(e) => setProfName(e.target.value)}
                            required
                          />
                        </div>
                        <div className="form-group" style={{ flex: 1 }}>
                          <label className="form-label" style={{ fontWeight: '600' }}>Email Address (Account ID)</label>
                          <input
                            type="email"
                            className="input-field"
                            value={profEmail}
                            disabled
                            style={{ backgroundColor: 'var(--color-bg-secondary)', cursor: 'not-allowed', color: 'var(--color-text-tertiary)' }}
                          />
                        </div>
                      </div>

                      <div className="form-row" style={{ marginBottom: '16px' }}>
                        <div className="form-group" style={{ flex: 1 }}>
                          <label className="form-label" style={{ fontWeight: '600' }}>Contact Phone Number *</label>
                          <input
                            type="text"
                            className="input-field"
                            value={profPhone}
                            onChange={(e) => setProfPhone(e.target.value)}
                            required
                          />
                        </div>
                        <div className="form-group" style={{ flex: 1 }}>
                          <label className="form-label" style={{ fontWeight: '600' }}>Assigned System Role</label>
                          <input
                            type="text"
                            className="input-field"
                            value={user?.role?.toUpperCase() || 'USER'}
                            disabled
                            style={{ backgroundColor: 'var(--color-bg-secondary)', cursor: 'not-allowed', color: 'var(--color-text-tertiary)', fontWeight: '600' }}
                          />
                        </div>
                      </div>

                      <div className="form-row" style={{ marginBottom: '24px' }}>
                        <div className="form-group" style={{ flex: 1 }}>
                          <label className="form-label" style={{ fontWeight: '600' }}>Professional Qualifications</label>
                          <input
                            type="text"
                            className="input-field"
                            placeholder="e.g. MBBS, MD (General Medicine), BDS"
                            value={qualification}
                            onChange={(e) => setQualification(e.target.value)}
                            disabled={isStaff}
                            style={isStaff ? { backgroundColor: 'var(--color-bg-secondary)', cursor: 'not-allowed' } : {}}
                          />
                          {isStaff && (
                            <span style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', marginTop: '4px', display: 'block' }}>
                              Qualifications for staff members are managed by the Clinic Administrator.
                            </span>
                          )}
                        </div>
                        <div className="form-group" style={{ flex: 1 }}>
                          <label className="form-label" style={{ fontWeight: '600' }}>Medical Council Registration No.</label>
                          <input
                            type="text"
                            className="input-field"
                            placeholder="e.g. MCI-2018-847291"
                            value={regNumber}
                            onChange={(e) => setRegNumber(e.target.value)}
                            disabled={isStaff}
                            style={isStaff ? { backgroundColor: 'var(--color-bg-secondary)', cursor: 'not-allowed' } : {}}
                          />
                          {isStaff && (
                            <span style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', marginTop: '4px', display: 'block' }}>
                              Registration numbers apply to licensed medical doctors only.
                            </span>
                          )}
                        </div>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <button 
                          type="submit" 
                          className="btn btn-primary" 
                          disabled={saving} 
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 24px' }}
                        >
                          {saving ? <RefreshCw size={16} className="spin" /> : <Save size={16} />}
                          {saving ? 'Saving...' : 'Save Profile Changes'}
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* SECTION 2: SYSTEM PRIVILEGES & FEATURE PERMISSIONS MATRIX */}
                  <div style={{ background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', borderRadius: '16px', padding: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(13, 148, 136, 0.12)', color: '#0d9488', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <ShieldCheck size={20} />
                          </div>
                          <div>
                            <h3 style={{ fontSize: '16px', fontWeight: 'bold', margin: 0, color: 'var(--color-text-primary)' }}>
                              Assigned Permissions & Feature Privileges
                            </h3>
                            <p style={{ fontSize: '13px', color: 'var(--color-text-tertiary)', margin: '3px 0 0' }}>
                              Real-time breakdown of all clinical, administrative, and diagnostic capabilities granted to your account
                            </p>
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '12px', fontWeight: '600', padding: '6px 12px', borderRadius: '8px', background: 'var(--color-bg-primary)', border: '1px solid var(--color-border)', color: 'var(--color-text-secondary)' }}>
                          {isStaff ? 'Role: Operational Support Staff' : isAdmin ? 'Role: Master System Administrator' : 'Role: Primary Medical Practitioner'}
                        </span>
                      </div>
                    </div>

                    {/* PERMISSION SUITES CONTAINER */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
                      {SYSTEM_PERMISSION_SUITES.map((suite) => (
                        <div key={suite.id} style={{ background: 'var(--color-bg-primary)', border: '1px solid var(--color-border)', borderRadius: '14px', padding: '18px 20px' }}>
                          {/* Suite Header */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                            <div style={{ color: 'var(--color-primary)' }}>{suite.icon}</div>
                            <div>
                              <div style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--color-text-primary)' }}>{suite.title}</div>
                              <div style={{ fontSize: '11px', color: 'var(--color-text-tertiary)' }}>{suite.description}</div>
                            </div>
                          </div>

                          {/* Permissions Cards Grid */}
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))', gap: '12px' }}>
                            {suite.permissions.map((perm) => {
                              const status = getPermissionStatus(perm);
                              return (
                                <div 
                                  key={perm.key} 
                                  style={{ 
                                    background: 'var(--color-bg-secondary)', 
                                    border: `1px solid ${status.isGranted ? 'rgba(16, 185, 129, 0.25)' : 'var(--color-border)'}`, 
                                    borderRadius: '12px', 
                                    padding: '14px 16px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'space-between',
                                    transition: 'all 0.2s'
                                  }}
                                >
                                  <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px', marginBottom: '8px' }}>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <div style={{ color: status.isGranted ? '#0d9488' : 'var(--color-text-tertiary)' }}>
                                          {perm.icon}
                                        </div>
                                        <span style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--color-text-primary)' }}>
                                          {perm.title}
                                        </span>
                                      </div>

                                      {/* Status Badge */}
                                      <span 
                                        style={{ 
                                          display: 'inline-flex', 
                                          alignItems: 'center', 
                                          gap: '4px', 
                                          padding: '3px 8px', 
                                          borderRadius: '6px', 
                                          fontSize: '10px', 
                                          fontWeight: '700',
                                          textTransform: 'uppercase',
                                          letterSpacing: '0.3px',
                                          backgroundColor: status.bg, 
                                          color: status.color,
                                          flexShrink: 0
                                        }}
                                      >
                                        {status.isGranted ? <Check size={11} /> : <Lock size={11} />}
                                        {status.label}
                                      </span>
                                    </div>

                                    <p style={{ fontSize: '11.5px', color: 'var(--color-text-secondary)', lineHeight: '1.45', margin: '0 0 10px 0' }}>
                                      {perm.description}
                                    </p>
                                  </div>

                                  <div style={{ fontSize: '10.5px', color: status.isGranted ? 'var(--color-text-tertiary)' : 'var(--color-danger)', borderTop: '1px dashed var(--color-border)', paddingTop: '8px' }}>
                                    {status.detail}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* ADVISORY CALLOUT */}
                    <div style={{ marginTop: '20px', padding: '14px 16px', borderRadius: '12px', background: isStaff ? 'rgba(2, 132, 199, 0.08)' : 'rgba(13, 148, 136, 0.08)', border: `1px solid ${isStaff ? 'rgba(2, 132, 199, 0.2)' : 'rgba(13, 148, 136, 0.2)'}`, display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                      <div style={{ color: isStaff ? '#0284c7' : '#0d9488', marginTop: '2px' }}>
                        <Info size={18} />
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', lineHeight: '1.5' }}>
                        {isStaff ? (
                          <>
                            <strong>Staff Operational Advisory:</strong> Your system permissions are managed and provisioned directly by your supervising <strong>Primary Doctor</strong>. If your day-to-day clinic duties require access to restricted modules (such as Medicine Stock, Labs, or Medical Certificates), please request a permission update from your Primary Doctor.
                          </>
                        ) : (
                          <>
                            <strong>Clinical Autonomy Notice:</strong> As a licensed medical doctor, you hold complete clinical authority for this clinic. All digital prescriptions and medical records issued under your session automatically apply your medical registration credentials, digital signature, and official clinic stamp.
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: PASSWORD SECURITY (STAFF RESTRICTED) */}
              {activeTab === 'security' && (
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '20px', color: 'var(--color-text-primary)' }}>
                    Account Password Security
                  </h3>

                  {isStaff ? (
                    <div style={{ background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', borderRadius: '12px', padding: '24px', textAlign: 'center', maxWidth: '520px' }}>
                      <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: 'var(--color-danger)' }}>
                        <Lock size={24} />
                      </div>
                      <h4 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '8px', color: 'var(--color-text-primary)' }}>
                        Password Management Restricted
                      </h4>
                      <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: '1.5', margin: 0 }}>
                        Clinic staff members do not have permission to change or reset login passwords. Please contact your <strong>Primary Doctor</strong> or <strong>Clinic Administrator</strong> to update your credentials.
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handlePasswordSubmit}>
                      <div className="form-group" style={{ marginBottom: '16px', maxWidth: '400px' }}>
                        <label className="form-label" style={{ fontWeight: '600' }}>New Password *</label>
                        <input
                          type="password"
                          className="input-field"
                          placeholder="At least 6 characters"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          required
                        />
                      </div>

                      <div className="form-group" style={{ marginBottom: '24px', maxWidth: '400px' }}>
                        <label className="form-label" style={{ fontWeight: '600' }}>Confirm New Password *</label>
                        <input
                          type="password"
                          className="input-field"
                          placeholder="Re-enter new password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required
                        />
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                        <button type="submit" className="btn btn-primary" disabled={saving} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                          {saving ? <RefreshCw size={16} className="spin" /> : <Key size={16} />}
                          {saving ? 'Updating...' : 'Update Password'}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}

              {/* TAB 4: MEDICINE PRESETS & OPTIONS (MASTER ADMIN) */}
              {activeTab === 'medicine_presets' && isAdmin && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <div>
                      <h3 style={{ fontSize: '16px', fontWeight: 'bold', margin: 0, color: 'var(--color-text-primary)' }}>
                        Medicine Prescription Presets & Configs
                      </h3>
                      <p style={{ fontSize: '13px', color: 'var(--color-text-tertiary)', marginTop: '4px' }}>
                        Manage master options for Medicine Routes, Frequencies, and Instructions across prescription forms
                      </p>
                    </div>
                  </div>

                  {/* SECTION 1: MEDICINE ROUTES */}
                  <div style={{ background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', borderRadius: '12px', padding: '18px', marginBottom: '20px' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '12px', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Pill size={16} /> Medicine Routes / Types ({routesList.length})
                    </h4>

                    <div style={{ display: 'flex', gap: '8px', marginBottom: '14px', maxWidth: '440px' }}>
                      <input
                        type="text"
                        className="input-field"
                        placeholder="Add new route (e.g. Inhalation, Sublingual)..."
                        value={newRouteInput}
                        onChange={(e) => setNewRouteInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddOption('route', newRouteInput);
                          }
                        }}
                      />
                      <button
                        type="button"
                        className="btn btn-primary"
                        style={{ padding: '6px 14px', fontSize: '13px', whiteSpace: 'nowrap' }}
                        onClick={() => handleAddOption('route', newRouteInput)}
                      >
                        <Plus size={14} /> Add Route
                      </button>
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {routesList.map((r, idx) => (
                        <span key={idx} className="badge-pill" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'var(--color-bg-primary)', border: '1px solid var(--color-border)' }}>
                          {r}
                          <Trash2
                            size={12}
                            style={{ cursor: 'pointer', color: 'var(--color-danger)' }}
                            onClick={() => handleDeleteOption('route', r)}
                          />
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* SECTION 2: MEDICINE FREQUENCIES */}
                  <div style={{ background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', borderRadius: '12px', padding: '18px', marginBottom: '20px' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '12px', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      Dosage Frequencies ({frequenciesList.length})
                    </h4>

                    <div style={{ display: 'flex', gap: '8px', marginBottom: '14px', maxWidth: '440px' }}>
                      <input
                        type="text"
                        className="input-field"
                        placeholder="Add frequency (e.g. 1-0-1, SOS, QID)..."
                        value={newFreqInput}
                        onChange={(e) => setNewFreqInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddOption('frequency', newFreqInput);
                          }
                        }}
                      />
                      <button
                        type="button"
                        className="btn btn-primary"
                        style={{ padding: '6px 14px', fontSize: '13px', whiteSpace: 'nowrap' }}
                        onClick={() => handleAddOption('frequency', newFreqInput)}
                      >
                        <Plus size={14} /> Add Frequency
                      </button>
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {frequenciesList.map((f, idx) => (
                        <span key={idx} className="badge-pill" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'var(--color-bg-primary)', border: '1px solid var(--color-border)' }}>
                          {f}
                          <Trash2
                            size={12}
                            style={{ cursor: 'pointer', color: 'var(--color-danger)' }}
                            onClick={() => handleDeleteOption('frequency', f)}
                          />
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* SECTION 3: INSTRUCTIONS */}
                  <div style={{ background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', borderRadius: '12px', padding: '18px' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '12px', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Sparkles size={16} /> Timing Instructions ({instructionsList.length})
                    </h4>

                    <div style={{ display: 'flex', gap: '8px', marginBottom: '14px', maxWidth: '440px' }}>
                      <input
                        type="text"
                        className="input-field"
                        placeholder="Add instruction (e.g. After Food, Empty Stomach)..."
                        value={newInstructionInput}
                        onChange={(e) => setNewInstructionInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddOption('instruction', newInstructionInput);
                          }
                        }}
                      />
                      <button
                        type="button"
                        className="btn btn-primary"
                        style={{ padding: '6px 14px', fontSize: '13px', whiteSpace: 'nowrap' }}
                        onClick={() => handleAddOption('instruction', newInstructionInput)}
                      >
                        <Plus size={14} /> Add Instruction
                      </button>
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {instructionsList.map((i, idx) => (
                        <span key={idx} className="badge-pill" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'var(--color-bg-primary)', border: '1px solid var(--color-border)' }}>
                          {i}
                          <Trash2
                            size={12}
                            style={{ cursor: 'pointer', color: 'var(--color-danger)' }}
                            onClick={() => handleDeleteOption('instruction', i)}
                          />
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
