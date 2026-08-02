import React, { useState, useEffect } from 'react';
import { clinicAPI } from '../services/api';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import { Hospital, PlusCircle, Search, Edit2, ArrowLeft, Trash2 } from 'lucide-react';

export default function Clinics() {
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Search & Filter
  const [search, setSearch] = useState('');

  // View Mode: 'list' | 'editor'
  const [viewMode, setViewMode] = useState('list');
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState(null);

  // Delete Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [tagline, setTagline] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [address, setAddress] = useState('');
  const [openDays, setOpenDays] = useState('Mon - Sat');
  const [visitHours, setVisitHours] = useState('09:00 AM - 08:00 PM');
  const [isLogo, setIsLogo] = useState(false);
  const [isOpenDays, setIsOpenDays] = useState(true);
  const [isVisitingHours, setIsVisitingHours] = useState(true);
  const [isStamp, setIsStamp] = useState(false);
  const [isDoctorSignature, setIsDoctorSignature] = useState(false);

  const loadClinics = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await clinicAPI.getClinics();
      if (res && res.data) {
        setClinics(res.data);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load clinics list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClinics();
  }, []);

  const handleOpenAdd = () => {
    setIsEdit(false);
    setEditId(null);
    setName('');
    setTagline('');
    setPhone('');
    setEmail('');
    setWebsite('');
    setAddress('');
    setOpenDays('Mon - Sat');
    setVisitHours('09:00 AM - 08:00 PM');
    setIsLogo(false);
    setIsOpenDays(true);
    setIsVisitingHours(true);
    setIsStamp(false);
    setIsDoctorSignature(false);
    setError('');
    setViewMode('editor');
  };

  const handleOpenEdit = (c) => {
    setIsEdit(true);
    setEditId(c._id);
    setName(c.name || '');
    setTagline(c.tagline || '');
    setPhone(c.phone || '');
    setEmail(c.email || '');
    setWebsite(c.website || '');
    setAddress(c.address || '');
    setOpenDays(c.open_days || 'Mon - Sat');
    setVisitHours(c.visit_hours || '09:00 AM - 08:00 PM');
    setIsLogo(c.is_logo ?? false);
    setIsOpenDays(c.is_open_days ?? true);
    setIsVisitingHours(c.is_visiting_hours ?? true);
    setIsStamp(c.is_stamp ?? false);
    setIsDoctorSignature(c.is_doctor_signature ?? false);
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
      await clinicAPI.deleteClinic(deleteId);
      setSuccess('Clinic record deleted successfully.');
      setDeleteModalOpen(false);
      setDeleteId(null);
      loadClinics();
    } catch (err) {
      setError('Failed to delete clinic.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const payload = {
      name,
      tagline,
      phone,
      email,
      website,
      address,
      open_days: openDays,
      visit_hours: visitHours,
      is_logo: isLogo,
      is_open_days: isOpenDays,
      is_visiting_hours: isVisitingHours,
      is_stamp: isStamp,
      is_doctor_signature: isDoctorSignature,
    };

    try {
      if (isEdit) {
        await clinicAPI.updateClinic(editId, payload);
        setSuccess('Clinic details updated successfully.');
      } else {
        await clinicAPI.createClinic(payload);
        setSuccess('Clinic registered successfully.');
      }
      setViewMode('list');
      loadClinics();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Error occurred while saving clinic details.');
    }
  };

  const filtered = clinics.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  // Full Page Screen Editor (100% Width)
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
              <ArrowLeft size={16} /> Back to Clinics List
            </button>
            <h1 className="page-title">{isEdit ? 'Edit Clinic Details' : 'Register New Clinic Branch'}</h1>
            <p className="page-subtitle">Configure practice details, visiting hours, and printable document toggles</p>
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
                <label className="form-label" style={{ fontWeight: 'bold' }}>Clinic Name *</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. Grand Central Dental"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label" style={{ fontWeight: 'bold' }}>Clinic Tagline</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="We Care For Your Smile"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                />
              </div>
            </div>

            <div className="form-row" style={{ marginBottom: '16px' }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label" style={{ fontWeight: 'bold' }}>Phone Number *</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="9876543210"
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
                  placeholder="info@dentalcare.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="form-row" style={{ marginBottom: '16px' }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label" style={{ fontWeight: 'bold' }}>Website URL</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="https://dentalcare.com"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label" style={{ fontWeight: 'bold' }}>Address Location</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Full clinic physical address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>
            </div>

            <div className="form-row" style={{ marginBottom: '20px' }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label" style={{ fontWeight: 'bold' }}>Open Days</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Mon - Sat"
                  value={openDays}
                  onChange={(e) => setOpenDays(e.target.value)}
                />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label" style={{ fontWeight: 'bold' }}>Visiting Hours</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="09:00 AM - 08:00 PM"
                  value={visitHours}
                  onChange={(e) => setVisitHours(e.target.value)}
                />
              </div>
            </div>

            <h4 style={{ fontSize: '14px', fontWeight: 'bold', margin: '20px 0 12px', color: 'var(--color-primary)' }}>Printable Header & Document Configurations</h4>
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

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setViewMode('list')}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                {isEdit ? 'Save Changes' : 'Register Clinic'}
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
          <h1 className="page-title">Clinics Directory</h1>
          <p className="page-subtitle">Manage dental, cosmetic, and general health clinic branches</p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenAdd}>
          <PlusCircle size={14} /> Add New Clinic
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
            placeholder="Search by clinic name..."
            style={{ paddingLeft: '32px' }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Search size={14} style={{ position: 'absolute', left: '10px', top: '12px', color: 'var(--color-text-tertiary)' }} />
        </div>
      </div>

      <div className="table-responsive">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-tertiary)' }}>Loading clinic entries...</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-tertiary)' }}>No clinics registered.</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Clinic Name</th>
                <th>Phone Number</th>
                <th>Email Address</th>
                <th>Address Location</th>
                <th>Open Timing</th>
                <th>Visiting Hours</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c._id}>
                  <td style={{ fontWeight: 'bold' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Hospital size={16} color="var(--color-primary)" />
                      {c.name}
                    </span>
                  </td>
                  <td>{c.phone || 'N/A'}</td>
                  <td>{c.email || 'N/A'}</td>
                  <td>{c.address || 'N/A'}</td>
                  <td>{c.open_days || 'Mon - Sat'}</td>
                  <td>{c.visit_hours || 'N/A'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button className="icon-btn" onClick={() => handleOpenEdit(c)} title="Edit clinic info">
                        <Edit2 size={14} />
                      </button>
                      <button className="icon-btn" style={{ color: 'var(--color-danger)' }} onClick={() => triggerDelete(c._id)} title="Delete clinic">
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

      {/* Delete Confirmation Popup Dialog Modal */}
      <ConfirmDeleteModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setDeleteId(null);
        }}
        onConfirm={confirmDelete}
        title="Delete Clinic Branch"
        message="Are you sure you want to delete this clinic branch record?"
        loading={deleteLoading}
      />
    </div>
  );
}
