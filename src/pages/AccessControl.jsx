import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Plus, 
  Trash2, 
  Search, 
  RefreshCw, 
  Users, 
  Radio, 
  Activity, 
  CheckCircle2, 
  AlertTriangle, 
  Globe, 
  Laptop, 
  Smartphone, 
  Ban, 
  Power, 
  Filter,
  ArrowUpDown,
  Lock,
  Unlock,
  Building,
  Building2,
  Clock,
  LayoutGrid,
  List,
  Monitor
} from 'lucide-react';
import { firewallAPI, sessionAPI, clinicAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';

export default function AccessControl() {
  const { user: currentUser } = useAuth();

  // Tabs: 'traffic' | 'firewall' | 'sessions'
  const [activeTab, setActiveTab] = useState('traffic');

  // Loading and feedback states
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // 1. Live Server Traffic State
  const [trafficData, setTrafficData] = useState([]);
  const [totalUniqueIps, setTotalUniqueIps] = useState(0);
  const [trafficSearch, setTrafficSearch] = useState('');

  // 2. Firewall Rules State
  const [firewallRules, setFirewallRules] = useState([]);
  const [firewallSearch, setFirewallSearch] = useState('');
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [blockIpInput, setBlockIpInput] = useState('');
  const [blockReasonInput, setBlockReasonInput] = useState('');
  const [testIpInput, setTestIpInput] = useState('');
  const [testIpResult, setTestIpResult] = useState(null);

  // 3. Sessions State
  const [sessions, setSessions] = useState([]);
  const [totalActiveSessions, setTotalActiveSessions] = useState(0);
  const [sessionSearch, setSessionSearch] = useState('');
  const [sessionStatusFilter, setSessionStatusFilter] = useState('active');
  const [sessionRoleFilter, setSessionRoleFilter] = useState('');
  const [sessionClinicFilter, setSessionClinicFilter] = useState('');
  const [clinicsList, setClinicsList] = useState([]);
  const [sessionDisplayMode, setSessionDisplayMode] = useState('list');

  // Confirm Terminate / Unblock Modal State
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    type: null, // 'terminate_session' | 'unblock_ip' | 'terminate_clinic'
    targetId: null,
    targetLabel: '',
    title: '',
    message: ''
  });

  // Load live traffic from backend
  const loadTraffic = async () => {
    try {
      const res = await firewallAPI.getLiveTraffic();
      if (res && res.data) {
        setTrafficData(res.data.traffic || []);
        setTotalUniqueIps(res.data.total_unique_ips || 0);
      }
    } catch (err) {
      console.error('Failed to load live traffic:', err);
    }
  };

  // Load firewall rules from backend
  const loadRules = async () => {
    try {
      const res = await firewallAPI.getFirewallRules();
      if (res && res.data) {
        setFirewallRules(res.data || []);
      }
    } catch (err) {
      console.error('Failed to load firewall rules:', err);
    }
  };

  // Load active sessions from backend
  const loadSessions = async () => {
    try {
      const params = {};
      if (sessionRoleFilter) params.role = sessionRoleFilter;
      if (sessionClinicFilter) params.clinic_id = sessionClinicFilter;
      if (sessionSearch) params.search = sessionSearch;

      const res = await sessionAPI.getSessions(params);
      if (res && res.data) {
        setSessions(res.data.sessions || []);
        setTotalActiveSessions(res.data.active_sessions || 0);
      }
    } catch (err) {
      console.error('Failed to load sessions:', err);
    }
  };

  // Load clinics list for filter dropdown
  const loadClinics = async () => {
    try {
      const res = await clinicAPI.getClinics();
      const list = Array.isArray(res?.data) ? res.data : (res?.data?.data || []);
      setClinicsList(list);
    } catch (err) {
      console.warn('Failed to load clinics list:', err);
    }
  };

  // Main initial loader
  const refreshAllData = async () => {
    setLoading(true);
    setError('');
    try {
      await Promise.allSettled([
        loadTraffic(),
        loadRules(),
        loadSessions(),
        loadClinics()
      ]);
    } catch (err) {
      setError('Failed to fetch security and firewall data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshAllData();
    // Auto-poll traffic and sessions every 15 seconds
    const interval = setInterval(() => {
      loadTraffic();
      loadRules();
      loadSessions();
    }, 15000);
    return () => clearInterval(interval);
  }, [sessionRoleFilter, sessionClinicFilter]);

  // Handle Blocking an IP
  const handleBlockIp = async (e) => {
    if (e) e.preventDefault();
    if (!blockIpInput || !blockIpInput.trim()) return;

    setActionLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await firewallAPI.blockIp({
        ip: blockIpInput.trim(),
        reason: blockReasonInput.trim() || 'Blocked by platform security administrator'
      });
      setSuccess(res.message || `IP ${blockIpInput.trim()} has been blocked.`);
      setBlockIpInput('');
      setBlockReasonInput('');
      setShowBlockModal(false);
      await Promise.all([loadRules(), loadTraffic()]);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to block IP address.');
    } finally {
      setActionLoading(false);
    }
  };

  // Open direct block modal from a row
  const openBlockForIp = (ip) => {
    setBlockIpInput(ip);
    setBlockReasonInput('Immediate manual firewall block from live server traffic');
    setShowBlockModal(true);
  };

  // Handle Unblocking an IP
  const handleConfirmUnblock = async () => {
    const { targetId } = confirmModal;
    if (!targetId) return;

    setActionLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await firewallAPI.unblockIp(targetId);
      setSuccess(res.message || 'IP unblocked successfully.');
      setConfirmModal({ isOpen: false, type: null, targetId: null, targetLabel: '', title: '', message: '' });
      await Promise.all([loadRules(), loadTraffic()]);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to unblock IP address.');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Terminating a Session
  const handleConfirmTerminateSession = async () => {
    const { targetId, type } = confirmModal;
    if (!targetId) return;

    setActionLoading(true);
    setError('');
    setSuccess('');
    try {
      if (type === 'terminate_session') {
        const res = await sessionAPI.terminateSession(targetId, 'Revoked by platform administrator');
        setSuccess(res.message || 'Session terminated successfully.');
      } else if (type === 'terminate_clinic') {
        const res = await sessionAPI.terminateClinicSessions(targetId, 'All clinic sessions terminated by administrator');
        setSuccess(res.message || 'All clinic sessions terminated.');
      }
      setConfirmModal({ isOpen: false, type: null, targetId: null, targetLabel: '', title: '', message: '' });
      await loadSessions();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to terminate session.');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle IP CIDR / Firewall Rule Test Tool
  const handleTestIpAgainstFirewall = (e) => {
    e.preventDefault();
    if (!testIpInput || !testIpInput.trim()) {
      setTestIpResult(null);
      return;
    }
    const cleanIp = testIpInput.trim();
    const matched = firewallRules.find(r => r.ip === cleanIp || (cleanIp.startsWith('127.') && r.ip.startsWith('127.')));
    if (matched) {
      setTestIpResult({
        blocked: true,
        ip: cleanIp,
        rule: matched,
        message: `Traffic BLOCKED. Matches firewall rule ${matched.ip} (${matched.reason || 'Restricted'}).`
      });
    } else {
      setTestIpResult({
        blocked: false,
        ip: cleanIp,
        message: `Traffic ALLOWED. No blocking rule applies to ${cleanIp}.`
      });
    }
  };

  // Filtered Traffic
  const filteredTraffic = trafficData.filter(t => {
    if (!trafficSearch.trim()) return true;
    const s = trafficSearch.toLowerCase();
    return (
      t.ip?.toLowerCase().includes(s) ||
      t.last_user_name?.toLowerCase().includes(s) ||
      t.last_endpoint?.toLowerCase().includes(s)
    );
  });

  // Filtered Firewall Rules
  const filteredRules = firewallRules.filter(r => {
    if (!firewallSearch.trim()) return true;
    const s = firewallSearch.toLowerCase();
    return r.ip?.toLowerCase().includes(s) || r.reason?.toLowerCase().includes(s);
  });

  // Format session timestamp with realistic date/time and relative ago indicator
  const formatSessionTime = (dateStr) => {
    if (!dateStr) return { formatted: 'N/A', relative: '' };
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return { formatted: 'N/A', relative: '' };
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    
    const diffMs = Math.max(0, now.getTime() - d.getTime());
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    let relativeStr = '';
    if (diffMins < 1) relativeStr = 'Just now';
    else if (diffMins < 60) relativeStr = `${diffMins}m ago`;
    else if (diffHours < 24 && isToday) relativeStr = `${diffHours}h ago`;
    else if (diffDays === 1) relativeStr = 'Yesterday';
    else relativeStr = `${diffDays}d ago`;

    const timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const formatted = isToday 
      ? `Today, ${timeStr}`
      : `${d.toLocaleDateString([], { month: 'short', day: '2-digit', year: 'numeric' })}, ${timeStr}`;

    return { formatted, relative: relativeStr };
  };

  // Helper: Device icon based on device_info and user_agent
  const getDeviceIcon = (deviceInfo = '', userAgent = '') => {
    const str = (deviceInfo + ' ' + userAgent).toLowerCase();
    if (str.includes('iphone') || str.includes('android') || str.includes('mobile')) {
      return <Smartphone size={15} style={{ color: '#0284c7', flexShrink: 0 }} />;
    }
    if (str.includes('mac') || str.includes('windows') || str.includes('linux') || str.includes('desktop')) {
      return <Laptop size={15} style={{ color: '#6366f1', flexShrink: 0 }} />;
    }
    if (str.includes('command center') || str.includes('portal') || str.includes('web')) {
      return <Monitor size={15} style={{ color: '#0d9488', flexShrink: 0 }} />;
    }
    return <Globe size={15} style={{ color: '#64748b', flexShrink: 0 }} />;
  };

  // Helper: User initials
  const getUserInitials = (name = '') => {
    if (!name) return 'U';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0].slice(0, 2).toUpperCase();
  };

  // Helper: Role badge & avatar colors
  const getRoleBadgeInfo = (role = '', isPrimary = false) => {
    if (role === 'doctor') {
      return {
        label: isPrimary ? 'Primary Doctor' : 'Doctor',
        bg: 'rgba(15, 118, 110, 0.1)',
        color: '#0f766e',
        border: 'rgba(15, 118, 110, 0.25)',
        avatarBg: 'rgba(15, 118, 110, 0.15)',
        avatarColor: '#0f766e'
      };
    }
    if (role === 'admin') {
      return {
        label: 'Platform Admin',
        bg: 'rgba(124, 58, 237, 0.1)',
        color: '#7c3aed',
        border: 'rgba(124, 58, 237, 0.25)',
        avatarBg: 'rgba(124, 58, 237, 0.15)',
        avatarColor: '#7c3aed'
      };
    }
    return {
      label: 'Clinic Staff',
      bg: 'rgba(217, 119, 6, 0.1)',
      color: '#d97706',
      border: 'rgba(217, 119, 6, 0.25)',
      avatarBg: 'rgba(217, 119, 6, 0.15)',
      avatarColor: '#d97706'
    };
  };

  // Filtered Sessions
  const filteredSessions = sessions.filter(s => {
    if (sessionStatusFilter && s.status !== sessionStatusFilter) {
      return false;
    }
    if (sessionRoleFilter && s.user_id?.role !== sessionRoleFilter) {
      return false;
    }
    if (sessionClinicFilter) {
      const cId = s.clinic_id?._id || s.clinic_id;
      if (String(cId) !== String(sessionClinicFilter)) return false;
    }
    if (!sessionSearch.trim()) return true;
    const q = sessionSearch.toLowerCase();
    return (
      s.user_id?.full_name?.toLowerCase().includes(q) ||
      s.user_id?.email?.toLowerCase().includes(q) ||
      s.clinic_id?.name?.toLowerCase().includes(q) ||
      s.ip_address?.includes(q) ||
      s.device_info?.toLowerCase().includes(q)
    );
  });

  const isCurrentSession = (s) => {
    if (!currentUser) return false;
    const currentId = currentUser._id || currentUser.id;
    const sessionUserId = s.user_id?._id || s.user_id?.id || s.user_id;
    return (
      (currentId && String(currentId) === String(sessionUserId)) ||
      (currentUser.email && s.user_id?.email && currentUser.email.toLowerCase() === s.user_id.email.toLowerCase())
    );
  };

  const isLocalIp = (ip) => {
    return ip === '127.0.0.1' || ip === 'localhost' || ip?.startsWith('192.168.') || ip?.startsWith('10.') || ip === '::1';
  };

  return (
    <div style={{ paddingBottom: '60px' }}>
      {/* Top Header */}
      <div className="page-header" style={{ marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 className="page-title">Firewall & Session Governance</h1>
            <span className="badge-pill badge-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '11px' }}>
              <ShieldCheck size={13} /> Active Enforcement
            </span>
          </div>
          <p className="page-subtitle">
            Inspect live server client IP traffic, enforce immediate firewall blocklists, and monitor or terminate active clinic & staff user sessions.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            className="btn btn-secondary" 
            onClick={refreshAllData}
            disabled={loading}
            style={{ fontSize: '13px', gap: '6px' }}
          >
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
            {loading ? 'Refreshing...' : 'Live Refresh'}
          </button>
          <button 
            className="btn btn-primary" 
            onClick={() => {
              setBlockIpInput('');
              setBlockReasonInput('');
              setShowBlockModal(true);
            }}
            style={{ fontSize: '13px', gap: '6px' }}
          >
            <Ban size={14} /> Block IP / Subnet
          </button>
        </div>
      </div>

      {/* Notifications */}
      {success && (
        <div className="badge badge-success" style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px' }}>
          <CheckCircle2 size={16} /> {success}
        </div>
      )}

      {error && (
        <div className="badge badge-danger" style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px' }}>
          <AlertTriangle size={16} /> {error}
        </div>
      )}

      {/* Security Metrics Overview KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div className="card" style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(15, 118, 110, 0.1)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Radio size={22} />
          </div>
          <div>
            <span style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Unique Client IPs
            </span>
            <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--color-text-primary)' }}>
              {totalUniqueIps}
            </div>
            <span style={{ fontSize: '11px', color: '#10b981' }}>Live backend connections</span>
          </div>
        </div>

        <div className="card" style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShieldAlert size={22} />
          </div>
          <div>
            <span style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Blocked IP Rules
            </span>
            <div style={{ fontSize: '24px', fontWeight: '800', color: '#ef4444' }}>
              {firewallRules.length}
            </div>
            <span style={{ fontSize: '11px', color: 'var(--color-text-tertiary)' }}>Blocked at Express gateway</span>
          </div>
        </div>

        <div className="card" style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(2, 132, 199, 0.1)', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Users size={22} />
          </div>
          <div>
            <span style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Active Clinic Sessions
            </span>
            <div style={{ fontSize: '24px', fontWeight: '800', color: '#0284c7' }}>
              {totalActiveSessions}
            </div>
            <span style={{ fontSize: '11px', color: 'var(--color-text-tertiary)' }}>Doctors & staff signed in</span>
          </div>
        </div>

        <div className="card" style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Activity size={22} />
          </div>
          <div>
            <span style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Firewall Defense
            </span>
            <div style={{ fontSize: '18px', fontWeight: '700', color: '#10b981', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block' }} />
              Active
            </div>
            <span style={{ fontSize: '11px', color: 'var(--color-text-tertiary)' }}>Microsecond In-Memory Cache</span>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--color-border)', marginBottom: '20px', gap: '8px' }}>
        <button
          className={`tab-btn ${activeTab === 'traffic' ? 'active' : ''}`}
          onClick={() => { setActiveTab('traffic'); setError(''); setSuccess(''); }}
          style={{
            padding: '10px 18px',
            border: 'none',
            background: 'transparent',
            fontWeight: activeTab === 'traffic' ? '700' : '500',
            color: activeTab === 'traffic' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
            borderBottom: activeTab === 'traffic' ? '2px solid var(--color-primary)' : '2px solid transparent',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '14px'
          }}
        >
          <Radio size={16} /> Live Server IP Traffic ({trafficData.length})
        </button>

        <button
          className={`tab-btn ${activeTab === 'firewall' ? 'active' : ''}`}
          onClick={() => { setActiveTab('firewall'); setError(''); setSuccess(''); }}
          style={{
            padding: '10px 18px',
            border: 'none',
            background: 'transparent',
            fontWeight: activeTab === 'firewall' ? '700' : '500',
            color: activeTab === 'firewall' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
            borderBottom: activeTab === 'firewall' ? '2px solid var(--color-primary)' : '2px solid transparent',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '14px'
          }}
        >
          <ShieldAlert size={16} /> Firewall Blocked IPs ({firewallRules.length})
        </button>

        <button
          className={`tab-btn ${activeTab === 'sessions' ? 'active' : ''}`}
          onClick={() => { setActiveTab('sessions'); setError(''); setSuccess(''); }}
          style={{
            padding: '10px 18px',
            border: 'none',
            background: 'transparent',
            fontWeight: activeTab === 'sessions' ? '700' : '500',
            color: activeTab === 'sessions' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
            borderBottom: activeTab === 'sessions' ? '2px solid var(--color-primary)' : '2px solid transparent',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '14px'
          }}
        >
          <Users size={16} /> Clinic & Staff Sessions ({totalActiveSessions})
        </button>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: LIVE SERVER IP TRAFFIC                            */}
      {/* ======================================================== */}
      {activeTab === 'traffic' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ position: 'relative', width: '320px' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-tertiary)' }} />
              <input
                type="text"
                className="input-field"
                placeholder="Search IP, endpoint, or user..."
                value={trafficSearch}
                onChange={(e) => setTrafficSearch(e.target.value)}
                style={{ paddingLeft: '36px' }}
              />
            </div>

            <div style={{ fontSize: '13px', color: 'var(--color-text-tertiary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Activity size={14} className="spin" style={{ color: '#10b981' }} />
              Aggregated from live request audits across all connected clients
            </div>
          </div>

          <div className="table-responsive">
            <table className="data-table">
                <thead>
                  <tr>
                    <th>Client IP Address</th>
                    <th>Type</th>
                    <th>Total Requests</th>
                    <th>Status Breakdown</th>
                    <th>Last Active User</th>
                    <th>Latest Endpoint</th>
                    <th>Last Seen</th>
                    <th>Firewall Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTraffic.length === 0 ? (
                    <tr>
                      <td colSpan="9" style={{ textAlign: 'center', padding: '36px', color: 'var(--color-text-tertiary)' }}>
                        No client IP traffic recorded yet. Traffic will appear automatically as clients make requests.
                      </td>
                    </tr>
                  ) : (
                    filteredTraffic.map((item) => (
                      <tr key={item.ip}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Globe size={16} style={{ color: isLocalIp(item.ip) ? '#0d9488' : '#6366f1' }} />
                            <strong style={{ fontFamily: 'monospace', fontSize: '13px' }}>{item.ip}</strong>
                          </div>
                        </td>
                        <td>
                          <span className={`badge-pill ${isLocalIp(item.ip) ? 'badge-primary' : 'badge-secondary'}`} style={{ fontSize: '11px' }}>
                            {isLocalIp(item.ip) ? 'Local / LAN' : 'Public WAN'}
                          </span>
                        </td>
                        <td>
                          <span style={{ fontWeight: '700', fontSize: '13px' }}>{item.total_requests}</span> hits
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '4px', fontSize: '11px' }}>
                            <span style={{ color: '#10b981', fontWeight: '600' }}>2xx: {item.status_breakdown.success}</span>
                            {item.status_breakdown.client_error > 0 && (
                              <span style={{ color: '#f59e0b', fontWeight: '600' }}>• 4xx: {item.status_breakdown.client_error}</span>
                            )}
                            {item.status_breakdown.server_error > 0 && (
                              <span style={{ color: '#ef4444', fontWeight: '600' }}>• 5xx: {item.status_breakdown.server_error}</span>
                            )}
                          </div>
                        </td>
                        <td>
                          <div>
                            <span style={{ fontWeight: '600', fontSize: '13px', display: 'block' }}>
                              {item.last_user_name || 'Anonymous Client'}
                            </span>
                            {item.last_user_role && (
                              <span className="badge-pill" style={{ fontSize: '10px', padding: '1px 5px' }}>
                                {item.last_user_role}
                              </span>
                            )}
                          </div>
                        </td>
                        <td>
                          <span style={{ fontFamily: 'monospace', fontSize: '11px', color: 'var(--color-text-secondary)', background: 'var(--color-bg-secondary)', padding: '2px 6px', borderRadius: '4px' }}>
                            {item.last_endpoint || '/'}
                          </span>
                        </td>
                        <td>
                          <span style={{ fontSize: '12px', color: 'var(--color-text-tertiary)' }}>
                            {new Date(item.last_seen).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                          </span>
                        </td>
                        <td>
                          {item.is_blocked ? (
                            <span className="badge-pill badge-danger" style={{ fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              <ShieldAlert size={12} /> Blocked
                            </span>
                          ) : (
                            <span className="badge-pill badge-success" style={{ fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              <ShieldCheck size={12} /> Allowed
                            </span>
                          )}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          {item.is_blocked ? (
                            <button
                              className="btn btn-secondary"
                              style={{ fontSize: '11px', padding: '4px 10px', gap: '4px' }}
                              onClick={() => {
                                setConfirmModal({
                                  isOpen: true,
                                  type: 'unblock_ip',
                                  targetId: item.ip,
                                  targetLabel: item.ip,
                                  title: 'Unblock IP Address',
                                  message: `Are you sure you want to unblock IP ${item.ip}? It will immediately regain access to the server.`
                                });
                              }}
                            >
                              <Unlock size={12} /> Unblock
                            </button>
                          ) : (
                            <button
                              className="btn btn-danger"
                              style={{ fontSize: '11px', padding: '4px 10px', gap: '4px' }}
                              onClick={() => openBlockForIp(item.ip)}
                            >
                              <Ban size={12} /> Block IP
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: FIREWALL BLOCKED IPS & RULES                      */}
      {/* ======================================================== */}
      {activeTab === 'firewall' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', alignItems: 'start' }}>
            {/* Left: Active Rules Table */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ position: 'relative', width: '280px' }}>
                  <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-tertiary)' }} />
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Search blocked IPs or reasons..."
                    value={firewallSearch}
                    onChange={(e) => setFirewallSearch(e.target.value)}
                    style={{ paddingLeft: '36px' }}
                  />
                </div>

                <span style={{ fontSize: '13px', color: 'var(--color-text-tertiary)' }}>
                  {filteredRules.length} Active Block Rules
                </span>
              </div>

              <div className="table-responsive">
                <table className="data-table">
                    <thead>
                      <tr>
                        <th>Blocked IP / Subnet</th>
                        <th>Type</th>
                        <th>Reason</th>
                        <th>Blocked Date</th>
                        <th style={{ textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRules.length === 0 ? (
                        <tr>
                          <td colSpan="5" style={{ textAlign: 'center', padding: '36px', color: 'var(--color-text-tertiary)' }}>
                            No IP addresses are currently blocked by the firewall.
                          </td>
                        </tr>
                      ) : (
                        filteredRules.map((rule) => (
                          <tr key={rule._id}>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Ban size={15} style={{ color: '#ef4444' }} />
                                <strong style={{ fontFamily: 'monospace', fontSize: '13px', color: '#ef4444' }}>
                                  {rule.ip}
                                </strong>
                              </div>
                            </td>
                            <td>
                              <span className="badge-pill badge-danger" style={{ fontSize: '11px' }}>
                                Deny / 403
                              </span>
                            </td>
                            <td>
                              <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                                {rule.reason || 'Manual administrative rule'}
                              </span>
                            </td>
                            <td>
                              <span style={{ fontSize: '12px', color: 'var(--color-text-tertiary)' }}>
                                {new Date(rule.createdAt).toLocaleDateString()}
                              </span>
                            </td>
                            <td style={{ textAlign: 'right' }}>
                              <button
                                className="btn btn-secondary"
                                style={{ fontSize: '11px', padding: '4px 10px', gap: '4px' }}
                                onClick={() => {
                                  setConfirmModal({
                                    isOpen: true,
                                    type: 'unblock_ip',
                                    targetId: rule._id,
                                    targetLabel: rule.ip,
                                    title: 'Unblock IP Address',
                                    message: `Are you sure you want to unblock ${rule.ip}? Traffic from this IP will immediately be permitted.`
                                  });
                                }}
                              >
                                <Unlock size={12} /> Unblock
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            {/* Right: Manual Block Form & Testing Utility */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Add Block Form Card */}
              <div className="card" style={{ padding: '20px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-text-primary)' }}>
                  <ShieldAlert size={18} style={{ color: '#ef4444' }} />
                  Add Firewall Block Rule
                </h3>

                <form onSubmit={handleBlockIp}>
                  <div className="form-group" style={{ marginBottom: '12px' }}>
                    <label className="form-label" style={{ fontWeight: '600', fontSize: '12px' }}>
                      IP Address or Subnet
                    </label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="e.g. 192.168.1.50 or 45.33.32.15"
                      value={blockIpInput}
                      onChange={(e) => setBlockIpInput(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: '16px' }}>
                    <label className="form-label" style={{ fontWeight: '600', fontSize: '12px' }}>
                      Reason for Blocking
                    </label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="e.g. Rate limit abuse, bot attacks..."
                      value={blockReasonInput}
                      onChange={(e) => setBlockReasonInput(e.target.value)}
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn btn-danger"
                    disabled={actionLoading || !blockIpInput.trim()}
                    style={{ width: '100%', justifyContent: 'center', gap: '6px' }}
                  >
                    {actionLoading ? <RefreshCw size={14} className="spin" /> : <Ban size={14} />}
                    Enforce Block Rule
                  </button>
                </form>
              </div>

              {/* Firewall Policy Verification Tool */}
              <div className="card" style={{ padding: '20px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-text-primary)' }}>
                  <Activity size={18} style={{ color: 'var(--color-primary)' }} />
                  Test IP Against Firewall
                </h3>
                <p style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', marginBottom: '12px' }}>
                  Simulate whether a client IP address would be blocked or admitted by active policies.
                </p>

                <form onSubmit={handleTestIpAgainstFirewall}>
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="Enter IP to test (e.g. 127.0.0.1)..."
                      value={testIpInput}
                      onChange={(e) => setTestIpInput(e.target.value)}
                    />
                    <button type="submit" className="btn btn-secondary" style={{ padding: '6px 14px', fontSize: '13px' }}>
                      Test
                    </button>
                  </div>
                </form>

                {testIpResult && (
                  <div 
                    style={{
                      padding: '12px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: '600',
                      backgroundColor: testIpResult.blocked ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                      color: testIpResult.blocked ? '#ef4444' : '#10b981',
                      border: `1px solid ${testIpResult.blocked ? '#ef4444' : '#10b981'}`
                    }}
                  >
                    {testIpResult.message}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: CLINIC & STAFF SESSION MANAGEMENT                 */}
      {/* ======================================================== */}
      {activeTab === 'sessions' && (
        <div>
          {/* Controls & Filter Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', flex: 1, alignItems: 'center' }}>
              <div style={{ position: 'relative', width: '270px' }}>
                <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-tertiary)' }} />
                <input
                  type="text"
                  className="input-field"
                  placeholder="Search user, email, IP, device..."
                  value={sessionSearch}
                  onChange={(e) => setSessionSearch(e.target.value)}
                  style={{ paddingLeft: '36px' }}
                />
              </div>

              {/* Status filter */}
              <select
                className="input-field"
                style={{ width: '175px' }}
                value={sessionStatusFilter}
                onChange={(e) => setSessionStatusFilter(e.target.value)}
              >
                <option value="active">Active Sessions ({totalActiveSessions})</option>
                <option value="">All Statuses ({sessions.length})</option>
                <option value="expired">Expired / Idle</option>
                <option value="revoked">Revoked</option>
              </select>

              {/* Role filter */}
              <select
                className="input-field"
                style={{ width: '140px' }}
                value={sessionRoleFilter}
                onChange={(e) => setSessionRoleFilter(e.target.value)}
              >
                <option value="">All Roles</option>
                <option value="doctor">Doctors</option>
                <option value="staff">Staff Members</option>
                <option value="admin">Master Admins</option>
              </select>

              {/* Clinic filter */}
              <select
                className="input-field"
                style={{ width: '180px' }}
                value={sessionClinicFilter}
                onChange={(e) => setSessionClinicFilter(e.target.value)}
              >
                <option value="">All Clinics</option>
                {clinicsList.map(c => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              {/* View Toggle (List / Grid) */}
              <div style={{ display: 'inline-flex', border: '1px solid var(--color-border)', borderRadius: '8px', overflow: 'hidden', background: 'var(--color-bg-primary)' }}>
                <button
                  type="button"
                  onClick={() => setSessionDisplayMode('list')}
                  style={{
                    padding: '7px 13px',
                    border: 'none',
                    background: sessionDisplayMode === 'list' ? 'rgba(15, 118, 110, 0.12)' : 'transparent',
                    color: sessionDisplayMode === 'list' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                    fontWeight: sessionDisplayMode === 'list' ? '600' : 'normal',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '12px'
                  }}
                  title="Table List View"
                >
                  <List size={15} /> List
                </button>
                <button
                  type="button"
                  onClick={() => setSessionDisplayMode('grid')}
                  style={{
                    padding: '7px 13px',
                    border: 'none',
                    background: sessionDisplayMode === 'grid' ? 'rgba(15, 118, 110, 0.12)' : 'transparent',
                    color: sessionDisplayMode === 'grid' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                    fontWeight: sessionDisplayMode === 'grid' ? '600' : 'normal',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '12px'
                  }}
                  title="Card Grid View"
                >
                  <LayoutGrid size={15} /> Grid
                </button>
              </div>

              {sessionClinicFilter && (
                <button
                  className="btn btn-danger"
                  style={{ fontSize: '12px', gap: '6px' }}
                  onClick={() => {
                    const targetClinic = clinicsList.find(c => c._id === sessionClinicFilter);
                    setConfirmModal({
                      isOpen: true,
                      type: 'terminate_clinic',
                      targetId: sessionClinicFilter,
                      targetLabel: targetClinic?.name || 'Selected Clinic',
                      title: 'Terminate All Clinic Sessions',
                      message: `Are you sure you want to terminate all active sessions for ${targetClinic?.name || 'this clinic'}? All doctors and staff in this clinic will be logged out immediately.`
                    });
                  }}
                >
                  <Power size={14} /> Terminate All Clinic Sessions
                </button>
              )}
            </div>
          </div>

          {/* Empty State */}
          {filteredSessions.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '50px 20px' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'var(--color-bg-secondary)', color: 'var(--color-text-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <Users size={26} />
              </div>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--color-text-primary)', marginBottom: '6px' }}>
                No user sessions found
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', maxWidth: '420px', margin: '0 auto 16px' }}>
                {sessionStatusFilter === 'active' 
                  ? 'There are currently no active clinic or staff sessions online.' 
                  : 'No sessions match your search query or selected filters.'}
              </p>
              {(sessionSearch || sessionStatusFilter || sessionRoleFilter || sessionClinicFilter) && (
                <button
                  className="btn btn-secondary"
                  style={{ fontSize: '12px', margin: '0 auto' }}
                  onClick={() => {
                    setSessionSearch('');
                    setSessionStatusFilter('');
                    setSessionRoleFilter('');
                    setSessionClinicFilter('');
                  }}
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : sessionDisplayMode === 'list' ? (
            /* ======================================================== */
            /* VIEW 1: MODERN HIGH-DENSITY DATA-TABLE (LIST VIEW)      */
            /* ======================================================== */
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th style={{ width: '25%' }}>User & Account</th>
                    <th style={{ width: '18%' }}>Clinic & Role Scope</th>
                    <th style={{ width: '20%' }}>Client Device & IP</th>
                    <th style={{ width: '18%' }}>Activity Timeline</th>
                    <th style={{ width: '9%' }}>Status</th>
                    <th style={{ textAlign: 'right', width: '10%' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSessions.map((s) => {
                    const roleInfo = getRoleBadgeInfo(s.user_id?.role, s.user_id?.is_primary);
                    const initials = getUserInitials(s.user_id?.full_name);
                    const loginTime = formatSessionTime(s.createdAt);
                    const lastActive = formatSessionTime(s.last_active_at);
                    const isSelf = isCurrentSession(s);

                    return (
                      <tr key={s._id}>
                        {/* 1. User & Identity */}
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div 
                              style={{
                                width: '38px',
                                height: '38px',
                                borderRadius: '50%',
                                background: roleInfo.avatarBg,
                                color: roleInfo.avatarColor,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: '700',
                                fontSize: '13px',
                                flexShrink: 0,
                                border: `1px solid ${roleInfo.border}`
                              }}
                            >
                              {initials}
                            </div>
                            <div style={{ minWidth: 0 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                                <strong style={{ fontSize: '13px', color: 'var(--color-text-primary)' }}>
                                  {s.user_id?.full_name || 'User'}
                                </strong>
                                {isSelf && (
                                  <span 
                                    style={{ 
                                      display: 'inline-flex', 
                                      alignItems: 'center', 
                                      gap: '3px', 
                                      fontSize: '10px', 
                                      fontWeight: '700', 
                                      padding: '1px 6px', 
                                      borderRadius: '9999px', 
                                      background: 'rgba(15, 118, 110, 0.12)', 
                                      color: 'var(--color-primary)', 
                                      border: '1px solid rgba(15, 118, 110, 0.3)' 
                                    }}
                                  >
                                    <CheckCircle2 size={10} /> You
                                  </span>
                                )}
                                {s.user_id?.is_primary && (
                                  <span style={{ fontSize: '9px', fontWeight: '700', textTransform: 'uppercase', background: '#fef3c7', color: '#b45309', padding: '1px 5px', borderRadius: '4px', border: '1px solid #fde68a' }}>
                                    Primary
                                  </span>
                                )}
                              </div>
                              <span style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '200px' }}>
                                {s.user_id?.email}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* 2. Role & Clinic Scope */}
                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-start' }}>
                            <span 
                              style={{ 
                                fontSize: '11px', 
                                fontWeight: '600',
                                padding: '2px 8px', 
                                borderRadius: '12px', 
                                background: roleInfo.bg, 
                                color: roleInfo.color,
                                border: roleInfo.border
                              }}
                            >
                              {roleInfo.label}
                            </span>
                            <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                              <Building2 size={12} style={{ color: 'var(--color-text-tertiary)', flexShrink: 0 }} />
                              <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '170px' }}>
                                {s.clinic_id?.name || (s.user_id?.role === 'admin' ? 'Global Administration' : 'Unassigned')}
                              </span>
                            </span>
                          </div>
                        </td>

                        {/* 3. Client Device & IP */}
                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-start' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              {getDeviceIcon(s.device_info, s.user_agent)}
                              <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--color-text-primary)' }}>
                                {s.device_info || 'Web Browser'}
                              </span>
                            </div>
                            <code 
                              style={{ 
                                fontSize: '11px', 
                                padding: '2px 6px', 
                                background: 'var(--color-bg-secondary)', 
                                color: 'var(--color-text-secondary)', 
                                borderRadius: '4px', 
                                fontFamily: 'monospace',
                                border: '1px solid var(--color-border)'
                              }}
                            >
                              {s.ip_address || '127.0.0.1'}
                            </code>
                          </div>
                        </td>

                        {/* 4. Activity Timeline */}
                        <td>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--color-text-primary)' }}>
                                {lastActive.formatted}
                              </span>
                              <span 
                                style={{ 
                                  fontSize: '10px', 
                                  fontWeight: s.status === 'active' ? '700' : '500',
                                  color: s.status === 'active' ? '#059669' : 'var(--color-text-tertiary)',
                                  background: s.status === 'active' ? 'rgba(16, 185, 129, 0.12)' : 'transparent',
                                  padding: s.status === 'active' ? '1px 6px' : '0',
                                  borderRadius: '4px'
                                }}
                              >
                                {lastActive.relative}
                              </span>
                            </div>
                            <span style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                              <Clock size={11} /> Started: {loginTime.formatted}
                            </span>
                          </div>
                        </td>

                        {/* 5. Status */}
                        <td>
                          {s.status === 'active' ? (
                            <span 
                              style={{ 
                                fontSize: '11px', 
                                fontWeight: '700',
                                padding: '3px 9px', 
                                borderRadius: '12px', 
                                background: 'rgba(16, 185, 129, 0.12)', 
                                color: '#059669',
                                border: '1px solid rgba(16, 185, 129, 0.3)',
                                display: 'inline-flex', 
                                alignItems: 'center', 
                                gap: '5px' 
                              }}
                            >
                              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10b981', boxShadow: '0 0 6px #10b981' }} />
                              Active
                            </span>
                          ) : s.status === 'expired' ? (
                            <span 
                              style={{ 
                                fontSize: '11px', 
                                fontWeight: '600',
                                padding: '3px 9px', 
                                borderRadius: '12px', 
                                background: 'var(--color-bg-secondary)', 
                                color: 'var(--color-text-tertiary)',
                                border: '1px solid var(--color-border)',
                                display: 'inline-flex', 
                                alignItems: 'center', 
                                gap: '5px' 
                              }}
                            >
                              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#94a3b8' }} />
                              Expired
                            </span>
                          ) : (
                            <span 
                              style={{ 
                                fontSize: '11px', 
                                fontWeight: '600',
                                padding: '3px 9px', 
                                borderRadius: '12px', 
                                background: 'rgba(239, 68, 68, 0.1)', 
                                color: '#dc2626',
                                border: '1px solid rgba(239, 68, 68, 0.25)',
                                display: 'inline-flex', 
                                alignItems: 'center', 
                                gap: '5px' 
                              }}
                            >
                              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#ef4444' }} />
                              Revoked
                            </span>
                          )}
                        </td>

                        {/* 6. Action */}
                        <td style={{ textAlign: 'right' }}>
                          {s.status === 'active' ? (
                            <button
                              className="btn"
                              style={{ 
                                fontSize: '11px', 
                                fontWeight: '600',
                                padding: '4px 10px', 
                                gap: '5px', 
                                borderRadius: '6px',
                                border: '1px solid rgba(239, 68, 68, 0.35)',
                                background: 'rgba(239, 68, 68, 0.05)',
                                color: '#dc2626',
                                cursor: 'pointer',
                                transition: 'all 0.15s ease'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = '#ef4444';
                                e.currentTarget.style.color = '#ffffff';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.05)';
                                e.currentTarget.style.color = '#dc2626';
                              }}
                              onClick={() => {
                                setConfirmModal({
                                  isOpen: true,
                                  type: 'terminate_session',
                                  targetId: s._id,
                                  targetLabel: s.user_id?.full_name,
                                  title: isSelf ? 'Log Out Your Current Session' : 'Terminate User Session',
                                  message: isSelf
                                    ? 'Are you sure you want to terminate your current session? You will be immediately logged out.'
                                    : `Are you sure you want to terminate the active session for ${s.user_id?.full_name}? The user will be immediately logged out and blocked on their next action.`
                                });
                              }}
                            >
                              <Power size={12} /> {isSelf ? 'Log Out' : 'Terminate'}
                            </button>
                          ) : s.status === 'expired' ? (
                            <span style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', fontStyle: 'italic' }}>
                              Expired
                            </span>
                          ) : (
                            <span style={{ fontSize: '11px', color: '#ef4444', fontWeight: '500' }}>
                              Revoked
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            /* ======================================================== */
            /* VIEW 2: MODERN CARD TILES (GRID VIEW)                   */
            /* ======================================================== */
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '16px' }}>
              {filteredSessions.map((s) => {
                const roleInfo = getRoleBadgeInfo(s.user_id?.role, s.user_id?.is_primary);
                const initials = getUserInitials(s.user_id?.full_name);
                const loginTime = formatSessionTime(s.createdAt);
                const lastActive = formatSessionTime(s.last_active_at);
                const isSelf = isCurrentSession(s);

                return (
                  <div 
                    key={s._id} 
                    className="card" 
                    style={{ 
                      padding: '20px', 
                      display: 'flex', 
                      flexDirection: 'column', 
                      justifyContent: 'space-between',
                      border: isSelf 
                        ? '1.5px solid var(--color-primary)' 
                        : s.status === 'active' 
                          ? '1px solid rgba(16, 185, 129, 0.35)' 
                          : '1px solid var(--color-border)',
                      boxShadow: isSelf
                        ? '0 4px 14px rgba(15, 118, 110, 0.08)'
                        : s.status === 'active' 
                          ? '0 4px 12px rgba(16, 185, 129, 0.05)' 
                          : 'none',
                      transition: 'all 0.2s ease',
                      position: 'relative'
                    }}
                  >
                    {/* Card Top: User Info & Status Pill */}
                    <div>
                      {isSelf && (
                        <div 
                          style={{ 
                            display: 'inline-flex', 
                            alignItems: 'center', 
                            gap: '4px', 
                            fontSize: '11px', 
                            fontWeight: '700', 
                            padding: '2px 8px', 
                            borderRadius: '6px', 
                            background: 'rgba(15, 118, 110, 0.1)', 
                            color: 'var(--color-primary)', 
                            marginBottom: '12px' 
                          }}
                        >
                          <CheckCircle2 size={12} /> Current Device (This Browser Session)
                        </div>
                      )}

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div 
                            style={{
                              width: '42px',
                              height: '42px',
                              borderRadius: '50%',
                              background: roleInfo.avatarBg,
                              color: roleInfo.avatarColor,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: '700',
                              fontSize: '14px',
                              flexShrink: 0,
                              border: `1px solid ${roleInfo.border}`
                            }}
                          >
                            {initials}
                          </div>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <strong style={{ fontSize: '14px', color: 'var(--color-text-primary)' }}>
                                {s.user_id?.full_name || 'User'}
                              </strong>
                              {s.user_id?.is_primary && (
                                <span style={{ fontSize: '9px', fontWeight: '700', textTransform: 'uppercase', background: '#fef3c7', color: '#b45309', padding: '1px 5px', borderRadius: '4px', border: '1px solid #fde68a' }}>
                                  Primary
                                </span>
                              )}
                            </div>
                            <span style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', display: 'block' }}>
                              {s.user_id?.email}
                            </span>
                          </div>
                        </div>

                        {s.status === 'active' ? (
                          <span 
                            style={{ 
                              fontSize: '11px', 
                              fontWeight: '700',
                              padding: '3px 8px', 
                              borderRadius: '12px', 
                              background: 'rgba(16, 185, 129, 0.12)', 
                              color: '#059669',
                              border: '1px solid rgba(16, 185, 129, 0.3)',
                              display: 'inline-flex', 
                              alignItems: 'center', 
                              gap: '5px' 
                            }}
                          >
                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10b981' }} />
                            Active
                          </span>
                        ) : s.status === 'expired' ? (
                          <span 
                            style={{ 
                              fontSize: '11px', 
                              fontWeight: '600',
                              padding: '3px 8px', 
                              borderRadius: '12px', 
                              background: 'var(--color-bg-secondary)', 
                              color: 'var(--color-text-tertiary)',
                              border: '1px solid var(--color-border)',
                              display: 'inline-flex', 
                              alignItems: 'center', 
                              gap: '5px' 
                            }}
                          >
                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#94a3b8' }} />
                            Expired
                          </span>
                        ) : (
                          <span 
                            style={{ 
                              fontSize: '11px', 
                              fontWeight: '600',
                              padding: '3px 8px', 
                              borderRadius: '12px', 
                              background: 'rgba(239, 68, 68, 0.1)', 
                              color: '#dc2626',
                              border: '1px solid rgba(239, 68, 68, 0.25)',
                              display: 'inline-flex', 
                              alignItems: 'center', 
                              gap: '5px' 
                            }}
                          >
                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#ef4444' }} />
                            Revoked
                          </span>
                        )}
                      </div>

                      {/* Role & Clinic Scope Badges */}
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '14px' }}>
                        <span 
                          style={{ 
                            fontSize: '11px', 
                            fontWeight: '600',
                            padding: '2px 8px', 
                            borderRadius: '12px', 
                            background: roleInfo.bg, 
                            color: roleInfo.color,
                            border: roleInfo.border
                          }}
                        >
                          {roleInfo.label}
                        </span>
                        <span 
                          style={{ 
                            fontSize: '11px', 
                            fontWeight: '500',
                            padding: '2px 8px', 
                            borderRadius: '12px', 
                            background: 'var(--color-bg-secondary)', 
                            color: 'var(--color-text-secondary)', 
                            border: '1px solid var(--color-border)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <Building2 size={11} style={{ color: 'var(--color-text-tertiary)' }} />
                          {s.clinic_id?.name || (s.user_id?.role === 'admin' ? 'Global Admin' : 'Unassigned')}
                        </span>
                      </div>

                      {/* Device & IP Details */}
                      <div 
                        style={{ 
                          background: 'var(--color-bg-secondary)', 
                          padding: '10px 12px', 
                          borderRadius: '8px', 
                          marginBottom: '14px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {getDeviceIcon(s.device_info, s.user_agent)}
                          <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--color-text-primary)' }}>
                            {s.device_info || 'Web Browser'}
                          </span>
                        </div>
                        <code 
                          style={{ 
                            fontSize: '11px', 
                            padding: '2px 6px', 
                            background: 'var(--color-bg-primary)', 
                            color: 'var(--color-text-secondary)', 
                            borderRadius: '4px', 
                            fontFamily: 'monospace',
                            border: '1px solid var(--color-border)'
                          }}
                        >
                          {s.ip_address || '127.0.0.1'}
                        </code>
                      </div>

                      {/* Timestamps */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', marginBottom: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ color: 'var(--color-text-tertiary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Activity size={12} style={{ color: '#10b981' }} /> Last Active:
                          </span>
                          <span style={{ fontWeight: '600', color: 'var(--color-text-primary)' }}>
                            {lastActive.formatted} <span style={{ color: s.status === 'active' ? '#059669' : 'var(--color-text-tertiary)', fontWeight: 'normal' }}>({lastActive.relative})</span>
                          </span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ color: 'var(--color-text-tertiary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Clock size={12} style={{ color: 'var(--color-text-tertiary)' }} /> Started:
                          </span>
                          <span style={{ color: 'var(--color-text-secondary)' }}>
                            {loginTime.formatted}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Card Footer: Action */}
                    <div>
                      {s.status === 'active' ? (
                        <button
                          className="btn"
                          style={{ 
                            width: '100%', 
                            justifyContent: 'center', 
                            fontSize: '12px', 
                            fontWeight: '600',
                            padding: '7px 12px', 
                            gap: '6px', 
                            borderRadius: '6px',
                            border: '1px solid rgba(239, 68, 68, 0.35)',
                            background: 'rgba(239, 68, 68, 0.05)',
                            color: '#dc2626',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#ef4444';
                            e.currentTarget.style.color = '#ffffff';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.05)';
                            e.currentTarget.style.color = '#dc2626';
                          }}
                          onClick={() => {
                            setConfirmModal({
                              isOpen: true,
                              type: 'terminate_session',
                              targetId: s._id,
                              targetLabel: s.user_id?.full_name,
                              title: isSelf ? 'Log Out Your Current Session' : 'Terminate User Session',
                              message: isSelf
                                ? 'Are you sure you want to terminate your current session? You will be immediately logged out.'
                                : `Are you sure you want to terminate the active session for ${s.user_id?.full_name}? The user will be immediately logged out and blocked on their next action.`
                            });
                          }}
                        >
                          <Power size={13} /> {isSelf ? 'Log Out (This Session)' : 'Terminate Session'}
                        </button>
                      ) : s.status === 'expired' ? (
                        <div style={{ textAlign: 'center', padding: '7px', background: 'var(--color-bg-secondary)', borderRadius: '6px', color: 'var(--color-text-tertiary)', fontSize: '11px', fontStyle: 'italic' }}>
                          Session Expired (Idle Timeout)
                        </div>
                      ) : (
                        <div style={{ textAlign: 'center', padding: '7px', background: 'rgba(239, 68, 68, 0.08)', borderRadius: '6px', color: '#ef4444', fontSize: '11px', fontWeight: '500' }}>
                          Revoked by Platform Administrator
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Manual Quick Block Modal */}
      {showBlockModal && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(3px)'
          }}
          onClick={() => setShowBlockModal(false)}
        >
          <div 
            className="card"
            style={{ width: '440px', maxWidth: '90vw', padding: '24px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '14px', color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Ban size={18} style={{ color: '#ef4444' }} />
              Enforce Firewall Block
            </h3>

            <form onSubmit={handleBlockIp}>
              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label className="form-label" style={{ fontWeight: '600', fontSize: '12px' }}>
                  IP Address to Block
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. 192.168.0.108"
                  value={blockIpInput}
                  onChange={(e) => setBlockIpInput(e.target.value)}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label className="form-label" style={{ fontWeight: '600', fontSize: '12px' }}>
                  Reason for Block
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. Rate limit violations / unauthorized access"
                  value={blockReasonInput}
                  onChange={(e) => setBlockReasonInput(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowBlockModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-danger" disabled={actionLoading}>
                  {actionLoading ? <RefreshCw size={14} className="spin" /> : <Ban size={14} />}
                  Enforce Block Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, type: null, targetId: null, targetLabel: '', title: '', message: '' })}
        onConfirm={confirmModal.type === 'unblock_ip' ? handleConfirmUnblock : handleConfirmTerminateSession}
        title={confirmModal.title}
        message={confirmModal.message}
        loading={actionLoading}
      />
    </div>
  );
}
