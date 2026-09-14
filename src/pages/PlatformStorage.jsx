import React, { useState, useEffect } from 'react';
import { 
  HardDrive, 
  Database, 
  Cloud, 
  Hospital, 
  Search, 
  RefreshCw, 
  ArrowUpRight, 
  ShieldCheck, 
  Layers, 
  FileSpreadsheet,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { storageAPI } from '../services/api';
import ViewToggle from '../components/common/ViewToggle';
import ClinicStorageModal, { formatBytes } from '../components/clinic/ClinicStorageModal';

export default function PlatformStorage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Display Mode: 'list' | 'grid'
  const [displayMode, setDisplayMode] = useState(() => localStorage.getItem('adixon_view_mode_storage') || 'list');

  const handleDisplayModeChange = (mode) => {
    setDisplayMode(mode);
    localStorage.setItem('adixon_view_mode_storage', mode);
  };

  // Inspect Clinic Storage Modal
  const [selectedClinicId, setSelectedClinicId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const loadStorage = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await storageAPI.getPlatformStorage();
      if (res && res.data) {
        setData(res.data);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch platform storage analytics from backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStorage();
  }, []);

  const handleInspectClinic = (clinicId) => {
    setSelectedClinicId(clinicId);
    setModalOpen(true);
  };

  const clinics = data?.clinics || [];
  const platform = data?.platform || {};
  const db = platform.database || {};
  const cloud = platform.cloudMedia || {};

  const filteredClinics = clinics.filter((c) => {
    const matchesSearch = 
      c.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.email?.toLowerCase().includes(search.toLowerCase()) ||
      c.phone?.includes(search);
    const matchesStatus = !statusFilter || c.healthStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <HardDrive size={24} color="var(--color-primary)" />
            Platform & Cloud Storage Analytics
          </h1>
          <p className="page-subtitle">
            Live database BSON footprints, Cloudinary media consumption, and per-clinic storage quotas
          </p>
        </div>
        <button 
          className="btn btn-secondary" 
          onClick={loadStorage} 
          disabled={loading}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh Metrics
        </button>
      </div>

      {error && (
        <div className="badge badge-danger" style={{ display: 'block', width: '100%', padding: '12px', borderRadius: '8px', marginBottom: '20px' }}>
          {error}
        </div>
      )}

      {/* Top 4 KPI Metrics Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {/* Total Platform Storage */}
        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Total Storage Consumed
            </span>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'var(--color-primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)' }}>
              <HardDrive size={18} />
            </div>
          </div>
          <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--color-text-primary)' }}>
            {loading ? '...' : formatBytes(platform.totalStorageBytes)}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
            DB ({formatBytes(db.storageSize || db.dataSize)}) + Media ({formatBytes(cloud.bytes)})
          </div>
        </div>

        {/* MongoDB Database Footprint */}
        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              MongoDB Database
            </span>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
              <Database size={18} />
            </div>
          </div>
          <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--color-text-primary)' }}>
            {loading ? '...' : formatBytes(db.dataSize)}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
            {db.objects?.toLocaleString() || 0} objects across {db.collections || 0} collections
          </div>
        </div>

        {/* Cloudinary Media Cloud */}
        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Cloudinary Media Assets
            </span>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(59, 130, 246, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6' }}>
              <Cloud size={18} />
            </div>
          </div>
          <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--color-text-primary)' }}>
            {loading ? '...' : formatBytes(cloud.bytes)}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
            {cloud.objects || 0} assets stored • {cloud.plan} Tier
          </div>
        </div>

        {/* Active Clinics & Clinical Records */}
        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Clinics Data Footprint
            </span>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(139, 92, 246, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8b5cf6' }}>
              <Hospital size={18} />
            </div>
          </div>
          <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--color-text-primary)' }}>
            {loading ? '...' : formatBytes(platform.totalClinicDataBytes)}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
            {platform.totalRecords?.toLocaleString() || 0} records across {platform.totalClinics || 0} clinics
          </div>
        </div>
      </div>

      {/* Storage Composition Visual Section */}
      <div className="card" style={{ padding: '20px', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '12px', color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Layers size={16} color="var(--color-primary)" />
          Platform Storage Architecture Composition
        </h3>

        <div style={{ display: 'flex', height: '14px', borderRadius: '7px', overflow: 'hidden', backgroundColor: 'var(--color-border)', marginBottom: '14px' }}>
          <div 
            style={{ 
              width: `${platform.totalStorageBytes > 0 ? Math.max(((db.dataSize || 0) / platform.totalStorageBytes) * 100, 10) : 70}%`, 
              backgroundColor: '#10b981' 
            }} 
            title={`Database Data Size: ${formatBytes(db.dataSize)}`}
          />
          <div 
            style={{ 
              width: `${platform.totalStorageBytes > 0 ? Math.max(((db.indexSize || 0) / platform.totalStorageBytes) * 100, 5) : 15}%`, 
              backgroundColor: '#8b5cf6' 
            }} 
            title={`Database Indexes: ${formatBytes(db.indexSize)}`}
          />
          <div 
            style={{ 
              width: `${platform.totalStorageBytes > 0 ? Math.max(((cloud.bytes || 0) / platform.totalStorageBytes) * 100, 5) : 15}%`, 
              backgroundColor: '#3b82f6' 
            }} 
            title={`Cloudinary Media: ${formatBytes(cloud.bytes)}`}
          />
        </div>

        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', fontSize: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#10b981' }} />
            <span style={{ color: 'var(--color-text-secondary)' }}>MongoDB Records & BSON:</span>
            <strong>{formatBytes(db.dataSize)}</strong>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#8b5cf6' }} />
            <span style={{ color: 'var(--color-text-secondary)' }}>Indexes:</span>
            <strong>{formatBytes(db.indexSize)}</strong>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#3b82f6' }} />
            <span style={{ color: 'var(--color-text-secondary)' }}>Cloudinary Media & Logos:</span>
            <strong>{formatBytes(cloud.bytes)}</strong>
          </div>
        </div>
      </div>

      {/* Clinics Storage Directory Header & Controls */}
      <div style={{ marginBottom: '16px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--color-text-primary)' }}>
          Clinic-by-Clinic Storage Consumption
        </h2>
        <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: '2px 0 0 0' }}>
          Individual BSON data sizes, document counts, and 500 MB quota utilization per clinic
        </p>
      </div>

      {/* Filter and View Toggle Card */}
      <div className="card" style={{ padding: '12px 16px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: '12px', flex: 1, minWidth: '260px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: '320px', minWidth: '200px' }}>
            <input
              type="text"
              className="input-field"
              placeholder="Search clinic by name, email..."
              style={{ paddingLeft: '32px' }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Search size={14} style={{ position: 'absolute', left: '10px', top: '12px', color: 'var(--color-text-tertiary)' }} />
          </div>

          <select 
            className="input-field" 
            style={{ width: '150px' }} 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Health Statuses</option>
            <option value="healthy">Healthy (&lt; 70%)</option>
            <option value="warning">Warning (70-90%)</option>
            <option value="critical">Critical (&gt; 90%)</option>
          </select>
        </div>

        <ViewToggle mode={displayMode} onChange={handleDisplayModeChange} />
      </div>

      {/* Directory Content (Table vs Grid) */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px', color: 'var(--color-text-tertiary)' }}>
          <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 12px auto', display: 'block', color: 'var(--color-primary)' }} />
          Calculating real-time clinic storage footprints...
        </div>
      ) : filteredClinics.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '50px', color: 'var(--color-text-tertiary)' }}>
          No clinics match the filter query.
        </div>
      ) : displayMode === 'grid' ? (
        <div className="records-grid">
          {filteredClinics.map((c) => (
            <div key={c.clinic_id} className="record-card">
              <div className="record-card-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    backgroundColor: 'var(--color-primary-light)',
                    color: 'var(--color-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    fontSize: '14px',
                    flexShrink: 0
                  }}>
                    {c.logo ? (
                      <img src={c.logo} alt={c.name} style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '10px' }} />
                    ) : (
                      c.name.slice(0, 2).toUpperCase()
                    )}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '14px', fontWeight: 'bold', margin: 0, color: 'var(--color-text-primary)' }}>
                      {c.name}
                    </h3>
                    <div style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', marginTop: '2px' }}>
                      {c.phone || c.email || 'Registered Clinic'}
                    </div>
                  </div>
                </div>

                <span className={`badge ${c.healthStatus === 'healthy' ? 'badge-success' : c.healthStatus === 'warning' ? 'badge-warning' : 'badge-danger'}`} style={{ textTransform: 'capitalize', fontSize: '10px' }}>
                  {c.healthStatus}
                </span>
              </div>

              <div className="record-card-body">
                <div className="record-card-row">
                  <span className="record-card-label">Data Footprint:</span>
                  <span className="record-card-value" style={{ fontWeight: 'bold', color: 'var(--color-primary)' }}>
                    {formatBytes(c.totalBytes)}
                  </span>
                </div>
                <div className="record-card-row">
                  <span className="record-card-label">Documents & Records:</span>
                  <span className="record-card-value">{c.totalDocuments} items</span>
                </div>
                <div className="record-card-row">
                  <span className="record-card-label">Allocated Quota:</span>
                  <span className="record-card-value">{formatBytes(c.quotaBytes)}</span>
                </div>

                {/* Progress bar */}
                <div style={{ marginTop: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                    <span>Quota Used</span>
                    <strong>{c.percentageUsed}%</strong>
                  </div>
                  <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--color-border)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div 
                      style={{ 
                        width: `${Math.min(Math.max(c.percentageUsed, 1), 100)}%`, 
                        height: '100%', 
                        backgroundColor: c.percentageUsed > 90 ? 'var(--color-danger)' : c.percentageUsed > 70 ? 'var(--color-warning)' : 'var(--color-primary)', 
                        borderRadius: '3px' 
                      }} 
                    />
                  </div>
                </div>
              </div>

              <div className="record-card-footer">
                <button
                  className="btn btn-secondary"
                  style={{ width: '100%', padding: '6px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                  onClick={() => handleInspectClinic(c.clinic_id)}
                >
                  <HardDrive size={14} /> Inspect Storage Details
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Clinic Name</th>
                <th>Total Stored Records</th>
                <th>Database Footprint</th>
                <th>Quota Utilization</th>
                <th>Health Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredClinics.map((c) => (
                <tr key={c.clinic_id}>
                  <td style={{ fontWeight: 'bold' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        backgroundColor: 'var(--color-primary-light)',
                        color: 'var(--color-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 'bold',
                        fontSize: '12px',
                        flexShrink: 0
                      }}>
                        {c.logo ? (
                          <img src={c.logo} alt={c.name} style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '8px' }} />
                        ) : (
                          c.name.slice(0, 2).toUpperCase()
                        )}
                      </div>
                      <div>
                        <div style={{ color: 'var(--color-text-primary)' }}>{c.name}</div>
                        <div style={{ fontSize: '11px', color: 'var(--color-text-tertiary)' }}>{c.email || c.phone || 'Clinic ID: ' + c.clinic_id.slice(-6)}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span style={{ fontWeight: 600 }}>{c.totalDocuments}</span> documents
                  </td>
                  <td style={{ fontWeight: 'bold', color: 'var(--color-primary)' }}>
                    {formatBytes(c.totalBytes)}
                  </td>
                  <td style={{ minWidth: '180px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '3px' }}>
                      <span style={{ color: 'var(--color-text-secondary)' }}>{formatBytes(c.totalBytes)} / {formatBytes(c.quotaBytes)}</span>
                      <strong>{c.percentageUsed}%</strong>
                    </div>
                    <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--color-border)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div 
                        style={{ 
                          width: `${Math.min(Math.max(c.percentageUsed, 1), 100)}%`, 
                          height: '100%', 
                          backgroundColor: c.percentageUsed > 90 ? 'var(--color-danger)' : c.percentageUsed > 70 ? 'var(--color-warning)' : 'var(--color-primary)', 
                          borderRadius: '3px' 
                        }} 
                      />
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${c.healthStatus === 'healthy' ? 'badge-success' : c.healthStatus === 'warning' ? 'badge-warning' : 'badge-danger'}`} style={{ textTransform: 'capitalize' }}>
                      {c.healthStatus}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn btn-secondary"
                      style={{ padding: '4px 10px', fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                      onClick={() => handleInspectClinic(c.clinic_id)}
                      title="Inspect Clinic Storage Footprint"
                    >
                      <HardDrive size={13} /> Inspect
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Detailed Clinic Storage Inspection Modal */}
      {modalOpen && selectedClinicId && (
        <ClinicStorageModal
          isOpen={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setSelectedClinicId(null);
          }}
          clinicId={selectedClinicId}
        />
      )}
    </div>
  );
}
