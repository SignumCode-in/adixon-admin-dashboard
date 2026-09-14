import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { userAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useActiveClinicScope } from '../hooks/useActiveClinicScope';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import ViewToggle from '../components/common/ViewToggle';
import { 
  UserPlus, 
  Search, 
  Trash2, 
  Edit2, 
  Download,
  ArrowLeft,
  KeyRound,
  Lock,
  Eye,
  EyeOff,
  X,
  Mail,
  Phone,
  Building2,
  Shield,
  User as UserIcon
} from 'lucide-react';

export default function Users() {
  const { user, isAdmin } = useAuth();
  const isPrimaryDoctor = user?.role === 'doctor' && user?.is_primary;
  const canChangePassword = isAdmin || isPrimaryDoctor;

  const activeClinicId = useActiveClinicScope();
  const location = useLocation();
  
  // Data states
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit, setLimit] = useState(20);

  // Filters & Actions
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);

  // Display Mode: 'list' | 'grid'
  const [displayMode, setDisplayMode] = useState(() => localStorage.getItem('adixon_view_mode_users') || 'list');

  const handleDisplayModeChange = (mode) => {
    setDisplayMode(mode);
    localStorage.setItem('adixon_view_mode_users', mode);
  };

  // View Mode: 'list' | 'editor'
  const [viewMode, setViewMode] = useState('list');
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState(null);

  // Delete Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [isBulkDelete, setIsBulkDelete] = useState(false);
  
  // Form fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [role, setRole] = useState('staff');
  const [qualification, setQualification] = useState('');
  const [regNumber, setRegNumber] = useState('');
  
  // Password Change Modal States
  const [changePasswordModalOpen, setChangePasswordModalOpen] = useState(false);
  const [targetStaff, setTargetStaff] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  // UI states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Auto trigger add modal if query has ?add=true
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('add') === 'true') {
      handleOpenAddModal();
    }
  }, [location]);

  // Load Users
  const loadUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {
        page: currentPage,
        limit,
        search,
      };
      if (roleFilter) params.role = roleFilter;
      const targetClinicId = activeClinicId || user?.clinic_id?._id || user?.clinic_id;
      if (targetClinicId) params.clinic_id = targetClinicId;
      
      const res = await userAPI.getUsers(params);
      if (res && res.data) {
        setUsers(res.data);
        setTotal(res.pagination?.total_records || res.data.length);
        setTotalPages(res.pagination?.total_pages || 1);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch user list from backend database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [currentPage, limit, roleFilter, search, activeClinicId]);

  const handleOpenAddModal = () => {
    setIsEdit(false);
    setEditId(null);
    setFullName('');
    setEmail('');
    setPhone('');
    setPassword('');
    setRole('staff');
    setQualification('');
    setRegNumber('');
    setError('');
    setViewMode('editor');
  };

  const handleOpenEditModal = (u) => {
    setIsEdit(true);
    setEditId(u._id);
    setFullName(u.full_name || '');
    setEmail(u.email || '');
    setPhone(u.phone || '');
    setPassword('••••••');
    setEditPassword('');
    setRole(u.role || 'staff');
    setQualification(u.qualification || '');
    setRegNumber(u.registration_number || '');
    setError('');
    setViewMode('editor');
  };

  const handleOpenChangePassword = (u) => {
    setTargetStaff(u);
    setNewPassword('');
    setConfirmPassword('');
    setPasswordError('');
    setShowNewPassword(false);
    setChangePasswordModalOpen(true);
  };

  const handleChangePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match.');
      return;
    }

    setPasswordLoading(true);
    setPasswordError('');
    try {
      await userAPI.changePassword(targetStaff._id, newPassword);
      setSuccess(`Password for ${targetStaff.full_name || targetStaff.email} updated successfully.`);
      setChangePasswordModalOpen(false);
      setTargetStaff(null);
    } catch (err) {
      console.error(err);
      setPasswordError(err.response?.data?.message || 'Failed to update staff password.');
    } finally {
      setPasswordLoading(false);
    }
  };

  const triggerSingleDelete = (id) => {
    setIsBulkDelete(false);
    setDeleteId(id);
    setDeleteModalOpen(true);
  };

  const triggerBulkDelete = () => {
    setIsBulkDelete(true);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    setDeleteLoading(true);
    try {
      if (isBulkDelete) {
        await Promise.all(selectedIds.map((id) => userAPI.deleteUser(id)));
        setSuccess(`${selectedIds.length} users deleted successfully.`);
        setSelectedIds([]);
      } else if (deleteId) {
        await userAPI.deleteUser(deleteId);
        setSuccess('User deleted successfully.');
      }
      setDeleteModalOpen(false);
      setDeleteId(null);
      loadUsers();
    } catch (err) {
      setError('Error occurred while deleting user.');
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

    try {
      if (isEdit) {
        const payload = {
          full_name: fullName,
          email,
          phone,
          role,
          qualification,
          registration_number: regNumber,
          ...(editPassword.trim().length >= 6 ? { password: editPassword.trim() } : {}),
        };
        await userAPI.updateUser(editId, payload);
        setSuccess('User profile updated successfully.');
      } else {
        const targetClinicId = activeClinicId || user?.clinic_id?._id || user?.clinic_id;
        const payload = {
          full_name: fullName,
          email,
          phone,
          password,
          role,
          qualification,
          registration_number: regNumber,
          ...(role !== 'admin' && targetClinicId ? { clinic_id: targetClinicId } : {}),
        };
        await userAPI.createUser(payload);
        setSuccess('User created successfully.');
      }
      setViewMode('list');
      loadUsers();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Error occurred while saving user data.');
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      await userAPI.updateUserStatus(id, !currentStatus);
      setSuccess(`User status updated successfully.`);
      loadUsers();
    } catch (err) {
      setError('Error updating user active status.');
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(users.map((u) => u._id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (e, id) => {
    if (e.target.checked) {
      setSelectedIds((prev) => [...prev, id]);
    } else {
      setSelectedIds((prev) => prev.filter((item) => item !== id));
    }
  };

  const handleExportCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'ID,Name,Email,Phone,Role,Status,Joined\n';
    users.forEach((u) => {
      csvContent += `${u._id},"${u.full_name}",${u.email},${u.phone},${u.role},${u.status ? 'Active' : 'Suspended'},${u.createdAt}\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `adixon_users_export.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
              <ArrowLeft size={16} /> Back to Users Directory
            </button>
            <h1 className="page-title">{isEdit ? 'Edit Staff User Account' : 'Register New Staff User'}</h1>
            <p className="page-subtitle">Configure user credentials, role permissions, and clinical qualifications</p>
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
                  placeholder="e.g. John Wayne"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label" style={{ fontWeight: 'bold' }}>Account Role *</label>
                <select className="input-field" value={role} onChange={(e) => setRole(e.target.value)}>
                  <option value="staff">Staff</option>
                  <option value="doctor">Doctor</option>
                </select>
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label className="form-label" style={{ fontWeight: 'bold' }}>Email Address *</label>
              <input
                type="email"
                className="input-field"
                placeholder="john@clinic.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isEdit}
              />
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
              
              {!isEdit ? (
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label" style={{ fontWeight: 'bold' }}>Login Password *</label>
                  <input
                    type="password"
                    className="input-field"
                    placeholder="••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>
              ) : canChangePassword && (
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label" style={{ fontWeight: 'bold' }}>
                    New Password <span style={{ fontWeight: 'normal', fontSize: '11px', color: 'var(--color-text-secondary)' }}>(Optional, min 6 chars)</span>
                  </label>
                  <input
                    type="password"
                    className="input-field"
                    placeholder="Leave blank to keep existing password"
                    value={editPassword}
                    onChange={(e) => setEditPassword(e.target.value)}
                    minLength={6}
                  />
                </div>
              )}
            </div>

            <div className="form-row" style={{ marginBottom: '24px' }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label" style={{ fontWeight: 'bold' }}>Qualification</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="MBBS, BDS, BAMS"
                  value={qualification}
                  onChange={(e) => setQualification(e.target.value)}
                />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label" style={{ fontWeight: 'bold' }}>Medical Council Registration No.</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="REG12345"
                  value={regNumber}
                  onChange={(e) => setRegNumber(e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setViewMode('list')}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                {isEdit ? 'Save Changes' : 'Create User Account'}
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
          <h1 className="page-title">Users & Staff Directory</h1>
          <p className="page-subtitle">Manage accounts, clinics permissions, roles, and status levels</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-secondary" onClick={handleExportCSV}>
            <Download size={14} /> Export CSV
          </button>
          <button className="btn btn-primary" onClick={handleOpenAddModal}>
            <UserPlus size={14} /> Add Staff User
          </button>
        </div>
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

      {/* Filter and Search Bar */}
      <div className="card" style={{ padding: '12px 16px', marginBottom: '16px', display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: '12px', flex: 1, minWidth: '260px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '200px', maxWidth: '320px' }}>
            <input
              type="text"
              className="input-field"
              placeholder="Search by name, email, phone..."
              style={{ paddingLeft: '32px' }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Search size={14} style={{ position: 'absolute', left: '10px', top: '12px', color: 'var(--color-text-tertiary)' }} />
          </div>

          <select className="input-field" style={{ width: '140px' }} value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
            <option value="">All Roles</option>
            <option value="admin">Administrator</option>
            <option value="doctor">Doctor</option>
            <option value="receptionist">Receptionist</option>
            <option value="staff">Staff</option>
          </select>

          {selectedIds.length > 0 && (
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', backgroundColor: 'var(--color-bg-secondary)', padding: '4px 12px', borderRadius: '6px' }}>
              <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', fontWeight: 'bold' }}>{selectedIds.length} selected</span>
              <button className="btn btn-danger" style={{ padding: '2px 8px', fontSize: '11px' }} onClick={triggerBulkDelete}>
                <Trash2 size={12} /> Bulk Delete
              </button>
            </div>
          )}
        </div>

        <ViewToggle mode={displayMode} onChange={handleDisplayModeChange} />
      </div>

      {/* Content Container */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-tertiary)' }}>Loading staff profiles...</div>
      ) : users.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-tertiary)' }}>No users found matching query.</div>
      ) : displayMode === 'grid' ? (
        <div className="records-grid">
          {users.map((u) => {
            const initials = u.full_name ? u.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'U';
            const isDoctor = u.role === 'doctor';
            return (
              <div key={u._id} className="record-card">
                <div className="record-card-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <input
                      type="checkbox"
                      onChange={(e) => handleSelectOne(e, u._id)}
                      checked={selectedIds.includes(u._id)}
                      style={{ cursor: 'pointer' }}
                    />
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background: isDoctor ? 'var(--color-primary-light)' : 'var(--color-bg-secondary)',
                      color: isDoctor ? 'var(--color-primary)' : 'var(--color-text-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 'bold',
                      fontSize: '13px',
                      flexShrink: 0
                    }}>
                      {initials}
                    </div>
                    <div>
                      <div style={{ fontWeight: 'bold', fontSize: '14px', color: 'var(--color-text-primary)' }}>
                        {u.full_name}
                      </div>
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginTop: '2px' }}>
                        <span className={`badge ${isDoctor ? 'badge-primary' : 'badge-info'}`} style={{ textTransform: 'capitalize', fontSize: '10px' }}>
                          {u.role}
                        </span>
                        {u.is_primary && (
                          <span className="badge badge-warning" style={{ fontSize: '9px' }}>Primary</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleToggleStatus(u._id, u.status)}
                    className={`btn ${u.status ? 'badge-success' : 'badge-danger'}`}
                    style={{ border: 'none', padding: '3px 8px', fontSize: '11px', borderRadius: '12px', cursor: 'pointer', fontWeight: 600 }}
                  >
                    {u.status ? 'Active' : 'Suspended'}
                  </button>
                </div>

                <div className="record-card-body">
                  <div className="record-card-row">
                    <span className="record-card-label" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Mail size={12} /> Email:
                    </span>
                    <span className="record-card-value" style={{ maxWidth: '170px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {u.email || '—'}
                    </span>
                  </div>
                  <div className="record-card-row">
                    <span className="record-card-label" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Phone size={12} /> Phone:
                    </span>
                    <span className="record-card-value">{u.phone || '—'}</span>
                  </div>
                  <div className="record-card-row">
                    <span className="record-card-label" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Building2 size={12} /> Clinic:
                    </span>
                    <span className="record-card-value" style={{ maxWidth: '170px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {u.clinic_id?.name || 'Shared Core Clinic'}
                    </span>
                  </div>
                  {(u.qualification || u.registration_number) && (
                    <div className="record-card-row" style={{ borderTop: '1px dashed var(--color-border)', paddingTop: '6px', marginTop: '6px' }}>
                      <span className="record-card-label">Degree / Reg:</span>
                      <span className="record-card-value" style={{ fontSize: '11px' }}>
                        {[u.qualification, u.registration_number].filter(Boolean).join(' • ')}
                      </span>
                    </div>
                  )}
                </div>

                <div className="record-card-footer">
                  <span style={{ fontSize: '11px', color: 'var(--color-text-tertiary)' }}>Actions</span>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {canChangePassword && (
                      <button
                        className="icon-btn"
                        style={{ color: '#06b6d4' }}
                        onClick={() => handleOpenChangePassword(u)}
                        title="Change Staff Password"
                      >
                        <KeyRound size={15} />
                      </button>
                    )}
                    <button className="icon-btn" onClick={() => handleOpenEditModal(u)} title="Edit user">
                      <Edit2 size={15} />
                    </button>
                    <button className="icon-btn" style={{ color: 'var(--color-danger)' }} onClick={() => triggerSingleDelete(u._id)} title="Delete user">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '40px' }}>
                  <input type="checkbox" onChange={handleSelectAll} checked={selectedIds.length === users.length} />
                </th>
                <th>Full Name</th>
                <th>Email Address</th>
                <th>Phone Number</th>
                <th>Role</th>
                <th>Clinic Name</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id}>
                  <td>
                    <input type="checkbox" onChange={(e) => handleSelectOne(e, u._id)} checked={selectedIds.includes(u._id)} />
                  </td>
                  <td style={{ fontWeight: 'bold', color: 'var(--color-text-primary)' }}>{u.full_name}</td>
                  <td>{u.email}</td>
                  <td>{u.phone}</td>
                  <td>
                    <span className="badge badge-info" style={{ textTransform: 'capitalize' }}>
                      {u.role}
                    </span>
                  </td>
                  <td>{u.clinic_id?.name || 'Shared Core Clinic'}</td>
                  <td>
                    <button
                      onClick={() => handleToggleStatus(u._id, u.status)}
                      className={`btn ${u.status ? 'badge-success' : 'badge-danger'}`}
                      style={{ border: 'none', padding: '2px 6px', fontSize: '10px', borderRadius: '4px', cursor: 'pointer' }}
                    >
                      {u.status ? 'Active' : 'Suspended'}
                    </button>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {canChangePassword && (
                        <button
                          className="icon-btn"
                          style={{ color: '#06b6d4' }}
                          onClick={() => handleOpenChangePassword(u)}
                          title="Change Staff Password"
                        >
                          <KeyRound size={14} />
                        </button>
                      )}
                      <button className="icon-btn" onClick={() => handleOpenEditModal(u)} title="Edit user">
                        <Edit2 size={14} />
                      </button>
                      <button className="icon-btn" style={{ color: 'var(--color-danger)' }} onClick={() => triggerSingleDelete(u._id)} title="Delete user">
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px' }}>
          <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
            Showing page {currentPage} of {totalPages} ({total} records total)
          </span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              className="btn btn-secondary"
              style={{ padding: '4px 12px' }}
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            >
              Previous
            </button>
            <button
              className="btn btn-secondary"
              style={{ padding: '4px 12px' }}
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {changePasswordModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
          }}
          onClick={() => !passwordLoading && setChangePasswordModalOpen(false)}
        >
          <div
            className="card"
            style={{
              width: '100%',
              maxWidth: '440px',
              padding: '24px',
              backgroundColor: 'var(--color-bg-primary)',
              borderRadius: '12px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
              position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ 
                  width: '36px', 
                  height: '36px', 
                  borderRadius: '8px', 
                  backgroundColor: 'rgba(6, 182, 212, 0.15)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  color: '#06b6d4'
                }}>
                  <KeyRound size={18} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>Change Staff Password</h3>
                  <p style={{ margin: 0, fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                    For {targetStaff?.full_name} ({targetStaff?.role})
                  </p>
                </div>
              </div>
              <button
                className="icon-btn"
                onClick={() => !passwordLoading && setChangePasswordModalOpen(false)}
                disabled={passwordLoading}
              >
                <X size={18} />
              </button>
            </div>

            {passwordError && (
              <div className="badge badge-danger" style={{ display: 'block', width: '100%', padding: '8px 12px', borderRadius: '6px', marginBottom: '14px', fontSize: '12px' }}>
                {passwordError}
              </div>
            )}

            <form onSubmit={handleChangePasswordSubmit}>
              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label className="form-label" style={{ fontWeight: 600, fontSize: '13px' }}>
                  New Password *
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    className="input-field"
                    placeholder="Enter at least 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={6}
                    autoFocus
                    style={{ paddingRight: '36px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'var(--color-text-secondary)',
                      padding: 0,
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label className="form-label" style={{ fontWeight: 600, fontSize: '13px' }}>
                  Confirm Password *
                </label>
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  className="input-field"
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setChangePasswordModalOpen(false)}
                  disabled={passwordLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={passwordLoading}
                  style={{ minWidth: '120px' }}
                >
                  {passwordLoading ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
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
        title={isBulkDelete ? `Delete ${selectedIds.length} Users` : "Delete Staff User"}
        message={isBulkDelete ? `Are you sure you want to delete the ${selectedIds.length} selected user accounts?` : "Are you sure you want to delete this staff user profile?"}
        loading={deleteLoading}
      />
    </div>
  );
}
