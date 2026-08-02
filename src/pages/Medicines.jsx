import React, { useState, useEffect } from 'react';
import { medicineAPI } from '../services/api';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import { Pill, PlusCircle, Search, Trash2, Edit2, ArrowLeft } from 'lucide-react';

export default function Medicines() {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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
        <button className="btn btn-primary" onClick={handleOpenAdd}>
          <PlusCircle size={14} /> Add Medicine
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
            placeholder="Search by medicine name..."
            style={{ paddingLeft: '32px' }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Search size={14} style={{ position: 'absolute', left: '10px', top: '12px', color: 'var(--color-text-tertiary)' }} />
        </div>
      </div>

      <div className="table-responsive">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-tertiary)' }}>Loading medicines catalogue...</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-tertiary)' }}>No medicines registered.</div>
        ) : (
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
        title="Delete Medicine Item"
        message="Are you sure you want to delete this medicine listing from the catalogue?"
        loading={deleteLoading}
      />
    </div>
  );
}
