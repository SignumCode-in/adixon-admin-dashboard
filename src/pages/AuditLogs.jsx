import React, { useState, useEffect } from 'react';
import { Play, Pause, ChevronDown, ChevronUp, Database, FileCode, Clock, RefreshCw } from 'lucide-react';

const initialLogs = [
  { id: 1, time: '2026-07-14 13:25:01', user: 'Dr. Bruce Wayne', action: 'CREATE_USER', resource: 'User: staff_receptionist', ip: '103.88.92.10', status: 'success', details: { payload: { full_name: 'Alfred Pennyworth', role: 'receptionist', clinic_id: '6a55ce3cf5878a83c6b4e274' }, agent: 'Mozilla/5.0 Chrome/120.0' } },
  { id: 2, time: '2026-07-14 13:24:12', user: 'System Bot', action: 'CLEAR_CACHE', resource: 'Cache: users', ip: '127.0.0.1', status: 'success', details: { trigger: 'clearCacheMiddleware', type: 'node-cache', invalidated_keys: ['users'] } },
  { id: 3, time: '2026-07-14 13:22:45', user: 'Dr. Bruce Wayne', action: 'UPDATE_CLINIC', resource: 'Clinic: City Care Dental', ip: '103.88.92.10', status: 'success', details: { modifications: { phone: '9911882233', visiting_hours: '9 AM - 6 PM' } } },
  { id: 4, time: '2026-07-14 13:20:10', user: 'Unauthenticated Client', action: 'FAILED_LOGIN', resource: 'Auth: login', ip: '185.220.101.5', status: 'failed', details: { error: 'Invalid or expired Firebase token.', email: 'intruder@threat.com' } },
];

export default function AuditLogs() {
  const [logs, setLogs] = useState(initialLogs);
  const [liveMode, setLiveMode] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [filterAction, setFilterAction] = useState('');
  
  // Real-time logs generator simulation
  useEffect(() => {
    if (!liveMode) return;

    const actionsMock = ['GET_USERS', 'GENERATE_TOKEN', 'CREATE_APPOINTMENT', 'UPDATE_PATIENT', 'FETCH_CLINICS'];
    const usersMock = ['Dr. Bruce Wayne', 'Staff Member', 'Developer', 'Clinic Receptionist'];
    const statusMock = ['success', 'success', 'success', 'success', 'failed'];

    const interval = setInterval(() => {
      const act = actionsMock[Math.floor(Math.random() * actionsMock.length)];
      const usr = usersMock[Math.floor(Math.random() * usersMock.length)];
      const stat = statusMock[Math.floor(Math.random() * statusMock.length)];
      
      const newLog = {
        id: Date.now(),
        time: new Date().toISOString().replace('T', ' ').substring(0, 19),
        user: usr,
        action: act,
        resource: `API Route: /api/v1/${act.toLowerCase().split('_')[1] || 'auth'}`,
        ip: `103.88.92.${Math.floor(Math.random() * 254) + 1}`,
        status: stat,
        details: { method: 'POST', response_time: `${Math.floor(Math.random() * 80) + 10}ms`, cache: 'miss' }
      };

      setLogs((prev) => [newLog, ...prev.slice(0, 19)]); // Keep last 20 logs
    }, 4000);

    return () => clearInterval(interval);
  }, [liveMode]);

  const toggleExpand = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const filteredLogs = logs.filter((log) => {
    if (filterAction && !log.action.includes(filterAction)) return false;
    return true;
  });

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Winston & Morgan Audit Logs</h1>
          <p className="page-subtitle">Real-time express logs tracker and security payload inspectors</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            className={`btn ${liveMode ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setLiveMode(!liveMode)}
          >
            {liveMode ? (
              <>
                <Pause size={14} /> Live Stream ON
              </>
            ) : (
              <>
                <Play size={14} /> Live Stream PAUSED
              </>
            )}
          </button>
          <select 
            className="input-field" 
            style={{ width: '150px', padding: '4px 8px', fontSize: '11px' }}
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
          >
            <option value="">All Actions</option>
            <option value="CREATE">CREATE</option>
            <option value="UPDATE">UPDATE</option>
            <option value="FAILED">FAILED</option>
            <option value="GET">GET</option>
          </select>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '16px', display: 'flex', gap: '8px', alignItems: 'center', padding: '10px 16px', fontSize: '11px', color: 'var(--color-text-tertiary)' }}>
        <Clock size={14} />
        <span>Logs are retained for 90 days. Showing last 20 active events.</span>
      </div>

      <div className="table-responsive">
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: '30px' }} />
              <th>Timestamp</th>
              <th>Trigger Entity</th>
              <th>Action Triggered</th>
              <th>Target Resource</th>
              <th>IP Address</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.map((log) => {
              const isExpanded = expandedId === log.id;
              return (
                <React.Fragment key={log.id}>
                  <tr onClick={() => toggleExpand(log.id)} style={{ cursor: 'pointer' }}>
                    <td>
                      {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>{log.time}</td>
                    <td style={{ fontWeight: 'bold' }}>{log.user}</td>
                    <td>
                      <span className={`badge ${
                        log.action.startsWith('FAILED') ? 'badge-danger' : 
                        log.action.startsWith('CREATE') ? 'badge-success' : 'badge-info'
                      }`} style={{ fontSize: '10px' }}>
                        {log.action}
                      </span>
                    </td>
                    <td>{log.resource}</td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>{log.ip}</td>
                    <td>
                      <span className={`badge ${log.status === 'success' ? 'badge-success' : 'badge-danger'}`}>
                        {log.status}
                      </span>
                    </td>
                  </tr>
                  {isExpanded && (
                    <tr>
                      <td colSpan={7} style={{ backgroundColor: 'var(--color-bg-secondary)', padding: '16px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--color-text-secondary)', display: 'flex', gap: '4px', alignItems: 'center' }}>
                            <FileCode size={12} /> Full Log Payload JSON
                          </span>
                          <pre className="audit-details-code">
                            {JSON.stringify({
                              timestamp: log.time,
                              action: log.action,
                              user: log.user,
                              target: log.resource,
                              client_ip: log.ip,
                              status: log.status,
                              metadata: log.details
                            }, null, 2)}
                          </pre>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
