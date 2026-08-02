import React, { useState, useEffect } from 'react';
import { templateAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import { 
  Layout, 
  PlusCircle, 
  Search, 
  Trash2, 
  Edit2, 
  Pill, 
  FlaskConical, 
  ClipboardCheck, 
  Plus, 
  X,
  ArrowLeft 
} from 'lucide-react';

export default function Templates() {
  const { user } = useAuth();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Category Tab state ("all" | "medicines" | "labs" | "consents")
  const [categoryTab, setCategoryTab] = useState('all');

  // Search filter
  const [search, setSearch] = useState('');

  // View Mode: 'list' | 'editor'
  const [viewMode, setViewMode] = useState('list');
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState(null);

  // Delete Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Form Fields
  const [name, setName] = useState('');
  const [type, setType] = useState('Medicines'); // Medicines | Lab Tests | Consents

  // Dynamic Medicines list for Prescription/Medicines templates
  const [medicines, setMedicines] = useState([]);
  const [medName, setMedName] = useState('');
  const [medQty, setMedQty] = useState(1);
  const [medFreq, setMedFreq] = useState('1-0-1');
  const [medDays, setMedDays] = useState(5);
  const [medInst, setMedInst] = useState('After meals');

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await templateAPI.getTemplates();
      if (res && res.data) {
        setTemplates(res.data);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch template forms database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAdd = () => {
    setIsEdit(false);
    setEditId(null);
    setName('');
    setType(categoryTab === 'all' ? 'Medicines' : categoryTab === 'medicines' ? 'Medicines' : categoryTab === 'labs' ? 'Lab Tests' : 'Consents');
    setMedicines([]);
    setMedName('');
    setError('');
    setViewMode('editor');
  };

  const handleOpenEdit = (t) => {
    setIsEdit(true);
    setEditId(t._id);
    setName(t.name || '');
    setType(t.type || 'Medicines');
    setMedicines(t.medicines || []);
    setError('');
    setViewMode('editor');
  };

  const handleAddMedicineItem = () => {
    if (!medName.trim()) return;
    setMedicines([
      ...medicines,
      {
        name: medName,
        quantity: Number(medQty),
        frequency: medFreq,
        no_of_days: Number(medDays),
        instruction: medInst
      }
    ]);
    setMedName('');
    setMedQty(1);
    setMedFreq('1-0-1');
    setMedDays(5);
    setMedInst('After meals');
  };

  const handleRemoveMedicineItem = (index) => {
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
      await templateAPI.deleteTemplate(deleteId);
      setSuccess('Template deleted successfully.');
      setDeleteModalOpen(false);
      setDeleteId(null);
      loadData();
    } catch (err) {
      setError('Failed to delete template.');
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
      type,
      doctor_id: user?._id || '6a55ce3df5878a83c6b4e275',
      clinic_id: user?.clinic_id || '6a55ce3cf5878a83c6b4e274',
      medicines: type === 'Medicines' || type === 'Prescription' ? medicines : []
    };

    try {
      if (isEdit) {
        await templateAPI.updateTemplate(editId, payload);
        setSuccess('Template updated successfully.');
      } else {
        await templateAPI.createTemplate(payload);
        setSuccess('Template created successfully.');
      }
      setViewMode('list');
      loadData();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Error occurred while saving template.');
    }
  };

  // Filter logic for category tabs and search bar
  const filtered = templates.filter((t) => {
    const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase());
    if (!matchesSearch) return false;

    if (categoryTab === 'all') return true;
    if (categoryTab === 'medicines') return t.type === 'Medicines' || t.type === 'Prescription';
    if (categoryTab === 'labs') return t.type === 'Lab Tests' || t.type === 'Lab';
    if (categoryTab === 'consents') return t.type === 'Consents' || t.type === 'Consent';
    return true;
  });

  // Render Full Page Screen Editor when in 'editor' viewMode
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
              <ArrowLeft size={16} /> Back to Templates List
            </button>
            <h1 className="page-title">{isEdit ? 'Edit Template Layout' : 'Create New Template'}</h1>
            <p className="page-subtitle">Configure standardized form layouts and prescription medicine templates</p>
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
              <label className="form-label" style={{ fontWeight: 'bold' }}>Template Name *</label>
              <input
                type="text"
                className="input-field"
                placeholder="e.g. Standard Dental Rx, Fit to work slip"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label className="form-label" style={{ fontWeight: 'bold' }}>Template Category *</label>
              <select className="input-field" value={type} onChange={(e) => setType(e.target.value)} required>
                <option value="Medicines">Medicines (Prescription)</option>
                <option value="Lab Tests">Lab Tests</option>
                <option value="Consents">Consents & Waivers</option>
              </select>
            </div>

            {(type === 'Medicines' || type === 'Prescription') && (
              <div style={{ marginTop: '20px', borderTop: '1px solid var(--color-border)', paddingTop: '16px', marginBottom: '20px' }}>
                <label className="form-label" style={{ fontWeight: 'bold', fontSize: '15px' }}>Template Medicines ({medicines.length})</label>

                {medicines.map((m, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--color-bg-secondary)', padding: '10px 14px', borderRadius: '8px', marginBottom: '8px', fontSize: '13px' }}>
                    <div>
                      <strong style={{ color: 'var(--color-primary)' }}>{m.name}</strong> - {m.quantity} Qty ({m.frequency}) for {m.no_of_days} days ({m.instruction})
                    </div>
                    <button type="button" className="icon-btn" style={{ color: 'var(--color-danger)' }} onClick={() => handleRemoveMedicineItem(idx)}>
                      <X size={16} />
                    </button>
                  </div>
                ))}

                <div style={{ backgroundColor: 'var(--color-bg-secondary)', padding: '16px', borderRadius: '12px', marginTop: '12px' }}>
                  <div className="form-group" style={{ marginBottom: '12px' }}>
                    <label className="form-label" style={{ fontSize: '12px' }}>Medicine Name</label>
                    <input type="text" className="input-field" placeholder="e.g. Paracetamol 650mg" value={medName} onChange={e => setMedName(e.target.value)} />
                  </div>
                  <div className="form-row" style={{ marginBottom: '12px' }}>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label className="form-label" style={{ fontSize: '12px' }}>Quantity</label>
                      <input type="number" className="input-field" value={medQty} onChange={e => setMedQty(e.target.value)} min={1} />
                    </div>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label className="form-label" style={{ fontSize: '12px' }}>Frequency</label>
                      <input type="text" className="input-field" value={medFreq} onChange={e => setMedFreq(e.target.value)} />
                    </div>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label className="form-label" style={{ fontSize: '12px' }}>Days</label>
                      <input type="number" className="input-field" value={medDays} onChange={e => setMedDays(e.target.value)} min={1} />
                    </div>
                  </div>
                  <button type="button" className="btn btn-secondary" onClick={handleAddMedicineItem} style={{ width: '100%', fontSize: '13px' }}>
                    <Plus size={14} /> Add Item To Template
                  </button>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setViewMode('list')}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                {isEdit ? 'Save Changes' : 'Create Template'}
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
          <h1 className="page-title">Templates</h1>
          <p className="page-subtitle">Pre-configured templates for faster prescription generation and forms</p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenAdd}>
          <PlusCircle size={14} /> Add Template
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

      {/* Category Tabs */}
      <div style={{ 
        display: 'flex', 
        gap: '24px', 
        borderBottom: '2px solid var(--color-border)', 
        marginBottom: '20px',
        paddingBottom: '8px'
      }}>
        {[
          { id: 'all', label: 'All' },
          { id: 'medicines', label: 'Medicines' },
          { id: 'labs', label: 'Lab Tests' },
          { id: 'consents', label: 'Consents' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setCategoryTab(tab.id)}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '15px',
              fontWeight: categoryTab === tab.id ? '700' : '500',
              color: categoryTab === tab.id ? 'var(--color-primary)' : 'var(--color-text-secondary)',
              cursor: 'pointer',
              position: 'relative',
              paddingBottom: '8px'
            }}
          >
            {tab.label}
            {categoryTab === tab.id && (
              <div style={{
                position: 'absolute',
                bottom: '-10px',
                left: 0,
                right: 0,
                height: '3px',
                backgroundColor: 'var(--color-primary)',
                borderRadius: '2px'
              }} />
            )}
          </button>
        ))}
      </div>

      {/* Search Bar */}
      <div className="card" style={{ padding: '12px 16px', marginBottom: '20px', display: 'flex', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: '320px' }}>
          <input
            type="text"
            className="input-field"
            placeholder="Search templates..."
            style={{ paddingLeft: '32px' }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Search size={14} style={{ position: 'absolute', left: '10px', top: '12px', color: 'var(--color-text-tertiary)' }} />
        </div>
      </div>

      {/* Grid view of Template Cards */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-tertiary)' }}>Loading templates...</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-tertiary)' }}>No templates found in this category.</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
          {filtered.map((t) => (
            <div 
              key={t._id} 
              className="card"
              style={{ 
                padding: '16px 20px', 
                borderRadius: 'var(--radius-lg)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                border: '1px solid var(--color-border)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ 
                  width: '48px', 
                  height: '48px', 
                  borderRadius: '12px', 
                  backgroundColor: 'var(--color-primary-light)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  color: 'var(--color-primary)'
                }}>
                  {t.type === 'Lab Tests' || t.type === 'Lab' ? (
                    <FlaskConical size={22} />
                  ) : t.type === 'Consents' || t.type === 'Consent' ? (
                    <ClipboardCheck size={22} />
                  ) : (
                    <Pill size={22} />
                  )}
                </div>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 'bold', margin: 0, color: 'var(--color-text-primary)' }}>{t.name}</h3>
                  <span style={{ fontSize: '13px', color: 'var(--color-text-tertiary)', marginTop: '4px', display: 'block' }}>
                    {t.type === 'Medicines' || t.type === 'Prescription'
                      ? `Medicines: ${t.medicines?.length || 0}`
                      : `Category: ${t.type}`}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="icon-btn" onClick={() => handleOpenEdit(t)} title="Edit template">
                  <Edit2 size={16} />
                </button>
                <button className="icon-btn" style={{ color: 'var(--color-danger)' }} onClick={() => triggerDelete(t._id)} title="Delete template">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
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
        title="Delete Template Layout"
        message="Are you sure you want to delete this template? Any saved pre-configurations in this layout will be permanently removed."
        loading={deleteLoading}
      />
    </div>
  );
}
