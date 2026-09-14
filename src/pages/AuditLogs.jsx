import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  ChevronDown, 
  ChevronUp, 
  FileCode, 
  Clock, 
  RefreshCw, 
  Search, 
  Activity, 
  Globe, 
  User, 
  Terminal, 
  Copy, 
  Check, 
  X, 
  Eye, 
  Calendar, 
  Layers 
} from 'lucide-react';
import { auditAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useClinic } from '../context/ClinicContext';

// Helper: Format real timestamps to readable local date/time
function formatLocalDateTime(dateString) {
  if (!dateString) return 'N/A';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return String(dateString);
    return d.toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
  } catch {
    return String(dateString);
  }
}

// Helper: Calculate relative time (e.g. "Just now", "2m ago")
function getRelativeTime(dateString) {
  if (!dateString) return '';
  try {
    const diffMs = Date.now() - new Date(dateString).getTime();
    const diffSec = Math.floor(diffMs / 1000);
    if (diffSec < 10) return 'Just now';
    if (diffSec < 60) return `${diffSec}s ago`;
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;
    const diffDays = Math.floor(diffHr / 24);
    return `${diffDays}d ago`;
  } catch {
    return '';
  }
}

// Helper: Method badge color
function getMethodBadgeStyle(method = 'GET') {
  switch (method.toUpperCase()) {
    case 'POST':
      return { background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)' };
    case 'PUT':
    case 'PATCH':
      return { background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.3)' };
    case 'DELETE':
      return { background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)' };
    case 'GET':
    default:
      return { background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6', border: '1px solid rgba(59, 130, 246, 0.3)' };
  }
}

export default function AuditLogs() {
  const { user, isAdmin } = useAuth();
  const { selectedClinicId } = useClinic();

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [liveMode, setLiveMode] = useState(true);
  const [lastSyncTime, setLastSyncTime] = useState(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Expand inline state
  const [expandedId, setExpandedId] = useState(null);

  // Detail Modal for selected request
  const [selectedLog, setSelectedLog] = useState(null);
  const [copiedKey, setCopiedKey] = useState(false);

  const fetchRealLogs = async (isBackground = false) => {
    if (!isBackground) setRefreshing(true);
    try {
      const params = {
        limit: 100,
      };

      if (selectedClinicId && selectedClinicId !== 'all') {
        params.clinic_id = selectedClinicId;
      }
      if (filterAction) {
        params.action = filterAction;
      }
      if (filterStatus) {
        params.status = filterStatus;
      }
      if (searchTerm.trim()) {
        params.search = searchTerm.trim();
      }

      const res = await auditAPI.getLogs(params);
      if (res && res.data) {
        setLogs(res.data);
        setLastSyncTime(new Date());
      }
    } catch (err) {
      console.error('Failed to fetch real audit logs:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial load and filter change
  useEffect(() => {
    fetchRealLogs();
  }, [selectedClinicId, filterAction, filterStatus]);

  // Live real-time polling every 3.5 seconds
  useEffect(() => {
    if (!liveMode) return;

    const interval = setInterval(() => {
      fetchRealLogs(true);
    }, 3500);

    return () => clearInterval(interval);
  }, [liveMode, selectedClinicId, filterAction, filterStatus, searchTerm]);

  const toggleExpand = (id, e) => {
    e.stopPropagation();
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const handleRowClick = (log) => {
    setSelectedLog(log);
    setCopiedKey(false);
  };

  const handleCopyPayload = (data) => {
    if (!data) return;
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  // Client-side search filtering
  const displayLogs = logs.filter((log) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      (log.resource && log.resource.toLowerCase().includes(term)) ||
      (log.action && log.action.toLowerCase().includes(term)) ||
      (log.user_name && log.user_name.toLowerCase().includes(term)) ||
      (log.user_email && log.user_email.toLowerCase().includes(term)) ||
      (log.endpoint && log.endpoint.toLowerCase().includes(term)) ||
      (log.ip && log.ip.includes(term))
    );
  });

  return (
    <div>
      {/* Page Header */}
      <div className="page-header" style={{ marginBottom: '20px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 className="page-title">Real-Time System Audit Logs</h1>
            {liveMode && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '3px 10px',
                  borderRadius: '9999px',
                  fontSize: '11px',
                  fontWeight: 600,
                  background: 'rgba(16, 185, 129, 0.15)',
                  color: '#10b981',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                }}
              >
                <span
                  style={{
                    width: '7px',
                    height: '7px',
                    borderRadius: '50%',
                    background: '#10b981',
                    boxShadow: '0 0 8px #10b981',
                    animation: 'pulse 1.5s infinite',
                  }}
                />
                Live Database Stream
              </span>
            )}
          </div>
          <p className="page-subtitle">
            100% Real API operations, mutations, and database requests captured live from MongoDB
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button
            className="btn btn-secondary"
            onClick={() => fetchRealLogs(false)}
            disabled={refreshing}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            title="Refresh database records"
          >
            <RefreshCw size={14} className={refreshing ? 'breadcrumbs-separator' : ''} />
            {refreshing ? 'Syncing...' : 'Refresh'}
          </button>

          <button
            className={`btn ${liveMode ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setLiveMode(!liveMode)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            {liveMode ? (
              <>
                <Pause size={14} /> Pause Stream
              </>
            ) : (
              <>
                <Play size={14} /> Resume Stream
              </>
            )}
          </button>
        </div>
      </div>

      {/* Filter & Live Status Banner */}
      <div
        className="card"
        style={{
          padding: '14px 18px',
          marginBottom: '16px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '12px',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flex: 1, minWidth: '300px' }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: '320px' }}>
            <input
              type="text"
              className="input-field"
              placeholder="Search user, action, IP, resource..."
              style={{ paddingLeft: '32px', fontSize: '13px' }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search
              size={14}
              style={{
                position: 'absolute',
                left: '10px',
                top: '12px',
                color: 'var(--color-text-tertiary)',
              }}
            />
          </div>

          <select
            className="input-field"
            style={{ width: '160px', padding: '8px 10px', fontSize: '12px' }}
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
          >
            <option value="">All Actions</option>
            <option value="REGISTER">REGISTER</option>
            <option value="CREATE">CREATE</option>
            <option value="UPDATE">UPDATE</option>
            <option value="DELETE">DELETE</option>
            <option value="SCHEDULE">SCHEDULE</option>
            <option value="PROVISION">PROVISION</option>
            <option value="SEARCH">SEARCH</option>
            <option value="AUTH">AUTH / LOGIN</option>
          </select>

          <select
            className="input-field"
            style={{ width: '130px', padding: '8px 10px', fontSize: '12px' }}
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="success">Success</option>
            <option value="warning">Warning</option>
            <option value="error">Error</option>
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '12px', color: 'var(--color-text-secondary)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Clock size={13} />
            {lastSyncTime ? (
              <span>Last sync: <strong>{lastSyncTime.toLocaleTimeString()}</strong></span>
            ) : (
              'Syncing...'
            )}
          </span>
          <span className="badge badge-info" style={{ fontSize: '11px' }}>
            {displayLogs.length} Real Records
          </span>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="table-responsive">
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: '32px' }} />
              <th style={{ minWidth: '180px' }}>Real-Time Timestamp</th>
              <th>HTTP Method</th>
              <th>Trigger Entity</th>
              <th>Action Name</th>
              <th>Target Resource / Endpoint</th>
              <th>Client IP</th>
              <th>Status</th>
              <th style={{ textAlign: 'right', width: '90px' }}>Details</th>
            </tr>
          </thead>
          <tbody>
            {loading && displayLogs.length === 0 ? (
              <tr>
                <td colSpan={9} style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-tertiary)' }}>
                  Connecting to MongoDB cluster and querying real audit logs...
                </td>
              </tr>
            ) : displayLogs.length === 0 ? (
              <tr>
                <td colSpan={9} style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-tertiary)' }}>
                  No audit logs found. As real requests are performed in the app, they appear here live.
                </td>
              </tr>
            ) : (
              displayLogs.map((log) => {
                const isExpanded = expandedId === log._id;
                const methodStyle = getMethodBadgeStyle(log.method);

                return (
                  <React.Fragment key={log._id}>
                    <tr
                      onClick={() => handleRowClick(log)}
                      style={{
                        cursor: 'pointer',
                        transition: 'background-color 0.15s ease',
                      }}
                      className="audit-row"
                      title="Click to view complete request details"
                    >
                      <td onClick={(e) => toggleExpand(log._id, e)}>
                        <button
                          type="button"
                          style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0, color: 'var(--color-text-tertiary)' }}
                        >
                          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>
                      </td>

                      {/* Real-time timestamp with exact local time and relative badge */}
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 600 }}>
                            {formatLocalDateTime(log.createdAt)}
                          </span>
                          <span style={{ fontSize: '11px', color: 'var(--color-text-tertiary)' }}>
                            {getRelativeTime(log.createdAt)}
                          </span>
                        </div>
                      </td>

                      {/* HTTP Method Badge */}
                      <td>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '2px 7px',
                            borderRadius: '4px',
                            fontSize: '11px',
                            fontWeight: 700,
                            fontFamily: 'var(--font-mono)',
                            ...methodStyle,
                          }}
                        >
                          {log.method}
                        </span>
                      </td>

                      {/* Trigger Entity */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <div
                            style={{
                              width: '24px',
                              height: '24px',
                              borderRadius: '6px',
                              background: 'rgba(99, 102, 241, 0.15)',
                              color: '#818cf8',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '11px',
                              fontWeight: 700,
                            }}
                          >
                            {(log.user_name || log.user_email || 'A').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: '13px' }}>
                              {log.user_name || log.user_email || 'Unauthenticated'}
                            </div>
                            <div style={{ fontSize: '11px', color: 'var(--color-text-tertiary)' }}>
                              {log.user_role || (log.user_id ? 'user' : 'anonymous')}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Action Name */}
                      <td>
                        <span
                          className={`badge ${
                            log.action.includes('REGISTER') || log.action.includes('CREATE') || log.action.includes('PROVISION')
                              ? 'badge-success'
                              : log.action.includes('SCHEDULE') || log.action.includes('UPDATE')
                              ? 'badge-info'
                              : log.action.includes('DELETE')
                              ? 'badge-danger'
                              : 'badge-secondary'
                          }`}
                          style={{ fontSize: '11px', letterSpacing: '0.3px' }}
                        >
                          {log.action}
                        </span>
                      </td>

                      {/* Target Resource */}
                      <td style={{ maxWidth: '280px' }}>
                        <div style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', fontWeight: 500 }} title={log.resource || log.endpoint}>
                          {log.resource || log.endpoint}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', fontFamily: 'var(--font-mono)' }}>
                          {log.endpoint}
                        </div>
                      </td>

                      {/* Client IP */}
                      <td>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
                          {log.ip || '-'}
                        </span>
                      </td>

                      {/* Status */}
                      <td>
                        <span
                          className={`badge ${
                            log.status === 'error'
                              ? 'badge-danger'
                              : log.status === 'warning'
                              ? 'badge-warning'
                              : 'badge-success'
                          }`}
                          style={{ fontSize: '11px' }}
                        >
                          {log.status_code || 200} {log.status || 'OK'}
                        </span>
                      </td>

                      {/* Action View button */}
                      <td style={{ textAlign: 'right' }}>
                        <button
                          className="btn btn-secondary"
                          style={{ padding: '4px 8px', fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRowClick(log);
                          }}
                          title="View Request Details"
                        >
                          <Eye size={12} /> View
                        </button>
                      </td>
                    </tr>

                    {/* Quick inline expanded payload preview */}
                    {isExpanded && (
                      <tr>
                        <td colSpan={9} style={{ backgroundColor: 'rgba(0,0,0,0.2)', padding: '16px 20px' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-secondary)', display: 'flex', gap: '6px', alignItems: 'center' }}>
                                <FileCode size={14} color="#818cf8" /> Request Payload & Summary
                              </span>
                              <button
                                className="btn btn-secondary"
                                style={{ padding: '3px 8px', fontSize: '11px' }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRowClick(log);
                                }}
                              >
                                Open Full Inspector Modal
                              </button>
                            </div>
                            <pre className="audit-details-code" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                              {JSON.stringify(
                                {
                                  timestamp: log.createdAt,
                                  action: log.action,
                                  method: log.method,
                                  endpoint: log.endpoint,
                                  user: log.user_name || log.user_email,
                                  role: log.user_role,
                                  client_ip: log.ip,
                                  status_code: log.status_code,
                                  duration_ms: `${log.duration_ms || 0}ms`,
                                  request_body: log.request_body,
                                  request_query: log.request_query,
                                  response_summary: log.response_summary,
                                },
                                null,
                                2
                              )}
                            </pre>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ========================================================================= */}
      {/* REQUEST DETAIL INSPECTOR MODAL ("On click to show the detail of request") */}
      {/* ========================================================================= */}
      {selectedLog && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1050,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(5px)',
            padding: '20px',
          }}
          onClick={() => setSelectedLog(null)}
        >
          <div
            style={{
              background: 'var(--color-surface, #1e293b)',
              color: 'var(--color-text, #f8fafc)',
              borderRadius: '16px',
              width: '100%',
              maxWidth: '820px',
              maxHeight: '90vh',
              border: '1px solid var(--color-border, #334155)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              animation: 'scaleIn 0.15s ease-out',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '18px 24px',
                borderBottom: '1px solid var(--color-border, #334155)',
                background: 'rgba(255, 255, 255, 0.02)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span
                  style={{
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: 700,
                    fontFamily: 'var(--font-mono)',
                    ...getMethodBadgeStyle(selectedLog.method),
                  }}
                >
                  {selectedLog.method}
                </span>
                <div>
                  <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 600 }}>
                    Request Details: {selectedLog.action}
                  </h3>
                  <span style={{ fontSize: '12px', color: 'var(--color-text-secondary, #94a3b8)', fontFamily: 'var(--font-mono)' }}>
                    {selectedLog.endpoint}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span
                  className={`badge ${
                    selectedLog.status === 'error'
                      ? 'badge-danger'
                      : selectedLog.status === 'warning'
                      ? 'badge-warning'
                      : 'badge-success'
                  }`}
                  style={{ fontSize: '12px', padding: '4px 10px' }}
                >
                  HTTP {selectedLog.status_code || 200} ({selectedLog.status || 'success'})
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedLog(null)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--color-text-secondary, #94a3b8)',
                    cursor: 'pointer',
                    padding: '6px',
                    borderRadius: '6px',
                  }}
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div style={{ padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Summary Cards Grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: '12px',
                }}
              >
                {/* Timestamp */}
                <div
                  style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid var(--color-border, #334155)',
                    borderRadius: '10px',
                    padding: '12px 14px',
                  }}
                >
                  <div style={{ fontSize: '11px', color: 'var(--color-text-secondary, #94a3b8)', display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '4px' }}>
                    <Calendar size={12} /> Real Timestamp
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: 600 }}>{formatLocalDateTime(selectedLog.createdAt)}</div>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-tertiary, #64748b)' }}>{getRelativeTime(selectedLog.createdAt)}</div>
                </div>

                {/* Trigger User */}
                <div
                  style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid var(--color-border, #334155)',
                    borderRadius: '10px',
                    padding: '12px 14px',
                  }}
                >
                  <div style={{ fontSize: '11px', color: 'var(--color-text-secondary, #94a3b8)', display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '4px' }}>
                    <User size={12} /> Trigger User
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: 600 }}>
                    {selectedLog.user_name || selectedLog.user_email || 'Unauthenticated'}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-tertiary, #64748b)' }}>
                    Role: {selectedLog.user_role || (selectedLog.user_id ? 'user' : 'anonymous')}
                  </div>
                </div>

                {/* Client IP */}
                <div
                  style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid var(--color-border, #334155)',
                    borderRadius: '10px',
                    padding: '12px 14px',
                  }}
                >
                  <div style={{ fontSize: '11px', color: 'var(--color-text-secondary, #94a3b8)', display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '4px' }}>
                    <Globe size={12} /> Client IP
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
                    {selectedLog.ip || 'Not recorded'}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-tertiary, #64748b)' }}>Remote Address</div>
                </div>

                {/* Latency */}
                <div
                  style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid var(--color-border, #334155)',
                    borderRadius: '10px',
                    padding: '12px 14px',
                  }}
                >
                  <div style={{ fontSize: '11px', color: 'var(--color-text-secondary, #94a3b8)', display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '4px' }}>
                    <Activity size={12} /> Execution Latency
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#10b981' }}>
                    {selectedLog.duration_ms || 0} ms
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-tertiary, #64748b)' }}>Roundtrip Time</div>
                </div>
              </div>

              {/* Resource & Clinic association */}
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--color-border, #334155)',
                  borderRadius: '10px',
                  padding: '14px 18px',
                }}
              >
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
                  <div style={{ flex: 1, minWidth: '200px' }}>
                    <span style={{ fontSize: '11px', color: 'var(--color-text-secondary, #94a3b8)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Target Resource
                    </span>
                    <p style={{ margin: '4px 0 0 0', fontSize: '14px', fontWeight: 600 }}>
                      {selectedLog.resource || selectedLog.endpoint}
                    </p>
                  </div>
                  {selectedLog.clinic_name && (
                    <div style={{ flex: 1, minWidth: '200px' }}>
                      <span style={{ fontSize: '11px', color: 'var(--color-text-secondary, #94a3b8)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Associated Clinic
                      </span>
                      <p style={{ margin: '4px 0 0 0', fontSize: '14px', fontWeight: 600 }}>
                        {selectedLog.clinic_name}
                      </p>
                    </div>
                  )}
                  {selectedLog.user_agent && (
                    <div style={{ width: '100%' }}>
                      <span style={{ fontSize: '11px', color: 'var(--color-text-secondary, #94a3b8)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        User Agent / Client
                      </span>
                      <p style={{ margin: '4px 0 0 0', fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--color-text-tertiary, #64748b)' }}>
                        {selectedLog.user_agent}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Request Body Payload Section */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <FileCode size={15} color="#818cf8" /> Request Payload (Body)
                  </span>
                  <button
                    className="btn btn-secondary"
                    onClick={() => handleCopyPayload(selectedLog.request_body)}
                    style={{ padding: '4px 10px', fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                  >
                    {copiedKey ? (
                      <>
                        <Check size={12} color="#10b981" /> Copied!
                      </>
                    ) : (
                      <>
                        <Copy size={12} /> Copy JSON
                      </>
                    )}
                  </button>
                </div>

                <pre
                  style={{
                    background: '#090d16',
                    color: '#e2e8f0',
                    border: '1px solid #1e293b',
                    borderRadius: '10px',
                    padding: '14px',
                    fontSize: '12px',
                    fontFamily: 'var(--font-mono)',
                    maxHeight: '220px',
                    overflowY: 'auto',
                    lineHeight: 1.5,
                  }}
                >
                  {selectedLog.request_body && Object.keys(selectedLog.request_body).length > 0
                    ? JSON.stringify(selectedLog.request_body, null, 2)
                    : '// No request body payload sent with this operation.'}
                </pre>
              </div>

              {/* Query Parameters Section (if any) */}
              {selectedLog.request_query && Object.keys(selectedLog.request_query).length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Terminal size={15} color="#06b6d4" /> Request Query Parameters
                  </span>
                  <pre
                    style={{
                      background: '#090d16',
                      color: '#e2e8f0',
                      border: '1px solid #1e293b',
                      borderRadius: '10px',
                      padding: '14px',
                      fontSize: '12px',
                      fontFamily: 'var(--font-mono)',
                      maxHeight: '120px',
                      overflowY: 'auto',
                      lineHeight: 1.5,
                    }}
                  >
                    {JSON.stringify(selectedLog.request_query, null, 2)}
                  </pre>
                </div>
              )}

              {/* Response Summary Section */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <span style={{ fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Layers size={15} color="#10b981" /> Response & Mutation Metadata
                </span>
                <pre
                  style={{
                    background: '#090d16',
                    color: '#e2e8f0',
                    border: '1px solid #1e293b',
                    borderRadius: '10px',
                    padding: '14px',
                    fontSize: '12px',
                    fontFamily: 'var(--font-mono)',
                    maxHeight: '160px',
                    overflowY: 'auto',
                    lineHeight: 1.5,
                  }}
                >
                  {selectedLog.response_summary && Object.keys(selectedLog.response_summary).length > 0
                    ? JSON.stringify(selectedLog.response_summary, null, 2)
                    : JSON.stringify(
                        {
                          status_code: selectedLog.status_code || 200,
                          status: selectedLog.status || 'success',
                          duration_ms: selectedLog.duration_ms || 0,
                          timestamp: selectedLog.createdAt,
                        },
                        null,
                        2
                      )}
                </pre>
              </div>
            </div>

            {/* Modal Footer */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '14px 24px',
                borderTop: '1px solid var(--color-border, #334155)',
                background: 'rgba(255, 255, 255, 0.02)',
              }}
            >
              <span style={{ fontSize: '12px', color: 'var(--color-text-secondary, #94a3b8)', fontFamily: 'var(--font-mono)' }}>
                Audit Record ID: {selectedLog._id}
              </span>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setSelectedLog(null)}
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
