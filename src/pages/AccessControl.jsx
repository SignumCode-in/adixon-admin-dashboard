import React, { useState } from 'react';
import { ShieldCheck, Plus, Trash2, Key, Compass, Lock } from 'lucide-react';

export default function AccessControl() {
  const [activeTab, setActiveTab] = useState('matrix');

  // Permissions Matrix State
  const [matrix, setMatrix] = useState({
    Users: { view: true, create: true, edit: false, delete: false, export: false },
    Clinics: { view: true, create: false, edit: true, delete: false, export: false },
    Patients: { view: true, create: true, edit: true, delete: false, export: true },
    Appointments: { view: true, create: true, edit: true, delete: true, export: true },
    Billing: { view: true, create: false, edit: false, delete: false, export: false },
    Settings: { view: true, create: false, edit: true, delete: false, export: false },
  });

  // IP Lists
  const [ipTab, setIpTab] = useState('allow');
  const [ipList, setIpList] = useState([
    { id: 1, type: 'allow', ip: '192.168.1.0/24', label: 'Local LAN Network', addedBy: 'Admin' },
    { id: 2, type: 'allow', ip: '103.88.92.10', label: 'Main Office Gateway', addedBy: 'Admin' },
    { id: 3, type: 'block', ip: '185.220.101.5', label: 'TOR Exit Node Block', addedBy: 'Winston Bot' },
    { id: 4, type: 'block', ip: '210.45.10.0/16', label: 'Suspicious IP Range', addedBy: 'Firewall' },
  ]);
  const [newIp, setNewIp] = useState('');
  const [newIpLabel, setNewIpLabel] = useState('');
  const [testIpAddress, setTestIpAddress] = useState('');
  const [testIpResult, setTestIpResult] = useState('');

  // API Keys
  const [apiKeys, setApiKeys] = useState([
    { id: 1, name: 'Production Sync API', prefix: 'sk_live_****abcd', scopes: 'read:users, write:appointments', created: '2026-06-15' },
    { id: 2, name: 'Staging Testing client', prefix: 'sk_test_****xyz1', scopes: 'read:patients', created: '2026-07-02' },
  ]);
  const [newKeyName, setNewKeyName] = useState('');
  const [generatedKey, setGeneratedKey] = useState('');
  const [keyScopes, setKeyScopes] = useState({ readUsers: true, writeAppointments: false, admin: false });

  // Standalone Checkbox Matrix toggles
  const handleMatrixToggle = (resource, action) => {
    setMatrix((prev) => ({
      ...prev,
      [resource]: {
        ...prev[resource],
        [action]: !prev[resource][action],
      },
    }));
  };

  const handleSelectAllRow = (resource, checked) => {
    setMatrix((prev) => ({
      ...prev,
      [resource]: {
        view: checked,
        create: checked,
        edit: checked,
        delete: checked,
        export: checked,
      },
    }));
  };

  const handleSelectAllColumn = (action, checked) => {
    setMatrix((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((resource) => {
        next[resource][action] = checked;
      });
      return next;
    });
  };

  // Add IP Address
  const handleAddIp = (e) => {
    e.preventDefault();
    if (!newIp.trim()) return;
    const item = {
      id: Date.now(),
      type: ipTab,
      ip: newIp,
      label: newIpLabel || 'Manual IP Rule',
      addedBy: 'Admin',
    };
    setIpList((prev) => [...prev, item]);
    setNewIp('');
    setNewIpLabel('');
  };

  const handleDeleteIp = (id) => {
    setIpList((prev) => prev.filter((item) => item.id !== id));
  };

  // Test IP Address (CIDR match simulation)
  const handleTestIp = (e) => {
    e.preventDefault();
    if (!testIpAddress.trim()) {
      setTestIpResult('');
      return;
    }
    // Simple mock matches: check blocklist first
    const isBlocked = ipList.some(item => item.type === 'block' && testIpAddress.startsWith(item.ip.split('/')[0].split('.').slice(0,2).join('.')));
    const isAllowed = ipList.some(item => item.type === 'allow' && testIpAddress.startsWith(item.ip.split('/')[0].split('.').slice(0,2).join('.')));
    
    if (isBlocked) {
      setTestIpResult('DENIED (Blocked by rules)');
    } else if (isAllowed) {
      setTestIpResult('GRANTED (Matched allowlist)');
    } else {
      setTestIpResult('DENIED (Default Implicit Block)');
    }
  };

  // API Key Generators
  const handleGenerateKey = (e) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;
    const randomToken = 'sk_' + (keyScopes.admin ? 'live_admin_' : 'live_') + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const prefix = randomToken.slice(0, 7) + '****' + randomToken.slice(-4);
    
    const scopesList = [];
    if (keyScopes.admin) scopesList.push('admin');
    if (keyScopes.readUsers) scopesList.push('read:users');
    if (keyScopes.writeAppointments) scopesList.push('write:appointments');

    const item = {
      id: Date.now(),
      name: newKeyName,
      prefix,
      scopes: scopesList.join(', ') || 'none',
      created: new Date().toISOString().split('T')[0],
    };

    setApiKeys((prev) => [...prev, item]);
    setGeneratedKey(randomToken);
    setNewKeyName('');
  };

  const handleRevokeKey = (id) => {
    setApiKeys((prev) => prev.filter((k) => k.id !== id));
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Access Control & Firewall Policies</h1>
          <p className="page-subtitle">Permissions matrices, IP blocklists allow/deny subnets, and API keys management</p>
        </div>
      </div>

      {/* Main Tabs */}
      <div className="tabs-header">
        <button className={`tab-btn ${activeTab === 'matrix' ? 'active' : ''}`} onClick={() => setActiveTab('matrix')}>
          Permissions Matrix
        </button>
        <button className={`tab-btn ${activeTab === 'ip' ? 'active' : ''}`} onClick={() => setActiveTab('ip')}>
          IP Allowlist / Blocklist
        </button>
        <button className={`tab-btn ${activeTab === 'api' ? 'active' : ''}`} onClick={() => setActiveTab('api')}>
          Developer API Keys
        </button>
      </div>

      {/* Tab Panels */}
      <div className="card" style={{ minHeight: '400px' }}>
        {activeTab === 'matrix' && (
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: 'bold', marginBottom: '16px' }}>Standalone Resource Permissions Matrix</h3>
            
            <div className="matrix-grid" style={{ marginBottom: '24px' }}>
              {/* Header Row */}
              <div className="matrix-header matrix-header-first">Resource Category</div>
              {['view', 'create', 'edit', 'delete', 'export'].map((act) => (
                <div key={act} className="matrix-header">
                  {act}
                  <div style={{ marginTop: '4px' }}>
                    <input
                      type="checkbox"
                      onChange={(e) => handleSelectAllColumn(act, e.target.checked)}
                      title={`Select all ${act} permissions`}
                    />
                  </div>
                </div>
              ))}

              {/* Resource Rows */}
              {Object.keys(matrix).map((res) => (
                <div key={res} className="matrix-row">
                  <div className="matrix-cell-resource">
                    <span style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <input
                        type="checkbox"
                        onChange={(e) => handleSelectAllRow(res, e.target.checked)}
                        title={`Select all for ${res}`}
                      />
                      {res}
                    </span>
                  </div>
                  {['view', 'create', 'edit', 'delete', 'export'].map((act) => (
                    <div key={act} className="matrix-cell-check">
                      <input
                        type="checkbox"
                        checked={matrix[res][act]}
                        onChange={() => handleMatrixToggle(res, act)}
                      />
                    </div>
                  ))}
                </div>
              ))}
            </div>
            
            <button className="btn btn-primary" onClick={() => alert('Permissions config stored to backend cache.')}>
              Save Matrix Changes
            </button>
          </div>
        )}

        {activeTab === 'ip' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '20px' }}>
            <div>
              <div style={{ display: 'flex', gap: '12px', borderBottom: '1px solid var(--color-border)', paddingBottom: '12px', marginBottom: '16px' }}>
                <button
                  className={`btn ${ipTab === 'allow' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ padding: '4px 12px', fontSize: '12px' }}
                  onClick={() => setIpTab('allow')}
                >
                  Allowlist Subnets
                </button>
                <button
                  className={`btn ${ipTab === 'block' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ padding: '4px 12px', fontSize: '12px' }}
                  onClick={() => setIpTab('block')}
                >
                  Blocklist Subnets
                </button>
              </div>

              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>IP/CIDR Range</th>
                      <th>Label / Description</th>
                      <th>Created By</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ipList.filter((item) => item.type === ipTab).map((item) => (
                      <tr key={item.id}>
                        <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 'bold' }}>{item.ip}</td>
                        <td>{item.label}</td>
                        <td>{item.addedBy}</td>
                        <td>
                          <button className="icon-btn" style={{ color: 'var(--color-danger)' }} onClick={() => handleDeleteIp(item.id)}>
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* IP Controls Sidebar */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="card" style={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)' }}>
                <h4 style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '10px' }}>Add IP Policy</h4>
                <form onSubmit={handleAddIp}>
                  <div className="form-group">
                    <label className="form-label">CIDR Address</label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="e.g. 192.168.1.0/24"
                      value={newIp}
                      onChange={(e) => setNewIp(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Rule Label</label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="Custom subnet label"
                      value={newIpLabel}
                      onChange={(e) => setNewIpLabel(e.target.value)}
                    />
                  </div>
                  <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                    <Plus size={14} /> Add Subnet Rule
                  </button>
                </form>
              </div>

              <div className="card" style={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)' }}>
                <h4 style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '10px' }}>Firewall Tester</h4>
                <form onSubmit={handleTestIp}>
                  <div className="form-group">
                    <label className="form-label">Test Client IP</label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="e.g. 185.220.101.8"
                      value={testIpAddress}
                      onChange={(e) => setTestIpAddress(e.target.value)}
                    />
                  </div>
                  <button type="submit" className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>
                    Simulate Block
                  </button>
                </form>
                {testIpResult && (
                  <div style={{ marginTop: '10px', fontSize: '11px', fontWeight: 'bold', textAlign: 'center', color: testIpResult.includes('GRANTED') ? 'var(--color-success)' : 'var(--color-danger)' }}>
                    Result: {testIpResult}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'api' && (
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: 'bold', marginBottom: '16px' }}>Developer API Key Credentials</h3>

            {generatedKey && (
              <div className="badge badge-success" style={{ display: 'block', padding: '16px', borderRadius: '8px', marginBottom: '16px' }}>
                <h4 style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>API Key Generated Successfully!</h4>
                <p style={{ fontSize: '10px', marginBottom: '8px', color: 'var(--color-text-primary)' }}>
                  Copy this key now. For safety, it will not be displayed again.
                </p>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <code style={{ flex: 1, backgroundColor: 'var(--color-bg)', padding: '6px', borderRadius: '4px', fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--color-text-primary)' }}>
                    {generatedKey}
                  </code>
                  <button className="btn btn-primary" style={{ padding: '4px 10px' }} onClick={() => {
                    navigator.clipboard.writeText(generatedKey);
                    alert('Copied to clipboard!');
                  }}>
                    Copy Key
                  </button>
                </div>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '20px' }}>
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Name / Label</th>
                      <th>Token Preview</th>
                      <th>Scopes</th>
                      <th>Created Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {apiKeys.map((key) => (
                      <tr key={key.id}>
                        <td style={{ fontWeight: 'bold' }}>{key.name}</td>
                        <td style={{ fontFamily: 'var(--font-mono)' }}>{key.prefix}</td>
                        <td>{key.scopes}</td>
                        <td>{key.created}</td>
                        <td>
                          <button className="btn btn-danger" style={{ padding: '2px 8px', fontSize: '11px' }} onClick={() => handleRevokeKey(key.id)}>
                            Revoke
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Generator Panel */}
              <div className="card" style={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', height: 'max-content' }}>
                <h4 style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '12px' }}>Generate Secret Key</h4>
                <form onSubmit={handleGenerateKey}>
                  <div className="form-group">
                    <label className="form-label">Client Name</label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="e.g. Mobile App Client"
                      value={newKeyName}
                      onChange={(e) => setNewKeyName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group" style={{ gap: '8px' }}>
                    <label className="form-label">Grant Scopes</label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={keyScopes.readUsers}
                        onChange={(e) => setKeyScopes(prev => ({ ...prev, readUsers: e.target.checked }))}
                      />
                      read:users (Read users details)
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={keyScopes.writeAppointments}
                        onChange={(e) => setKeyScopes(prev => ({ ...prev, writeAppointments: e.target.checked }))}
                      />
                      write:appointments (Book slots)
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={keyScopes.admin}
                        onChange={(e) => setKeyScopes(prev => ({ ...prev, admin: e.target.checked }))}
                      />
                      admin (Full bypass clearance)
                    </label>
                  </div>

                  <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                    Generate API Token
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
