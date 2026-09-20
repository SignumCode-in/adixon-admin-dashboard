import React, { useState, useEffect } from 'react';
import { templateAPI, medicineAPI, labAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useActiveClinicScope } from '../hooks/useActiveClinicScope';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import ViewToggle from '../components/common/ViewToggle';
import { 
  Layout, 
  PlusCircle, 
  Search, 
  Trash2, 
  Edit2, 
  Pill, 
  FlaskConical, 
  ClipboardCheck, 
  FileText,
  Award,
  Plus, 
  X,
  ArrowLeft,
  Sparkles
} from 'lucide-react';

export default function Templates() {
  const { user } = useAuth();
  const activeClinicId = useActiveClinicScope();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Category Tab state ("all" | "medicines" | "labs" | "consents" | "instructions" | "certificates")
  const [categoryTab, setCategoryTab] = useState('all');

  // Search filter
  const [search, setSearch] = useState('');

  // Display Mode: 'list' | 'grid'
  const [displayMode, setDisplayMode] = useState(() => localStorage.getItem('adixon_view_mode_templates') || 'grid');

  const handleDisplayModeChange = (mode) => {
    setDisplayMode(mode);
    localStorage.setItem('adixon_view_mode_templates', mode);
  };

  // View Mode: 'list' | 'editor'
  const [viewMode, setViewMode] = useState('list');
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState(null);

  // Delete Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Master Data for Auto-Suggestions & Presets
  const [masterMedicines, setMasterMedicines] = useState([]);
  const [masterLabs, setMasterLabs] = useState([]);
  const [masterRoutes, setMasterRoutes] = useState(['Oral', 'Tablet', 'Capsule', 'Syrup', 'Injection', 'Topical', 'Drops', 'Inhaler', 'Ointment']);
  const [masterFrequencies, setMasterFrequencies] = useState(['1-0-1', '1-0-0', '0-0-1', '1-1-1', '1-0-1-1', '0-1-0', 'SOS', 'Once Weekly']);
  const [masterInstructions, setMasterInstructions] = useState(['After Food', 'Before Food', 'With Water', 'At Bedtime', 'Empty Stomach', 'With Milk']);

  // Form Fields
  const [name, setName] = useState('');
  const [type, setType] = useState('Medicines'); // Medicines | Lab Tests | Consents | Instructions | Certificates
  const [content, setContent] = useState('');
  const [duration, setDuration] = useState('');
  const [remarks, setRemarks] = useState('');

  // Dynamic Medicines list for Prescription/Medicines templates
  const [medicines, setMedicines] = useState([]);
  const [currentMed, setCurrentMed] = useState({ name: '', quantity: 1, route: 'Oral', frequency: '1-0-1', no_of_days: 5, instruction: 'After Food', additional_comments: '' });
  const [editingMedIndex, setEditingMedIndex] = useState(null);
  const [showMedSuggestions, setShowMedSuggestions] = useState(false);

  // Dynamic Lab Tests list for Lab templates
  const [labs, setLabs] = useState([]);
  const [currentLabInput, setCurrentLabInput] = useState('');
  const [showLabSuggestions, setShowLabSuggestions] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const targetClinicId = activeClinicId || user?.clinic_id?._id || user?.clinic_id;
      const params = targetClinicId ? { clinic_id: targetClinicId } : {};
      const [tempsRes, medsRes, labsRes, optsRes] = await Promise.allSettled([
        templateAPI.getTemplates(params),
        medicineAPI.getMedicines({ ...params, limit: 1000 }),
        labAPI.getLabs({ limit: 1000 }),
        medicineAPI.getMedicineOptions(),
      ]);

      if (tempsRes.status === 'fulfilled' && tempsRes.value?.data) setTemplates(tempsRes.value.data);
      if (medsRes.status === 'fulfilled') setMasterMedicines(medsRes.value?.data?.data || medsRes.value?.data || []);
      if (labsRes.status === 'fulfilled') setMasterLabs(labsRes.value?.data?.data || labsRes.value?.data || []);
      if (optsRes.status === 'fulfilled' && optsRes.value?.data) {
        if (optsRes.value.data.routes) setMasterRoutes(optsRes.value.data.routes);
        if (optsRes.value.data.frequencies) setMasterFrequencies(optsRes.value.data.frequencies);
        if (optsRes.value.data.instructions) setMasterInstructions(optsRes.value.data.instructions);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch template database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeClinicId]);

  const handleOpenAdd = () => {
    setIsEdit(false);
    setEditId(null);
    setName('');
    const targetType = categoryTab === 'labs' ? 'Lab Tests' 
      : categoryTab === 'consents' ? 'Consents'
      : categoryTab === 'instructions' ? 'Instructions'
      : categoryTab === 'certificates' ? 'Certificates'
      : 'Medicines';
    setType(targetType);
    setContent('');
    setDuration('');
    setRemarks('');
    setMedicines([]);
    setLabs([]);
    setCurrentMed({ name: '', quantity: 1, route: 'Oral', frequency: '1-0-1', no_of_days: 5, instruction: 'After Food', additional_comments: '' });
    setEditingMedIndex(null);
    setCurrentLabInput('');
    setError('');
    setViewMode('editor');
  };

  const handleOpenEdit = (t) => {
    setIsEdit(true);
    setEditId(t._id);
    setName(t.name || '');
    const normType = (t.type === 'medicine' || t.type === 'Medicines' || t.type === 'Prescription') ? 'Medicines'
      : (t.type === 'labTest' || t.type === 'Lab Tests' || t.type === 'Lab' || t.type === 'labs') ? 'Lab Tests'
      : (t.type === 'consent' || t.type === 'Consents') ? 'Consents'
      : (t.type === 'instruction' || t.type === 'Instructions') ? 'Instructions'
      : (t.type === 'certificate' || t.type === 'Certificates') ? 'Certificates'
      : t.type || 'Medicines';
    setType(normType);
    setContent(t.content || '');
    setDuration(t.duration || '');
    setRemarks(t.remarks || '');
    setMedicines((t.medicines || []).map(m => ({
      name: m.name || '',
      quantity: m.quantity || 1,
      route: m.route || 'Oral',
      frequency: m.frequency || '1-0-1',
      no_of_days: m.no_of_days || 5,
      instruction: m.instruction || 'After Food',
      additional_comments: m.additional_comments || '',
    })));
    setLabs(t.labs || []);
    setCurrentMed({ name: '', quantity: 1, route: 'Oral', frequency: '1-0-1', no_of_days: 5, instruction: 'After Food', additional_comments: '' });
    setEditingMedIndex(null);
    setCurrentLabInput('');
    setError('');
    setViewMode('editor');
  };

  const handleAddOrUpdateMedicine = () => {
    if (!currentMed.name || !currentMed.name.trim()) return;
    if (editingMedIndex !== null) {
      const updated = [...medicines];
      updated[editingMedIndex] = currentMed;
      setMedicines(updated);
      setEditingMedIndex(null);
    } else {
      setMedicines([...medicines.filter(m => m.name.trim() !== ''), currentMed]);
    }
    setCurrentMed({ name: '', quantity: 1, route: 'Oral', frequency: '1-0-1', no_of_days: 5, instruction: 'After Food', additional_comments: '' });
    setShowMedSuggestions(false);
  };

  const handleEditMedicine = (index) => {
    setEditingMedIndex(index);
    setCurrentMed(medicines[index]);
  };

  const handleRemoveMedicineRow = (index) => {
    setMedicines(medicines.filter((_, i) => i !== index));
    if (editingMedIndex === index) {
      setEditingMedIndex(null);
      setCurrentMed({ name: '', quantity: 1, route: 'Oral', frequency: '1-0-1', no_of_days: 5, instruction: 'After Food', additional_comments: '' });
    }
  };

  const handleAddLabTest = (testName) => {
    const val = (testName || currentLabInput).trim();
    if (!val) return;
    if (!labs.includes(val)) {
      setLabs([...labs, val]);
    }
    setCurrentLabInput('');
    setShowLabSuggestions(false);
  };

  const handleRemoveLabTest = (index) => {
    setLabs(labs.filter((_, i) => i !== index));
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

    if (type === 'Medicines' && medicines.length === 0) {
      setError('Please add at least one medicine to the template.');
      return;
    }

    if (type === 'Lab Tests' && labs.length === 0) {
      setError('Please add at least one lab test to the template.');
      return;
    }

    const targetClinicId = activeClinicId || user?.clinic_id?._id || user?.clinic_id;

    // Map display type to standard canonical backend/app type
    const canonicalType = type === 'Medicines' ? 'medicine'
      : type === 'Lab Tests' ? 'labTest'
      : type === 'Consents' ? 'consent'
      : type === 'Instructions' ? 'instruction'
      : type === 'Certificates' ? 'certificate'
      : type;

    const payload = {
      name,
      type: canonicalType,
      doctor_id: user?._id,
      clinic_id: targetClinicId,
      content: ['Consents', 'Instructions', 'Certificates', 'consent', 'instruction', 'certificate'].includes(type) ? content : null,
      duration: (type === 'Certificates' || type === 'certificate') ? duration : null,
      remarks: (type === 'Certificates' || type === 'certificate') ? remarks : null,
      medicines: (type === 'Medicines' || type === 'medicine')
        ? medicines.filter(m => m.name && m.name.trim() !== '').map(m => ({
            name: m.name,
            quantity: Number(m.quantity) || 1,
            route: m.route || 'Oral',
            frequency: m.frequency || '1-0-1',
            no_of_days: Number(m.no_of_days) || 5,
            instruction: m.instruction || 'After Food',
            additional_comments: m.additional_comments || '',
          }))
        : [],
      labs: (type === 'Lab Tests' || type === 'labTest') ? labs.filter(l => typeof l === 'string' && l.trim() !== '') : [],
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
    const matchesSearch = (t.name || '').toLowerCase().includes(search.toLowerCase());
    if (!matchesSearch) return false;

    const tType = (t.type || '').toLowerCase();

    if (categoryTab === 'all') return true;
    if (categoryTab === 'medicines') return tType === 'medicine' || tType.includes('medicine') || tType.includes('prescription');
    if (categoryTab === 'labs') return tType === 'labtest' || tType.includes('lab');
    if (categoryTab === 'consents') return tType === 'consent' || tType.includes('consent');
    if (categoryTab === 'instructions') return tType === 'instruction' || tType.includes('instruction');
    if (categoryTab === 'certificates') return tType === 'certificate' || tType.includes('certificate');
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
            <h1 className="page-title">{isEdit ? `Edit ${type} Template` : `Create ${type} Template`}</h1>
            <p className="page-subtitle">Configure standardized form layouts and medical pre-sets</p>
          </div>
        </div>

        <div className="card" style={{ width: '100%', padding: '24px', borderRadius: '16px' }}>
          {error && (
            <div className="badge badge-danger" style={{ display: 'block', width: '100%', padding: '12px', borderRadius: '8px', marginBottom: '20px' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleFormSubmit}>
            <div className="form-row" style={{ marginBottom: '20px' }}>
              <div className="form-group" style={{ flex: 2 }}>
                <label className="form-label" style={{ fontWeight: 'bold' }}>Template Title *</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="e.g. Tooth Extraction Consent, Viral Fever Rx, Medical Leave"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    style={{ flex: 1 }}
                  />
                  {type === 'Certificates' && (
                    <select
                      className="input-field"
                      style={{ maxWidth: '180px' }}
                      onChange={(e) => {
                        if (e.target.value !== 'Other') setName(e.target.value);
                      }}
                    >
                      <option value="">Quick Title...</option>
                      <option value="Medical Leave">Medical Leave</option>
                      <option value="Fitness Certificate">Fitness Certificate</option>
                      <option value="Medical Fitness">Medical Fitness</option>
                      <option value="Referral Certificate">Referral Certificate</option>
                      <option value="Sick Leave">Sick Leave</option>
                      <option value="Return To Work">Return To Work</option>
                      <option value="General">General</option>
                    </select>
                  )}
                </div>
              </div>

              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label" style={{ fontWeight: 'bold' }}>Template Type *</label>
                <select className="input-field" value={type} onChange={(e) => setType(e.target.value)} required>
                  <option value="Medicines">Medicines (Prescription)</option>
                  <option value="Lab Tests">Lab Tests</option>
                  <option value="Consents">Consents & Waivers</option>
                  <option value="Instructions">Patient Instructions</option>
                  <option value="Certificates">Medical Certificates</option>
                </select>
              </div>
            </div>

            {/* CONDITIONAL SECTION: MEDICINES */}
            {type === 'Medicines' && (
              <div style={{ marginTop: '20px', borderTop: '1px solid var(--color-border)', paddingTop: '16px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--color-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Pill size={16} /> Prescribed Medicines ({medicines.length})
                  </h4>
                </div>

                {medicines.length > 0 ? (
                  <div style={{ marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {medicines.map((med, idx) => (
                      <div key={idx} style={{ background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '10px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontWeight: 'bold', fontSize: '13px', color: 'var(--color-text-primary)' }}>
                            {med.name} <span className="badge badge-info">{med.route || 'Oral'}</span>
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                            Qty: <strong>{med.quantity || 1} Units</strong> | Frequency: <strong>{med.frequency || '1-0-1'}</strong> | Duration: <strong>{med.no_of_days} Days</strong> | Instruction: <strong>{med.instruction || 'After Food'}</strong>
                            {med.additional_comments && ` (${med.additional_comments})`}
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button type="button" className="icon-btn" style={{ color: 'var(--color-primary)' }} onClick={() => handleEditMedicine(idx)} title="Edit">
                            <Edit2 size={14} />
                          </button>
                          <button type="button" className="icon-btn" style={{ color: 'var(--color-danger)' }} onClick={() => handleRemoveMedicineRow(idx)} title="Delete">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ padding: '16px', textAlign: 'center', background: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-md)', marginBottom: '16px', color: 'var(--color-text-tertiary)', fontSize: '12px' }}>
                    No medicines added to template yet. Fill the details below to add.
                  </div>
                )}

                {/* Medicine Entry Box */}
                <div style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border-strong)', borderRadius: 'var(--radius-lg)', padding: '14px', marginBottom: '16px' }}>
                  <div style={{ fontWeight: 'bold', fontSize: '12px', marginBottom: '10px', color: 'var(--color-text-primary)' }}>
                    {editingMedIndex !== null ? `Edit Template Medicine #${editingMedIndex + 1}` : 'Add Medicine To Template'}
                  </div>

                  <div className="form-group" style={{ marginBottom: '10px', position: 'relative' }}>
                    <label className="form-label" style={{ fontSize: '11px', fontWeight: 'bold' }}>Medicine Name *</label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="Type medicine name (e.g. Paracetamol 500mg)..."
                      value={currentMed.name}
                      onChange={(e) => {
                        setCurrentMed({ ...currentMed, name: e.target.value });
                        setShowMedSuggestions(true);
                      }}
                      onFocus={() => setShowMedSuggestions(true)}
                    />
                    {showMedSuggestions && currentMed.name.trim().length > 0 && masterMedicines.length > 0 && (
                      <div className="suggestion-dropdown">
                        {masterMedicines
                          .filter(m => (m.name || m.medicine_name || '').toLowerCase().includes(currentMed.name.toLowerCase()))
                          .slice(0, 8)
                          .map((m, mIdx) => (
                            <div
                              key={mIdx}
                              className="suggestion-item"
                              onClick={() => {
                                setCurrentMed({
                                  name: m.name || m.medicine_name || '',
                                  quantity: m.quantity || m.qty || 1,
                                  route: m.route || m.form || 'Oral',
                                  frequency: m.frequency || m.freq || '1-0-1',
                                  no_of_days: m.no_of_days || m.days || m.noOfDays || 5,
                                  instruction: m.instruction || m.instructions || 'After Food',
                                  additional_comments: m.additional_comments || m.comment || m.additionalComment || '',
                                });
                                setShowMedSuggestions(false);
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                                <div style={{ fontWeight: '600', color: 'var(--color-text-primary)' }}>{m.name || m.medicine_name}</div>
                                {m.is_clinic_medicine ? (
                                  <span className="badge badge-primary" style={{ fontSize: '10px', padding: '1px 5px' }}>Clinic</span>
                                ) : (
                                  <span className="badge badge-secondary" style={{ fontSize: '10px', padding: '1px 5px', opacity: 0.75 }}>Master</span>
                                )}
                              </div>
                              <div style={{ fontSize: '10px', color: 'var(--color-text-tertiary)', marginTop: '2px' }}>
                                {[m.route || m.form, m.frequency || m.freq, (m.no_of_days || m.days || m.noOfDays) ? `${m.no_of_days || m.days || m.noOfDays} days` : null, m.instruction || m.instructions].filter(Boolean).join(' • ') || 'Medicine'}
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>

                  <div className="form-row" style={{ marginBottom: '10px' }}>
                    <div className="form-group" style={{ width: '90px' }}>
                      <label className="form-label" style={{ fontSize: '11px' }}>Quantity</label>
                      <input
                        type="number"
                        min={1}
                        className="input-field"
                        placeholder="1"
                        value={currentMed.quantity || 1}
                        onChange={(e) => setCurrentMed({ ...currentMed, quantity: Number(e.target.value) || 1 })}
                      />
                    </div>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label className="form-label" style={{ fontSize: '11px' }}>Route / Type</label>
                      <select className="input-field" value={currentMed.route} onChange={(e) => setCurrentMed({ ...currentMed, route: e.target.value })}>
                        {masterRoutes.map(r => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label className="form-label" style={{ fontSize: '11px' }}>Frequency</label>
                      <select className="input-field" value={currentMed.frequency} onChange={(e) => setCurrentMed({ ...currentMed, frequency: e.target.value })}>
                        {masterFrequencies.map(f => (
                          <option key={f} value={f}>{f}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label className="form-label" style={{ fontSize: '11px' }}>Duration (Days)</label>
                      <input type="number" className="input-field" placeholder="5" value={currentMed.no_of_days} onChange={(e) => setCurrentMed({ ...currentMed, no_of_days: Number(e.target.value) })} />
                    </div>
                  </div>

                  <div className="form-row" style={{ marginBottom: '10px' }}>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label className="form-label" style={{ fontSize: '11px' }}>Instruction</label>
                      <select className="input-field" value={currentMed.instruction} onChange={(e) => setCurrentMed({ ...currentMed, instruction: e.target.value })}>
                        {masterInstructions.map(ins => (
                          <option key={ins} value={ins}>{ins}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label className="form-label" style={{ fontSize: '11px' }}>Additional Comments</label>
                      <input type="text" className="input-field" placeholder="Special note..." value={currentMed.additional_comments} onChange={(e) => setCurrentMed({ ...currentMed, additional_comments: e.target.value })} />
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                    {editingMedIndex !== null && (
                      <button type="button" className="btn btn-secondary" onClick={() => {
                        setEditingMedIndex(null);
                        setCurrentMed({ name: '', route: 'Oral', frequency: '1-0-1', no_of_days: 5, instruction: 'After Food', additional_comments: '' });
                      }}>
                        Cancel Edit
                      </button>
                    )}
                    <button type="button" className="btn btn-primary" onClick={handleAddOrUpdateMedicine}>
                      <Plus size={14} /> {editingMedIndex !== null ? 'Update Medicine' : 'Add Medicine'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* CONDITIONAL SECTION: LAB TESTS */}
            {type === 'Lab Tests' && (
              <div style={{ marginTop: '20px', borderTop: '1px solid var(--color-border)', paddingTop: '16px', marginBottom: '20px' }}>
                <h4 style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--color-primary)', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FlaskConical size={16} /> Template Lab Tests ({labs.length})
                </h4>

                <div style={{ marginBottom: '16px' }}>
                  {labs.length > 0 ? (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {labs.map((labName, idx) => (
                        <div key={idx} className="badge badge-info" style={{ padding: '6px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span>{labName}</span>
                          <button type="button" onClick={() => handleRemoveLabTest(idx)} style={{ background: 'none', border: 'none', color: 'currentColor', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ padding: '16px', textAlign: 'center', background: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-md)', color: 'var(--color-text-tertiary)', fontSize: '12px' }}>
                      No lab tests added yet. Select from quick suggestions below or type test name.
                    </div>
                  )}
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--color-text-tertiary)', marginBottom: '6px' }}>
                    Quick Suggestions:
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {[
                      "CBC (Complete Blood Count)",
                      "Blood Sugar (Fast & PP)",
                      "HbA1c",
                      "Lipid Profile",
                      "LFT (Liver Function)",
                      "KFT (Kidney Function)",
                      "Thyroid Profile",
                      "Urine Routine",
                      "Chest X-Ray",
                      "ECG 12-Lead",
                      "USG Abdomen"
                    ].map((quickLab) => (
                      <button
                        key={quickLab}
                        type="button"
                        className={`quick-chip ${labs.includes(quickLab) ? 'active' : ''}`}
                        onClick={() => handleAddLabTest(quickLab)}
                      >
                        + {quickLab}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border-strong)', borderRadius: 'var(--radius-lg)', padding: '14px' }}>
                  <label className="form-label" style={{ fontSize: '11px', fontWeight: 'bold' }}>Add Lab Test / Investigation *</label>
                  <div style={{ display: 'flex', gap: '8px', position: 'relative', marginTop: '4px' }}>
                    <div style={{ flex: 1, position: 'relative' }}>
                      <input
                        type="text"
                        className="input-field"
                        placeholder="Search or type lab test name..."
                        value={currentLabInput}
                        onChange={(e) => {
                          setCurrentLabInput(e.target.value);
                          setShowLabSuggestions(true);
                        }}
                        onFocus={() => setShowLabSuggestions(true)}
                      />
                      {showLabSuggestions && currentLabInput.trim().length > 0 && masterLabs.length > 0 && (
                        <div className="suggestion-dropdown">
                          {masterLabs
                            .filter(l => (l.name || l.lab_test || l.test_name || (typeof l === 'string' ? l : '')).toLowerCase().includes(currentLabInput.toLowerCase()))
                            .slice(0, 8)
                            .map((l, lIdx) => {
                              const lName = l.name || l.lab_test || l.test_name || (typeof l === 'string' ? l : '');
                              return (
                                <div
                                  key={lIdx}
                                  className="suggestion-item"
                                  onClick={() => handleAddLabTest(lName)}
                                >
                                  <span style={{ fontWeight: '600' }}>{lName}</span>
                                  <span style={{ fontSize: '10px', color: 'var(--color-text-tertiary)' }}>{l.category || 'Lab Test'}</span>
                                </div>
                              );
                            })}
                        </div>
                      )}
                    </div>
                    <button type="button" className="btn btn-primary" onClick={() => handleAddLabTest()}>
                      <Plus size={14} /> Add Test
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* CONDITIONAL SECTION: CONSENTS / INSTRUCTIONS / CERTIFICATES */}
            {['Consents', 'Instructions', 'Certificates'].includes(type) && (
              <div style={{ marginTop: '20px', borderTop: '1px solid var(--color-border)', paddingTop: '16px', marginBottom: '20px' }}>
                {type === 'Certificates' && (
                  <div className="form-row" style={{ marginBottom: '16px' }}>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label className="form-label" style={{ fontWeight: 'bold' }}>Duration / Sick Leave (e.g. 3 days)</label>
                      <input
                        type="text"
                        className="input-field"
                        placeholder="e.g. 3 days"
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                      />
                    </div>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label className="form-label" style={{ fontWeight: 'bold' }}>Remarks / Diagnosis</label>
                      <input
                        type="text"
                        className="input-field"
                        placeholder="e.g. Advised rest due to acute viral infection"
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                      />
                    </div>
                  </div>
                )}

                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label className="form-label" style={{ fontWeight: 'bold' }}>Template Content Body *</label>
                  <textarea
                    className="input-field"
                    style={{ minHeight: '140px' }}
                    placeholder="Enter standard template text content..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    required
                  />
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
          <h1 className="page-title">Templates Directory</h1>
          <p className="page-subtitle">Pre-configured templates for faster prescription generation, orders, and certificates</p>
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
        gap: '16px', 
        borderBottom: '2px solid var(--color-border)', 
        marginBottom: '20px',
        paddingBottom: '8px',
        overflowX: 'auto'
      }}>
        {[
          { id: 'all', label: 'All Templates' },
          { id: 'medicines', label: 'Medicines' },
          { id: 'labs', label: 'Lab Tests' },
          { id: 'consents', label: 'Consents' },
          { id: 'instructions', label: 'Instructions' },
          { id: 'certificates', label: 'Certificates' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setCategoryTab(tab.id)}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '14px',
              fontWeight: categoryTab === tab.id ? '700' : '500',
              color: categoryTab === tab.id ? 'var(--color-primary)' : 'var(--color-text-secondary)',
              cursor: 'pointer',
              position: 'relative',
              paddingBottom: '8px',
              whiteSpace: 'nowrap'
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

      {/* Search Bar & View Toggle */}
      <div className="card" style={{ padding: '12px 16px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: '320px' }}>
          <input
            type="text"
            className="input-field"
            placeholder="Search templates by title..."
            style={{ paddingLeft: '32px' }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Search size={14} style={{ position: 'absolute', left: '10px', top: '12px', color: 'var(--color-text-tertiary)' }} />
        </div>
        <ViewToggle mode={displayMode} onChange={handleDisplayModeChange} />
      </div>

      {/* Grid or Table view of Templates */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-tertiary)' }}>Loading templates...</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-tertiary)' }}>No templates found in this category.</div>
      ) : displayMode === 'grid' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
          {filtered.map((t) => {
            const tType = (t.type || '').toLowerCase();
            const isMed = tType.includes('medicine') || tType.includes('prescription');
            const isLab = tType.includes('lab');
            const isConsent = tType.includes('consent');
            const isInstruction = tType.includes('instruction');

            return (
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: 0 }}>
                  <div style={{ 
                    width: '44px', 
                    height: '44px', 
                    borderRadius: '12px', 
                    backgroundColor: 'var(--color-primary-light)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    color: 'var(--color-primary)',
                    flexShrink: 0
                  }}>
                    {isLab ? (
                      <FlaskConical size={20} />
                    ) : isConsent ? (
                      <ClipboardCheck size={20} />
                    ) : isInstruction ? (
                      <FileText size={20} />
                    ) : !isMed ? (
                      <Award size={20} />
                    ) : (
                      <Pill size={20} />
                    )}
                  </div>
                  <div style={{ overflow: 'hidden' }}>
                    <h3 style={{ fontSize: '15px', fontWeight: 'bold', margin: 0, color: 'var(--color-text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {t.name}
                    </h3>
                    <span style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', marginTop: '2px', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {isMed ? `Medicines: ${t.medicines?.length || 0}` : isLab ? `Lab Tests: ${t.labs?.length || 0}` : t.content || t.remarks || t.type}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '6px', marginLeft: '12px' }}>
                  <button className="icon-btn" onClick={() => handleOpenEdit(t)} title="Edit template">
                    <Edit2 size={16} />
                  </button>
                  <button className="icon-btn" style={{ color: 'var(--color-danger)' }} onClick={() => triggerDelete(t._id)} title="Delete template">
                    <Trash2 size={16} />
                  </button>
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
                <th>Template Name</th>
                <th>Category</th>
                <th>Details / Items</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => {
                const tType = (t.type || '').toLowerCase();
                const isMed = tType.includes('medicine') || tType.includes('prescription');
                const isLab = tType.includes('lab');
                const isConsent = tType.includes('consent');
                const isInstruction = tType.includes('instruction');

                return (
                  <tr key={t._id}>
                    <td style={{ fontWeight: 'bold', color: 'var(--color-text-primary)' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {isLab ? (
                          <FlaskConical size={16} color="var(--color-primary)" />
                        ) : isConsent ? (
                          <ClipboardCheck size={16} color="var(--color-primary)" />
                        ) : isInstruction ? (
                          <FileText size={16} color="var(--color-primary)" />
                        ) : !isMed ? (
                          <Award size={16} color="var(--color-primary)" />
                        ) : (
                          <Pill size={16} color="var(--color-primary)" />
                        )}
                        {t.name}
                      </span>
                    </td>
                    <td>
                      <span className="badge badge-info" style={{ textTransform: 'capitalize' }}>
                        {t.type || 'Template'}
                      </span>
                    </td>
                    <td style={{ fontSize: '12px', color: 'var(--color-text-secondary)', maxWidth: '350px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {isMed ? (
                        <span>{t.medicines?.length || 0} medicine{(t.medicines?.length || 0) === 1 ? '' : 's'} included</span>
                      ) : isLab ? (
                        <span>{t.labs?.length || 0} test{(t.labs?.length || 0) === 1 ? '' : 's'} included</span>
                      ) : (
                        t.content || t.remarks || '—'
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button className="icon-btn" onClick={() => handleOpenEdit(t)} title="Edit template">
                          <Edit2 size={16} />
                        </button>
                        <button className="icon-btn" style={{ color: 'var(--color-danger)' }} onClick={() => triggerDelete(t._id)} title="Delete template">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
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
        title="Delete Template"
        message="Are you sure you want to delete this template layout?"
        loading={deleteLoading}
      />
    </div>
  );
}
