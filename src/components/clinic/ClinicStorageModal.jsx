import React, { useState, useEffect } from 'react';
import { 
  X, 
  HardDrive, 
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
  Hospital,
  AlertCircle,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import { storageAPI } from '../../services/api';

export const formatBytes = (bytes, decimals = 2) => {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

const getCategoryIcon = (iconName) => {
  switch (iconName) {
    case 'FileSpreadsheet': return <FileSpreadsheet size={16} color="var(--color-primary)" />;
    case 'UserCheck': return <UserCheck size={16} color="#06b6d4" />;
    case 'CalendarDays': return <CalendarDays size={16} color="#8b5cf6" />;
    case 'FileBadge': return <FileBadge size={16} color="#f59e0b" />;
    case 'ClipboardCheck': return <ClipboardCheck size={16} color="#10b981" />;
    case 'FlaskConical': return <FlaskConical size={16} color="#ec4899" />;
    case 'Layout': return <Layout size={16} color="#6366f1" />;
    case 'FileText': return <FileText size={16} color="#64748b" />;
    case 'Users': return <Users size={16} color="#3b82f6" />;
    case 'ShieldCheck': return <ShieldCheck size={16} color="#14b8a6" />;
    case 'Hospital': return <Hospital size={16} color="var(--color-primary)" />;
    default: return <HardDrive size={16} color="var(--color-primary)" />;
  }
};

export default function ClinicStorageModal({ isOpen, onClose, clinicId, initialData }) {
  const [data, setData] = useState(initialData || null);
  const [loading, setLoading] = useState(!initialData);
  const [error, setError] = useState('');

  const loadStorage = async () => {
    if (!clinicId) return;
    setLoading(true);
    setError('');
    try {
      const res = await storageAPI.getClinicStorage(clinicId);
      if (res && res.data) {
        setData(res.data);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch real-time clinic storage details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      if (!initialData || initialData.clinic_id !== clinicId) {
        loadStorage();
      } else {
        setData(initialData);
      }
    }
  }, [isOpen, clinicId]);

  if (!isOpen) return null;

  return (
    <div 
      className="modal-backdrop" 
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        backdropFilter: 'blur(4px)'
      }}
    >
      <div 
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: 'var(--color-bg-card)',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '720px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          border: '1px solid var(--color-border)',
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ 
              width: '44px', 
              height: '44px', 
              borderRadius: '12px', 
              background: 'var(--color-primary-light)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              color: 'var(--color-primary)' 
            }}>
              <HardDrive size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0, color: 'var(--color-text-primary)' }}>
                  {data?.name || 'Clinic'} Storage Breakdown
                </h2>
                {data?.healthStatus && (
                  <span className={`badge ${data.healthStatus === 'healthy' ? 'badge-success' : data.healthStatus === 'warning' ? 'badge-warning' : 'badge-danger'}`} style={{ textTransform: 'capitalize', fontSize: '10px' }}>
                    {data.healthStatus}
                  </span>
                )}
              </div>
              <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: '2px 0 0 0' }}>
                Live database BSON document footprint & quota metrics
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button 
              className="icon-btn" 
              onClick={loadStorage} 
              title="Refresh Storage Metrics" 
              disabled={loading}
              style={{ color: 'var(--color-text-secondary)' }}
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            </button>
            <button 
              className="icon-btn" 
              onClick={onClose} 
              style={{ color: 'var(--color-text-tertiary)' }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '50px 20px', color: 'var(--color-text-tertiary)' }}>
              <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 12px auto', display: 'block', color: 'var(--color-primary)' }} />
              Calculating exact BSON document storage footprints...
            </div>
          ) : error ? (
            <div className="badge badge-danger" style={{ display: 'block', padding: '14px', borderRadius: '8px', textAlign: 'center' }}>
              {error}
            </div>
          ) : data ? (
            <div>
              {/* Storage Quota Gauge Bar */}
              <div style={{ 
                background: 'var(--color-bg-secondary)', 
                border: '1px solid var(--color-border)', 
                borderRadius: '12px', 
                padding: '16px 20px', 
                marginBottom: '24px' 
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-text-primary)' }}>
                    Quota Consumption:
                  </span>
                  <div style={{ fontSize: '13px', fontWeight: 'bold' }}>
                    <span style={{ color: 'var(--color-primary)' }}>{formatBytes(data.totalBytes)}</span>
                    <span style={{ color: 'var(--color-text-tertiary)', fontWeight: 'normal' }}> / {formatBytes(data.quotaBytes)} ({data.percentageUsed}%)</span>
                  </div>
                </div>

                <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--color-border)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div 
                    style={{ 
                      width: `${Math.min(Math.max(data.percentageUsed, 0.5), 100)}%`, 
                      height: '100%', 
                      backgroundColor: data.percentageUsed > 90 ? 'var(--color-danger)' : data.percentageUsed > 70 ? 'var(--color-warning)' : 'var(--color-primary)', 
                      borderRadius: '4px',
                      transition: 'width 0.4s ease'
                    }} 
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '11px', color: 'var(--color-text-tertiary)' }}>
                  <span>Total Stored Records: <strong>{data.totalDocuments}</strong></span>
                  <span>Available Quota: <strong>{formatBytes(Math.max(data.quotaBytes - data.totalBytes, 0))}</strong></span>
                </div>
              </div>

              {/* Breakdown Category Table */}
              <h3 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '12px', color: 'var(--color-text-primary)' }}>
                Detailed Data Footprint by Category
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {(data.categories || []).map((cat) => {
                  const catPercent = data.totalBytes > 0 ? ((cat.bytes / data.totalBytes) * 100).toFixed(1) : 0;
                  return (
                    <div 
                      key={cat.key}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 14px',
                        background: 'var(--color-bg)',
                        border: '1px solid var(--color-border)',
                        borderRadius: '10px',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
                        <div style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '8px',
                          background: 'var(--color-bg-secondary)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}>
                          {getCategoryIcon(cat.icon)}
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontWeight: '600', fontSize: '13px', color: 'var(--color-text-primary)' }}>
                            {cat.category}
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {cat.description}
                          </div>
                        </div>
                      </div>

                      <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: '12px' }}>
                        <div style={{ fontWeight: 'bold', fontSize: '13px', color: 'var(--color-text-primary)' }}>
                          {formatBytes(cat.bytes)}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginTop: '1px' }}>
                          {cat.count} record{cat.count === 1 ? '' : 's'} • {catPercent}%
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'flex-end', backgroundColor: 'var(--color-bg-secondary)' }}>
          <button className="btn btn-secondary" onClick={onClose} style={{ padding: '8px 18px', fontSize: '13px' }}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
