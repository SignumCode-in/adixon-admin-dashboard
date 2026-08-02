import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { userAPI, clinicAPI } from '../services/api';
import { User, Hospital, Key, Save, RefreshCw, CheckCircle2 } from 'lucide-react';

export default function Settings() {
  const { user, login } = useAuth();
  
  // Tabs: 'profile' | 'clinic' | 'security'
  const [activeTab, setActiveTab] = useState('profile');
  
  // UI states
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
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
  const [isLogo, setIsLogo] = useState(false);
  const [isOpenDays, setIsOpenDays] = useState(true);
  const [isVisitingHours, setIsVisitingHours] = useState(true);
  const [isStamp, setIsStamp] = useState(false);
  const [isDoctorSignature, setIsDoctorSignature] = useState(false);

  // Security password states
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

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

      // Fetch user's assigned clinic
      const res = await clinicAPI.getClinics();
      if (res && res.data && res.data.length > 0) {
        // Find user's clinic or use first clinic
        const userClinicId = user?.clinic_id?._id || user?.clinic_id;
        const targetClinic = res.data.find(c => c._id === userClinicId) || res.data[0];
        
        if (targetClinic) {
          setClinicId(targetClinic._id);
          setClinicName(targetClinic.name || '');
          setClinicTagline(targetClinic.tagline || '');
          setClinicPhone(targetClinic.phone || '');
          setClinicEmail(targetClinic.email || '');
          setClinicAddress(targetClinic.address || '');
          setOpenDays(targetClinic.open_days || 'Mon - Sat');
          setVisitHours(targetClinic.visit_hours || '09:00 AM - 08:00 PM');
          setIsLogo(targetClinic.is_logo ?? false);
          setIsOpenDays(targetClinic.is_open_days ?? true);
          setIsVisitingHours(targetClinic.is_visiting_hours ?? true);
          setIsStamp(targetClinic.is_stamp ?? false);
          setIsDoctorSignature(targetClinic.is_doctor_signature ?? false);
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
  }, [user]);

  // Submit Profile Information API
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg('');
    setSuccessMsg('');

    if (!/^[6-9]\d{9}$/.test(profPhone)) {
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
      setSuccessMsg('Profile settings updated successfully in backend.');
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || 'Failed to update profile settings.');
    } finally {
      setSaving(false);
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

      await clinicAPI.updateClinic(clinicId, payload);
      setSuccessMsg('Clinic practice configurations updated successfully.');
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || 'Failed to update clinic settings.');
    } finally {
      setSaving(false);
    }
  };

  // Submit Password Security API
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
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
    <div>
      <div className="page-header" style={{ marginBottom: '20px' }}>
        <div>
          <h1 className="page-title">Account & Practice Settings</h1>
          <p className="page-subtitle">Manage practitioner profile, clinic configurations, and account security</p>
        </div>
      </div>

      {successMsg && (
        <div className="badge badge-success" style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px' }}>
          <CheckCircle2 size={16} /> {successMsg}
        </div>
      )}

      {errorMsg && (
        <div className="badge badge-danger" style={{ display: 'block', width: '100%', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px' }}>
          {errorMsg}
        </div>
      )}

      <div className="settings-grid" style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: '20px' }}>
        {/* Left Settings Navigation Sidebar */}
        <div className="settings-sidebar" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div
            className={`settings-nav-item ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('profile');
              setErrorMsg('');
              setSuccessMsg('');
            }}
            style={{ 
              padding: '12px 16px', 
              borderRadius: '8px', 
              cursor: 'pointer',
              fontWeight: activeTab === 'profile' ? '600' : '500',
              backgroundColor: activeTab === 'profile' ? 'var(--color-primary-light)' : 'transparent',
              color: activeTab === 'profile' ? 'var(--color-primary)' : 'var(--color-text-secondary)'
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px' }}>
              <User size={18} /> My Profile Info
            </span>
          </div>

          <div
            className={`settings-nav-item ${activeTab === 'clinic' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('clinic');
              setErrorMsg('');
              setSuccessMsg('');
            }}
            style={{ 
              padding: '12px 16px', 
              borderRadius: '8px', 
              cursor: 'pointer',
              fontWeight: activeTab === 'clinic' ? '600' : '500',
              backgroundColor: activeTab === 'clinic' ? 'var(--color-primary-light)' : 'transparent',
              color: activeTab === 'clinic' ? 'var(--color-primary)' : 'var(--color-text-secondary)'
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px' }}>
              <Hospital size={18} /> Clinic Practice Settings
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
              borderRadius: '8px', 
              cursor: 'pointer',
              fontWeight: activeTab === 'security' ? '600' : '500',
              backgroundColor: activeTab === 'security' ? 'var(--color-primary-light)' : 'transparent',
              color: activeTab === 'security' ? 'var(--color-primary)' : 'var(--color-text-secondary)'
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px' }}>
              <Key size={18} /> Password Security
            </span>
          </div>
        </div>

        {/* Right Settings Content Panel */}
        <div className="card" style={{ padding: '24px', borderRadius: '16px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-tertiary)' }}>Loading settings...</div>
          ) : (
            <>
              {/* Tab 1: Practitioner Profile Info */}
              {activeTab === 'profile' && (
                <form onSubmit={handleProfileSubmit}>
                  <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '20px', color: 'var(--color-text-primary)' }}>
                    Practitioner Profile Settings
                  </h3>

                  <div className="form-row" style={{ marginBottom: '16px' }}>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label className="form-label" style={{ fontWeight: 'bold' }}>Full Name *</label>
                      <input
                        type="text"
                        className="input-field"
                        value={profName}
                        onChange={(e) => setProfName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label className="form-label" style={{ fontWeight: 'bold' }}>Email Address (Account ID)</label>
                      <input
                        type="email"
                        className="input-field"
                        value={profEmail}
                        disabled
                        style={{ backgroundColor: 'var(--color-bg-secondary)', cursor: 'not-allowed' }}
                      />
                    </div>
                  </div>

                  <div className="form-row" style={{ marginBottom: '16px' }}>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label className="form-label" style={{ fontWeight: 'bold' }}>Phone Number *</label>
                      <input
                        type="text"
                        className="input-field"
                        value={profPhone}
                        onChange={(e) => setProfPhone(e.target.value)}
                        required
                      />
                    </div>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label className="form-label" style={{ fontWeight: 'bold' }}>Account Role</label>
                      <input
                        type="text"
                        className="input-field"
                        value={user?.role?.toUpperCase() || 'PRACTITIONER'}
                        disabled
                        style={{ backgroundColor: 'var(--color-bg-secondary)', cursor: 'not-allowed', textTransform: 'capitalize' }}
                      />
                    </div>
                  </div>

                  <div className="form-row" style={{ marginBottom: '24px' }}>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label className="form-label" style={{ fontWeight: 'bold' }}>Qualifications</label>
                      <input
                        type="text"
                        className="input-field"
                        placeholder="e.g. MBBS, BDS, MDS"
                        value={qualification}
                        onChange={(e) => setQualification(e.target.value)}
                      />
                    </div>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label className="form-label" style={{ fontWeight: 'bold' }}>Medical Council Registration No.</label>
                      <input
                        type="text"
                        className="input-field"
                        placeholder="e.g. REG-987452"
                        value={regNumber}
                        onChange={(e) => setRegNumber(e.target.value)}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button type="submit" className="btn btn-primary" disabled={saving} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                      {saving ? <RefreshCw size={16} className="spin" /> : <Save size={16} />}
                      {saving ? 'Saving...' : 'Save Profile Settings'}
                    </button>
                  </div>
                </form>
              )}

              {/* Tab 2: Clinic Practice Settings */}
              {activeTab === 'clinic' && (
                <form onSubmit={handleClinicSubmit}>
                  <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '20px', color: 'var(--color-text-primary)' }}>
                    Clinic Branch & Document Header Settings
                  </h3>

                  <div className="form-row" style={{ marginBottom: '16px' }}>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label className="form-label" style={{ fontWeight: 'bold' }}>Clinic Name *</label>
                      <input
                        type="text"
                        className="input-field"
                        value={clinicName}
                        onChange={(e) => setClinicName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label className="form-label" style={{ fontWeight: 'bold' }}>Clinic Tagline</label>
                      <input
                        type="text"
                        className="input-field"
                        placeholder="We Care For Your Health"
                        value={clinicTagline}
                        onChange={(e) => setClinicTagline(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="form-row" style={{ marginBottom: '16px' }}>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label className="form-label" style={{ fontWeight: 'bold' }}>Clinic Phone *</label>
                      <input
                        type="text"
                        className="input-field"
                        value={clinicPhone}
                        onChange={(e) => setClinicPhone(e.target.value)}
                        required
                      />
                    </div>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label className="form-label" style={{ fontWeight: 'bold' }}>Clinic Email</label>
                      <input
                        type="email"
                        className="input-field"
                        value={clinicEmail}
                        onChange={(e) => setClinicEmail(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="form-group" style={{ marginBottom: '16px' }}>
                    <label className="form-label" style={{ fontWeight: 'bold' }}>Clinic Physical Address</label>
                    <input
                      type="text"
                      className="input-field"
                      value={clinicAddress}
                      onChange={(e) => setClinicAddress(e.target.value)}
                    />
                  </div>

                  <div className="form-row" style={{ marginBottom: '20px' }}>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label className="form-label" style={{ fontWeight: 'bold' }}>Open Days</label>
                      <input
                        type="text"
                        className="input-field"
                        value={openDays}
                        onChange={(e) => setOpenDays(e.target.value)}
                      />
                    </div>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label className="form-label" style={{ fontWeight: 'bold' }}>Visiting Hours</label>
                      <input
                        type="text"
                        className="input-field"
                        value={visitHours}
                        onChange={(e) => setVisitHours(e.target.value)}
                      />
                    </div>
                  </div>

                  <h4 style={{ fontSize: '14px', fontWeight: 'bold', margin: '20px 0 12px', color: 'var(--color-primary)' }}>Printable Rx & Certificate Header Options</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '14px', backgroundColor: 'var(--color-bg-secondary)', padding: '16px', borderRadius: '12px', marginBottom: '24px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer', fontWeight: '500' }}>
                      <input type="checkbox" checked={isLogo} onChange={(e) => setIsLogo(e.target.checked)} />
                      Show Clinic Logo
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer', fontWeight: '500' }}>
                      <input type="checkbox" checked={isOpenDays} onChange={(e) => setIsOpenDays(e.target.checked)} />
                      Show Open Days
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer', fontWeight: '500' }}>
                      <input type="checkbox" checked={isVisitingHours} onChange={(e) => setIsVisitingHours(e.target.checked)} />
                      Show Visiting Hours
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer', fontWeight: '500' }}>
                      <input type="checkbox" checked={isStamp} onChange={(e) => setIsStamp(e.target.checked)} />
                      Show Clinic Stamp
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer', fontWeight: '500' }}>
                      <input type="checkbox" checked={isDoctorSignature} onChange={(e) => setIsDoctorSignature(e.target.checked)} />
                      Show Doctor Signature
                    </label>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button type="submit" className="btn btn-primary" disabled={saving} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                      {saving ? <RefreshCw size={16} className="spin" /> : <Save size={16} />}
                      {saving ? 'Saving...' : 'Save Clinic Settings'}
                    </button>
                  </div>
                </form>
              )}

              {/* Tab 3: Password Security */}
              {activeTab === 'security' && (
                <form onSubmit={handlePasswordSubmit}>
                  <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '20px', color: 'var(--color-text-primary)' }}>
                    Change Account Password
                  </h3>

                  <div className="form-group" style={{ marginBottom: '16px', maxWidth: '400px' }}>
                    <label className="form-label" style={{ fontWeight: 'bold' }}>New Password *</label>
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
                    <label className="form-label" style={{ fontWeight: 'bold' }}>Confirm New Password *</label>
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
            </>
          )}
        </div>
      </div>
    </div>
  );
}
