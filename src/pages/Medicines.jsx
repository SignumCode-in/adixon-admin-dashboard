import React, { useState, useEffect } from 'react';
import { medicineAPI } from '../services/api';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import ExcelUploadModal from '../components/ExcelUploadModal';
import { Pill, PlusCircle, Search, Trash2, Edit2, ArrowLeft, FileSpreadsheet, Globe, X, Sparkles, Clock, CheckCircle2 } from 'lucide-react';
import ViewToggle from '../components/common/ViewToggle';


export default function Medicines() {
  const [medicines, setMedicines] = useState([]);
  const [displayMode, setDisplayMode] = useState(() => localStorage.getItem('adixon_view_mode_medicines') || 'list');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Global Medicine Modal State (Only Name Allowed)
  const [globalModalOpen, setGlobalModalOpen] = useState(false);
  const [globalName, setGlobalName] = useState('');
  const [globalLoading, setGlobalLoading] = useState(false);
  const [globalError, setGlobalError] = useState('');

  // Search
  const [search, setSearch] = useState('');

  // View Mode: 'list' | 'editor'
  const [viewMode, setViewMode] = useState('list');
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState(null);

  // Delete Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Upload Excel Modal State
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  // Form Fields
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [frequency, setFrequency] = useState('1-0-1');
  const [route, setRoute] = useState('Oral');
  const [noOfDays, setNoOfDays] = useState(5);
  const [instruction, setInstruction] = useState('After Meals');
  const [comments, setComments] = useState('');

  const loadMedicines = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await medicineAPI.getMedicines();
      if (res && res.data) {
        setMedicines(res.data);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch medicine listings from database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMedicines();
  }, []);

  const handleOpenAdd = () => {
    setIsEdit(false);
    setEditId(null);
    setName('');
    setQuantity(1);
    setFrequency('1-0-1');
    setRoute('Oral');
    setNoOfDays(5);
    setInstruction('After Meals');
    setComments('');
    setError('');
    setViewMode('editor');
  };

  const handleOpenEdit = (m) => {
    setIsEdit(true);
    setEditId(m._id);
    setName(m.name || '');
    setQuantity(m.quantity || 1);
    setFrequency(m.frequency || '1-0-1');
    setRoute(m.route || 'Oral');
    setNoOfDays(m.no_of_days || 5);
    setInstruction(m.instruction || 'After Meals');
    setComments(m.additional_comments || '');
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
      await medicineAPI.deleteMedicine(deleteId);
      setSuccess('Medicine deleted successfully.');
      setDeleteModalOpen(false);
      setDeleteId(null);
      loadMedicines();
    } catch (err) {
      setError('Failed to delete medicine item.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleAddGlobalMedicine = async (e) => {
    e.preventDefault();
    if (!globalName.trim()) {
      setGlobalError('Please enter a valid medicine name.');
      return;
    }
    setGlobalLoading(true);
    setGlobalError('');
    try {
      await medicineAPI.createMedicine({ name: globalName.trim() });
      setSuccess(`"${globalName.trim()}" has been added to global medicine catalogue.`);
      setGlobalName('');
      setGlobalModalOpen(false);
      loadMedicines();
    } catch (err) {
      console.error(err);
      setGlobalError(err.response?.data?.message || 'Failed to add global medicine.');
    } finally {
      setGlobalLoading(false);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const payload = {
      name,
      quantity: Number(quantity),
      frequency,
      route,
      no_of_days: Number(noOfDays),
      instruction,
      additional_comments: comments,
    };

    try {
      if (isEdit) {
        await medicineAPI.updateMedicine(editId, payload);
        setSuccess('Medicine details updated successfully.');
      } else {
        await medicineAPI.createMedicine(payload);
        setSuccess('Medicine registered successfully.');
      }
      setViewMode('list');
      loadMedicines();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Error occurred while saving medicine details.');
    }
  };

  const filtered = medicines.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase())
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
              <ArrowLeft size={16} /> Back to Catalogue
            </button>
            <h1 className="page-title">{isEdit ? 'Edit Medication Entry' : 'Add New Medication Item'}</h1>
            <p className="page-subtitle">Configure dosage frequencies, stock quantities, and intake instructions</p>
          </div>
        </div>

        <div className="card" style={{ width: '100%', padding: '24px', borderRadius: '16px' }}>
          {error && (
            <div className="badge badge-danger" style={{ display: 'block', width: '100%', padding: '12px', borderRadius: '8px', marginBottom: '20px' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleFormSubmit}>
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label className="form-label" style={{ fontWeight: 'bold' }}>Medicine Name *</label>
              <input
                type="text"
                className="input-field"
                placeholder="e.g. Paracetamol 650mg"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-row" style={{ marginBottom: '16px' }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label" style={{ fontWeight: 'bold' }}>Stock Quantity *</label>
                <input
                  type="number"
                  className="input-field"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  required
                  min={1}
                />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label" style={{ fontWeight: 'bold' }}>No. of Days *</label>
                <input
                  type="number"
                  className="input-field"
                  value={noOfDays}
                  onChange={(e) => setNoOfDays(e.target.value)}
                  required
                  min={1}
                />
              </div>
            </div>

            <div className="form-row" style={{ marginBottom: '16px' }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label" style={{ fontWeight: 'bold' }}>Frequency Pattern *</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. 1-0-1, 1-1-1"
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value)}
                  required
                />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label" style={{ fontWeight: 'bold' }}>Intake Route</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Oral, Intravenous, Topical"
                  value={route}
                  onChange={(e) => setRoute(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label className="form-label" style={{ fontWeight: 'bold' }}>Special Intake Instruction</label>
              <input
                type="text"
                className="input-field"
                placeholder="After meals, Before sleep"
                value={instruction}
                onChange={(e) => setInstruction(e.target.value)}
              />
            </div>

            <div className="form-group" style={{ marginBottom: '24px' }}>
              <label className="form-label" style={{ fontWeight: 'bold' }}>Additional Clinical Comments</label>
              <input
                type="text"
                className="input-field"
                placeholder="Avoid cold beverages..."
                value={comments}
                onChange={(e) => setComments(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setViewMode('list')}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                {isEdit ? 'Save Changes' : 'Register Medicine'}
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
          <h1 className="page-title">Medication Catalogue</h1>
          <p className="page-subtitle">Manage clinical prescriptions stocks, dosage frequencies, and intake instructions</p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button 
            className="btn btn-primary" 
            onClick={() => {
              setGlobalName('');
              setGlobalError('');
              setGlobalModalOpen(true);
            }} 
            style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '6px',
              background: 'linear-gradient(135deg, #4f46e5, #06b6d4)',
              border: 'none',
              color: '#fff',
              boxShadow: '0 2px 8px rgba(79, 70, 229, 0.3)'
            }}
            id="btn-add-global-medicine"
          >
            <Globe size={15} /> Add Global Medicine
          </button>
          <button className="btn btn-secondary" onClick={() => setUploadModalOpen(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <FileSpreadsheet size={16} /> Import Excel
          </button>
          <button className="btn btn-secondary" onClick={handleOpenAdd} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <PlusCircle size={14} /> Full Entry
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

      <div className="card" style={{ padding: '12px 16px', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: '320px' }}>
          <input
            type="text"
            className="input-field"
            placeholder="Search by medicine name..."
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
            localStorage.setItem('adixon_view_mode_medicines', m);
          }} 
        />
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-tertiary)' }}>Loading medicines catalogue...</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-tertiary)' }}>No medicines registered.</div>
      ) : displayMode === 'grid' ? (
        <div className="records-grid">
          {filtered.map((m) => (
            <div key={m._id} className="record-card">
              <div className="record-card-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'var(--color-primary-light)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                    <Pill size={18} />
                  </div>
                  <div>
                    <div style={{ fontWeight: '600', fontSize: '14px', color: 'var(--color-text-primary)' }}>
                      {m.name}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--color-text-tertiary)' }}>
                      {m.route || 'Oral'} • {m.quantity} Units
                    </div>
                  </div>
                </div>
                <span className="badge badge-info" style={{ fontSize: '11px' }}>
                  {m.frequency}
                </span>
              </div>

              <div className="record-card-body">
                <div className="record-card-row">
                  <Clock size={13} style={{ color: 'var(--color-warning)', flexShrink: 0 }} />
                  <span>Duration: <strong>{m.no_of_days} Days</strong></span>
                </div>
                {m.instruction && (
                  <div className="record-card-row">
                    <CheckCircle2 size={13} style={{ color: 'var(--color-success)', flexShrink: 0 }} />
                    <span>Instruction: {m.instruction}</span>
                  </div>
                )}
                {m.additional_comments && (
                  <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', background: 'var(--color-bg-secondary)', padding: '6px 8px', borderRadius: '6px', marginTop: '4px' }}>
                    💬 {m.additional_comments}
                  </div>
                )}
              </div>

              <div className="record-card-footer">
                <span style={{ fontSize: '11px', color: 'var(--color-text-tertiary)' }}>
                  Qty: {m.quantity}
                </span>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '11px', gap: '4px' }} onClick={() => handleOpenEdit(m)}>
                    <Edit2 size={12} /> Edit
                  </button>
                  <button className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '11px', gap: '4px', color: 'var(--color-danger)' }} onClick={() => triggerDelete(m._id)}>
                    <Trash2 size={12} /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Medicine Name</th>
                <th>Quantity</th>
                <th>Frequency</th>
                <th>Route</th>
                <th>No. of Days</th>
                <th>Intake Instruction</th>
                <th>Comments</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((m) => (
                <tr key={m._id}>
                  <td style={{ fontWeight: 'bold' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Pill size={16} color="var(--color-primary)" />
                      {m.name}
                    </span>
                  </td>
                  <td>{m.quantity} Units</td>
                  <td>
                    <span className="badge badge-info">{m.frequency}</span>
                  </td>
                  <td>{m.route || 'N/A'}</td>
                  <td>{m.no_of_days} Days</td>
                  <td>{m.instruction || 'None'}</td>
                  <td style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>{m.additional_comments || '-'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button className="icon-btn" onClick={() => handleOpenEdit(m)} title="Edit medicine">
                        <Edit2 size={14} />
                      </button>
                      <button className="icon-btn" style={{ color: 'var(--color-danger)' }} onClick={() => triggerDelete(m._id)} title="Delete medicine">
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

      {/* Delete Confirmation Popup Dialog Modal */}
      <ConfirmDeleteModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setDeleteId(null);
        }}
        onConfirm={confirmDelete}
        title="Delete Medicine Item"
        message="Are you sure you want to delete this medicine listing from the catalogue?"
        loading={deleteLoading}
      />

      {/* Excel Upload Modal */}
      <ExcelUploadModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onSuccess={(msg) => {
          setSuccess(msg);
          loadMedicines();
        }}
      />

      {/* Global Medicine Modal - ONLY Name Field Allowed */}
      {globalModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1050,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(4px)',
            padding: '16px'
          }}
          onClick={() => !globalLoading && setGlobalModalOpen(false)}
        >
          <div
            style={{
              background: 'var(--color-surface, #1e293b)',
              color: 'var(--color-text, #f8fafc)',
              borderRadius: '16px',
              width: '100%',
              maxWidth: '480px',
              border: '1px solid var(--color-border, #334155)',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5)',
              overflow: 'hidden',
              animation: 'scaleIn 0.15s ease-out'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '18px 22px',
                borderBottom: '1px solid var(--color-border, #334155)',
                background: 'rgba(255, 255, 255, 0.02)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.2), rgba(6, 182, 212, 0.2))',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#38bdf8'
                  }}
                >
                  <Globe size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>Add Global Medicine</h3>
                  <span style={{ fontSize: '12px', color: 'var(--color-text-secondary, #94a3b8)' }}>
                    Add to master directory (Only Name Allowed)
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setGlobalModalOpen(false)}
                disabled={globalLoading}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--color-text-secondary, #94a3b8)',
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '6px'
                }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddGlobalMedicine} style={{ padding: '22px' }}>
              {globalError && (
                <div
                  style={{
                    background: 'rgba(239, 68, 68, 0.15)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    color: '#f87171',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    marginBottom: '16px'
                  }}
                >
                  {globalError}
                </div>
              )}

              <div style={{ marginBottom: '18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text, #f8fafc)' }}>
                    Medicine Name <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <span
                    style={{
                      fontSize: '11px',
                      padding: '2px 8px',
                      borderRadius: '9999px',
                      background: 'rgba(99, 102, 241, 0.15)',
                      color: '#818cf8',
                      border: '1px solid rgba(99, 102, 241, 0.3)',
                      fontWeight: 500
                    }}
                  >
                    Only field allowed
                  </span>
                </div>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. Paracetamol 650mg, Amoxicillin 500mg, Cetirizine 10mg"
                  value={globalName}
                  onChange={(e) => setGlobalName(e.target.value)}
                  autoFocus
                  disabled={globalLoading}
                  required
                  id="input-global-medicine-name"
                  style={{
                    width: '100%',
                    fontSize: '14px',
                    padding: '10px 14px',
                    borderRadius: '8px'
                  }}
                />
                <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: 'var(--color-text-secondary, #94a3b8)', lineHeight: 1.4 }}>
                  Only the medicine name is stored in the global catalogue. Dosage, frequency, and custom instructions are configured during patient prescriptions.
                </p>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setGlobalModalOpen(false)}
                  disabled={globalLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={globalLoading || !globalName.trim()}
                  id="btn-submit-global-medicine"
                  style={{
                    background: 'linear-gradient(135deg, #4f46e5, #06b6d4)',
                    border: 'none',
                    minWidth: '140px',
                    justifyContent: 'center'
                  }}
                >
                  {globalLoading ? 'Adding...' : 'Add Medicine'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
