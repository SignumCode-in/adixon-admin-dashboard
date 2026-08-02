import React, { useState, useEffect } from 'react';
import { instructionAPI, patientAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import { FileText, PlusCircle, Search, Trash2, Edit2, User, ArrowLeft } from 'lucide-react';

export default function Instructions() {
  const { user } = useAuth();
  const [instructions, setInstructions] = useState([]);
  const [patients, setPatients] = useState([]);
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
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [instrRes, patientsRes] = await Promise.all([
        instructionAPI.getInstructions(),
        patientAPI.getPatients(),
      ]);

      if (instrRes && instrRes.data) setInstructions(instrRes.data);
      if (patientsRes && patientsRes.data) {
        setPatients(patientsRes.data);
        if (patientsRes.data.length > 0) setSelectedPatientId(patientsRes.data[0]._id);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch patient instructions catalogue.');
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
    setTitle('');
    setDescription('');
    setError('');
    setViewMode('editor');
  };

  const handleOpenEdit = (inst) => {
    setIsEdit(true);
    setEditId(inst._id);
    setSelectedPatientId(inst.patient_id?._id || selectedPatientId);
    setTitle(inst.title || '');
    setDescription(inst.description || '');
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
      await instructionAPI.deleteInstruction(deleteId);
      setSuccess('Instruction entry deleted.');
      setDeleteModalOpen(false);
      setDeleteId(null);
      loadData();
    } catch (err) {
      setError('Failed to delete instruction record.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const payload = {
      patient_id: selectedPatientId,
      doctor_id: user?._id || '6a55ce3df5878a83c6b4e275',
      clinic_id: user?.clinic_id || '6a55ce3cf5878a83c6b4e274',
      title,
      description,
    };

    try {
      if (isEdit) {
        await instructionAPI.updateInstruction(editId, payload);
        setSuccess('Instruction modified successfully.');
      } else {
        await instructionAPI.createInstruction(payload);
        setSuccess('Instruction recorded successfully.');
      }
      setViewMode('list');
      loadData();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Error occurred while saving clinical instruction.');
    }
  };

  const filtered = instructions.filter((i) =>
    i.title?.toLowerCase().includes(search.toLowerCase()) ||
    i.patient_id?.full_name?.toLowerCase().includes(search.toLowerCase())
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
              <ArrowLeft size={16} /> Back to Instructions List
            </button>
            <h1 className="page-title">{isEdit ? 'Edit Recovery Guide' : 'Add Clinical Recovery Instruction'}</h1>
            <p className="page-subtitle">Configure patient diet advice, post-surgery recovery steps, and guidelines</p>
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
              <label className="form-label" style={{ fontWeight: 'bold' }}>Patient Profile *</label>
              <select className="input-field" value={selectedPatientId} onChange={(e) => setSelectedPatientId(e.target.value)} required disabled={isEdit}>
                {patients.map((p) => (
                  <option key={p._id} value={p._id}>{p.full_name}</option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label className="form-label" style={{ fontWeight: 'bold' }}>Instruction Title *</label>
              <input
                type="text"
                className="input-field"
                placeholder="e.g. Post Extraction Care, Soft Diet Guide"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: '24px' }}>
              <label className="form-label" style={{ fontWeight: 'bold' }}>Detailed Guidelines *</label>
              <textarea
                className="input-field"
                style={{ height: '120px', fontFamily: 'inherit', resize: 'none' }}
                placeholder="e.g. Avoid hot drinks for 24 hours, apply ice pack for swelling..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setViewMode('list')}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={patients.length === 0}>
                {isEdit ? 'Save Changes' : 'Record Guide'}
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
          <h1 className="page-title">Dietary & Recovery Instructions</h1>
          <p className="page-subtitle">Manage recovery guidelines, prescription intake routines, and consult tips</p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenAdd}>
          <PlusCircle size={14} /> Add Instruction
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
            placeholder="Search by patient name or title..."
            style={{ paddingLeft: '32px' }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Search size={14} style={{ position: 'absolute', left: '10px', top: '12px', color: 'var(--color-text-tertiary)' }} />
        </div>
      </div>

      <div className="table-responsive">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-tertiary)' }}>Loading instructions catalogue...</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-tertiary)' }}>No patient instructions logged.</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Instruction Title</th>
                <th>Description Guide</th>
                <th>Doctor</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((inst) => (
                <tr key={inst._id}>
                  <td style={{ fontWeight: 'bold' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <User size={16} color="var(--color-primary)" />
                      {inst.patient_id?.full_name || 'Walk-in'}
                    </span>
                  </td>
                  <td>{inst.title}</td>
                  <td style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>{inst.description}</td>
                  <td>{inst.doctor_id?.full_name || 'Clinic Doctor'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button className="icon-btn" onClick={() => handleOpenEdit(inst)} title="Edit guide">
                        <Edit2 size={14} />
                      </button>
                      <button className="icon-btn" style={{ color: 'var(--color-danger)' }} onClick={() => triggerDelete(inst._id)}>
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
        title="Delete Instruction Guide"
        message="Are you sure you want to delete this recovery instruction record?"
        loading={deleteLoading}
      />
    </div>
  );
}
