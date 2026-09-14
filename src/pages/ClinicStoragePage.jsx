import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  HardDrive, 
  ArrowLeft, 
  RefreshCw, 
  FileSpreadsheet, 
  UserCheck, 
  CalendarDays, 
  FileBadge, 
  ClipboardCheck, 
  FlaskConical, 
  Layout, 
  FileText, 
  Users, 
  ShieldCheck, 
  Hospital 
} from 'lucide-react';
import { storageAPI, clinicAPI } from '../services/api';
import { formatBytes } from '../components/clinic/ClinicStorageModal';

const getCategoryIcon = (iconName) => {
  switch (iconName) {
    case 'FileSpreadsheet': return <FileSpreadsheet size={18} color="var(--color-primary)" />;
    case 'UserCheck': return <UserCheck size={18} color="#06b6d4" />;
    case 'CalendarDays': return <CalendarDays size={18} color="#8b5cf6" />;
    case 'FileBadge': return <FileBadge size={18} color="#f59e0b" />;
    case 'ClipboardCheck': return <ClipboardCheck size={18} color="#10b981" />;
    case 'FlaskConical': return <FlaskConical size={18} color="#ec4899" />;
    case 'Layout': return <Layout size={18} color="#6366f1" />;
    case 'FileText': return <FileText size={18} color="#64748b" />;
    case 'Users': return <Users size={18} color="#3b82f6" />;
    case 'ShieldCheck': return <ShieldCheck size={18} color="#14b8a6" />;
    case 'Hospital': return <Hospital size={18} color="var(--color-primary)" />;
    default: return <HardDrive size={18} color="var(--color-primary)" />;
  }
};

export default function ClinicStoragePage() {
  const { clinicId } = useParams();
  const [data, setData] = useState(null);
  const [clinic, setClinic] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = async () => {
    if (!clinicId) return;
    setLoading(true);
    setError('');
    try {
      const [storageRes, clinicRes] = await Promise.all([
        storageAPI.getClinicStorage(clinicId),
        clinicAPI.getClinicById(clinicId)
      ]);

      if (storageRes && storageRes.data) setData(storageRes.data);
      if (clinicRes && clinicRes.data) setClinic(clinicRes.data?.data || clinicRes.data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch clinic storage breakdown from database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [clinicId]);

  return (
    <div>
      {/* Top Header & Breadcrumb */}
      <div className="page-header" style={{ marginBottom: '20px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <Link to={`/admin/clinics/${clinicId}`} style={{ textDecoration: 'none', color: 'var(--color-primary)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '500' }}>
              <ArrowLeft size={14} /> Back to Clinic Overview
            </Link>
            <span style={{ color: 'var(--color-text-tertiary)' }}>/</span>
            <span style={{ color: 'var(--color-text-secondary)', fontSize: '13px' }}>Storage Footprint</span>
          </div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <HardDrive size={24} color="var(--color-primary)" />
            {clinic?.name || data?.name || 'Clinic'} Storage Analytics
          </h1>
          <p className="page-subtitle">
            Live BSON document sizes, database storage footprint, and 500 MB cloud quota metrics
          </p>
        </div>

        <button 
          className="btn btn-secondary" 
          onClick={loadData} 
          disabled={loading}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      {error && (
        <div className="badge badge-danger" style={{ display: 'block', width: '100%', padding: '12px', borderRadius: '8px', marginBottom: '20px' }}>
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--color-text-tertiary)' }}>
          <RefreshCw size={28} className="animate-spin" style={{ margin: '0 auto 12px auto', display: 'block', color: 'var(--color-primary)' }} />
          Calculating live clinic database storage footprints...
        </div>
      ) : data ? (
        <div>
          {/* Quota Summary Card */}
          <div className="card" style={{ padding: '24px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '16px' }}>
              <div>
                <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Total Clinic Storage Consumed
                </span>
                <div style={{ fontSize: '32px', fontWeight: '800', color: 'var(--color-primary)', marginTop: '4px' }}>
                  {formatBytes(data.totalBytes)}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', marginTop: '2px' }}>
                  {data.totalDocuments} total documents stored across all clinical collections
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span className={`badge ${data.healthStatus === 'healthy' ? 'badge-success' : data.healthStatus === 'warning' ? 'badge-warning' : 'badge-danger'}`} style={{ textTransform: 'capitalize', fontSize: '12px', padding: '4px 12px' }}>
                  {data.healthStatus} Status
                </span>
                <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-text-secondary)', marginTop: '8px' }}>
                  Quota: {formatBytes(data.quotaBytes)} ({data.percentageUsed}% used)
                </div>
              </div>
            </div>

            {/* Gauge bar */}
            <div style={{ width: '100%', height: '10px', backgroundColor: 'var(--color-border)', borderRadius: '5px', overflow: 'hidden' }}>
              <div 
                style={{ 
                  width: `${Math.min(Math.max(data.percentageUsed, 0.5), 100)}%`, 
                  height: '100%', 
                  backgroundColor: data.percentageUsed > 90 ? 'var(--color-danger)' : data.percentageUsed > 70 ? 'var(--color-warning)' : 'var(--color-primary)', 
                  borderRadius: '5px',
                  transition: 'width 0.4s ease'
                }} 
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', fontSize: '12px', color: 'var(--color-text-secondary)' }}>
              <span>Available Remaining Space: <strong>{formatBytes(Math.max(data.quotaBytes - data.totalBytes, 0))}</strong></span>
              <span>Allocated Limit: <strong>{formatBytes(data.quotaBytes)}</strong></span>
            </div>
          </div>

          {/* Breakdown Grid */}
          <h2 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '16px', color: 'var(--color-text-primary)' }}>
            Category-wise Data Footprint Breakdown
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
            {(data.categories || []).map((cat) => {
              const catPercent = data.totalBytes > 0 ? ((cat.bytes / data.totalBytes) * 100).toFixed(1) : 0;
              return (
                <div key={cat.key} className="card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: 0 }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '10px',
                      background: 'var(--color-bg-secondary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      {getCategoryIcon(cat.icon)}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <h4 style={{ fontSize: '14px', fontWeight: 'bold', margin: 0, color: 'var(--color-text-primary)' }}>
                        {cat.category}
                      </h4>
                      <p style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', margin: '2px 0 0 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {cat.description}
                      </p>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: '12px' }}>
                    <div style={{ fontWeight: 'bold', fontSize: '15px', color: 'var(--color-text-primary)' }}>
                      {formatBytes(cat.bytes)}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                      {cat.count} items • {catPercent}%
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
