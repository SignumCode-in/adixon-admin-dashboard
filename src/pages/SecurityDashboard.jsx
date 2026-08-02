import React, { useState } from 'react';
import { Line } from 'react-chartjs-2';
import { ShieldAlert, ShieldCheck, RefreshCw, Eye, Activity } from 'lucide-react';

const initialIssues = [
  { id: 1, severity: 'critical', title: 'TLS 1.1 Support Enabled', desc: 'Allows connections via deprecated and weak SSL/TLS protocols.', status: 'open' },
  { id: 2, severity: 'high', title: 'Default Password Policy Active', desc: 'Password complexity does not require special symbols or letters.', status: 'open' },
  { id: 3, severity: 'medium', title: 'IP Allowlist Bypass Danger', desc: 'CORS settings permit wildcard origins on api/v1/auth/login.', status: 'open' },
  { id: 4, severity: 'low', title: 'CSRF Token Expiry Duration', desc: 'Session cookies do not specify strict same-site controls.', status: 'open' },
];

export default function SecurityDashboard() {
  const [issues, setIssues] = useState(initialIssues);
  const [scanning, setScanning] = useState(false);
  const [score, setScore] = useState(72);
  const [scanTime, setScanTime] = useState('Last scanned: 2 hours ago');
  const [filterSeverity, setFilterSeverity] = useState('');

  const handleRunScan = () => {
    setScanning(true);
    setScanTime('Running security checkup...');
    setTimeout(() => {
      setScanning(false);
      setScore(88); // improve score after mock scans
      setScanTime('Last scanned: Just now');
      // Resolve one issue as part of simulation
      setIssues(prev => prev.filter(i => i.id !== 1));
    }, 2000);
  };

  const handleResolveIssue = (id) => {
    setIssues((prev) => prev.filter((i) => i.id !== id));
  };

  const getScoreColor = (val) => {
    if (val < 40) return 'var(--color-danger)';
    if (val < 70) return 'var(--color-warning)';
    return 'var(--color-success)';
  };

  // SVG parameters for 140x140 score circle
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const threatChartData = {
    labels: ['Day 1', 'Day 5', 'Day 10', 'Day 15', 'Day 20', 'Day 25', 'Day 30'],
    datasets: [
      {
        label: 'Failed Login Attempts',
        data: [12, 19, 3, 45, 10, 8, 4],
        borderColor: '#E24B4A',
        backgroundColor: 'rgba(226, 75, 74, 0.1)',
        tension: 0.3,
      },
      {
        label: 'Blocked IP Requests',
        data: [120, 150, 180, 240, 140, 110, 95],
        borderColor: '#BA7517',
        backgroundColor: 'rgba(186, 117, 23, 0.1)',
        tension: 0.3,
      }
    ]
  };

  const filteredIssues = issues.filter(i => {
    if (filterSeverity && i.severity !== filterSeverity) return false;
    return true;
  });

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Security & Compliance Dashboard</h1>
          <p className="page-subtitle">Winston logs, failed logins, CORS blocklists, and security scan triggers</p>
        </div>
      </div>

      {/* Security summary row */}
      <div className="charts-grid" style={{ gridTemplateColumns: '320px 1fr', marginBottom: '24px' }}>
        {/* Score Ring */}
        <div className="card score-circle-container">
          <h3 style={{ fontSize: '13px', fontWeight: 'bold' }}>Overall Security Score</h3>
          <div style={{ position: 'relative', width: '140px', height: '140px' }}>
            <svg className="score-svg">
              <circle className="score-bg-circle" cx="70" cy="70" r={radius} />
              <circle
                className="score-progress-circle"
                cx="70"
                cy="70"
                r={radius}
                stroke={getScoreColor(score)}
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
              />
            </svg>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '32px', fontWeight: 'bold' }}>{score}</span>
              <span style={{ fontSize: '10px', color: 'var(--color-text-tertiary)' }}>out of 100</span>
            </div>
          </div>
          <span style={{ fontSize: '11px', color: 'var(--color-text-tertiary)' }}>{scanTime}</span>
          <button className="btn btn-primary" onClick={handleRunScan} disabled={scanning} style={{ width: '100%', justifyContent: 'center' }}>
            <RefreshCw size={14} className={scanning ? 'breadcrumbs-separator' : ''} style={{ animation: scanning ? 'spin 1s linear infinite' : '' }} />
            {scanning ? 'Scanning Files...' : 'Run Security Scan'}
          </button>
        </div>

        {/* KPIs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="kpi-row" style={{ marginBottom: 0 }}>
            <div className="card kpi-card">
              <div className="kpi-details">
                <span className="kpi-label">Failed Logins (24h)</span>
                <span className="kpi-value" style={{ color: 'var(--color-danger)' }}>4 attempts</span>
                <span className="kpi-trend down">-50% vs yesterday</span>
              </div>
              <div className="kpi-icon-wrapper" style={{ backgroundColor: 'var(--color-danger-light)', color: 'var(--color-danger)' }}>
                <ShieldAlert size={20} />
              </div>
            </div>

            <div className="card kpi-card">
              <div className="kpi-details">
                <span className="kpi-label">Active Auth Sessions</span>
                <span className="kpi-value">3 sessions</span>
                <span className="kpi-trend up">All verified locations</span>
              </div>
              <div className="kpi-icon-wrapper" style={{ backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)' }}>
                <ShieldCheck size={20} />
              </div>
            </div>

            <div className="card kpi-card">
              <div className="kpi-details">
                <span className="kpi-label">Blocked IP Addrs</span>
                <span className="kpi-value">124 IPs</span>
                <span className="kpi-trend up">+14.2% block frequency</span>
              </div>
              <div className="kpi-icon-wrapper" style={{ backgroundColor: 'var(--color-warning-light)', color: 'var(--color-warning)' }}>
                <Activity size={20} />
              </div>
            </div>
          </div>

          {/* Anomaly chart */}
          <div className="card" style={{ flex: 1 }}>
            <div className="chart-header" style={{ marginBottom: '10px' }}>
              <h3 className="chart-title">Threat Activity Timeline (30 Days)</h3>
              <span style={{ fontSize: '11px', color: 'var(--color-text-tertiary)' }}>Live logs tracking</span>
            </div>
            <div className="chart-container" style={{ height: '140px' }}>
              <Line
                data={threatChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                  scales: {
                    x: { ticks: { display: false }, grid: { display: false } },
                    y: { ticks: { display: false }, grid: { display: false } },
                  }
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Security Issues checklist */}
      <div className="card">
        <div className="chart-header" style={{ marginBottom: '16px' }}>
          <h3 className="chart-title">Vulnerability Remediation Tasks ({issues.length} Open)</h3>
          <select 
            className="input-field" 
            style={{ width: '150px', padding: '4px 8px', fontSize: '11px' }}
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
          >
            <option value="">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        <div>
          {filteredIssues.map((issue) => (
            <div key={issue.id} className={`issue-card ${issue.severity}`}>
              <div className="issue-info">
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span className={`badge ${
                    issue.severity === 'critical' || issue.severity === 'high' ? 'badge-danger' : 
                    issue.severity === 'medium' ? 'badge-warning' : 'badge-success'
                  }`} style={{ fontSize: '9px', textTransform: 'uppercase' }}>
                    {issue.severity}
                  </span>
                  <strong className="issue-title">{issue.title}</strong>
                </span>
                <p className="issue-desc" style={{ marginTop: '2px' }}>{issue.desc}</p>
              </div>
              <button className="btn btn-secondary" style={{ padding: '4px 12px', fontSize: '11px' }} onClick={() => handleResolveIssue(issue.id)}>
                Resolve Item
              </button>
            </div>
          ))}
          {filteredIssues.length === 0 && (
            <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--color-text-tertiary)' }}>
              No vulnerabilities matching selection. System is clean!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
