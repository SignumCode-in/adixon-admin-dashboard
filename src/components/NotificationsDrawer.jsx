import React, { useState } from 'react';
import { X, CheckCheck, Info, ShieldAlert, CheckCircle, BellRing } from 'lucide-react';

const initialNotifications = [
  { id: 1, type: 'critical', title: 'Suspicious Brute Force Attempt', desc: 'Blocked IP 103.45.12.98 after 10 failed login attempts.', time: '2 mins ago', unread: true, category: 'System' },
  { id: 2, type: 'warning', title: 'Pending Data Subject Request SLA', desc: 'GDPR Erasure request for patient John Doe due in 3 days.', time: '1 hour ago', unread: true, category: 'Mentions' },
  { id: 3, type: 'success', title: 'Weekly Backup Succeeded', desc: 'Successfully exported 2.4GB SQL dump to Secure AWS S3.', time: '5 hours ago', unread: false, category: 'System' },
  { id: 4, type: 'info', title: 'SSL Certificate Auto-renewed', desc: 'Let\'s Encrypt certificate renewed successfully for api.adixon.com.', time: '1 day ago', unread: false, category: 'System' },
];

export default function NotificationsDrawer({ isOpen, onClose, onUnreadCountChange }) {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [activeTab, setActiveTab] = useState('All');

  const unreadCount = notifications.filter((n) => n.unread).length;
  // Notify parent of unread count updates
  React.useEffect(() => {
    onUnreadCountChange && onUnreadCountChange(unreadCount);
  }, [unreadCount]);

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const handleToggleRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, unread: !n.unread } : n))
    );
  };

  const handleDismiss = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const filtered = notifications.filter((n) => {
    if (activeTab === 'Unread') return n.unread;
    if (activeTab === 'Mentions') return n.category === 'Mentions';
    if (activeTab === 'System') return n.category === 'System';
    return true;
  });

  const getIcon = (type) => {
    switch (type) {
      case 'critical':
        return <ShieldAlert className="badge-danger" size={18} style={{ color: 'var(--color-danger)' }} />;
      case 'warning':
        return <ShieldAlert className="badge-warning" size={18} style={{ color: 'var(--color-warning)' }} />;
      case 'success':
        return <CheckCircle className="badge-success" size={18} style={{ color: 'var(--color-success)' }} />;
      default:
        return <Info className="badge-info" size={18} style={{ color: 'var(--color-info)' }} />;
    }
  };

  return (
    <div className={`drawer ${isOpen ? 'open' : ''}`}>
      <div className="drawer-header">
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' }}>
          <BellRing size={18} color="var(--color-primary)" />
          Notifications
          {unreadCount > 0 && <span className="badge badge-danger">{unreadCount}</span>}
        </span>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {unreadCount > 0 && (
            <button className="icon-btn" onClick={handleMarkAllRead} title="Mark all read">
              <CheckCheck size={16} />
            </button>
          )}
          <button className="icon-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>
      </div>

      <div style={{ padding: '0 var(--sp-4)', marginTop: '8px' }}>
        <div className="tabs-header" style={{ marginBottom: '8px', gap: '16px' }}>
          {['All', 'Unread', 'Mentions', 'System'].map((tab) => (
            <button
              key={tab}
              className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
              style={{ padding: '8px 0', fontSize: '12px' }}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="drawer-body">
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--color-text-tertiary)', padding: '32px 0' }}>
            <BellRing size={36} style={{ opacity: 0.2, marginBottom: '8px' }} />
            <p style={{ fontSize: '13px' }}>No notifications here.</p>
          </div>
        ) : (
          filtered.map((noti) => (
            <div
              key={noti.id}
              className={`issue-card ${noti.unread ? 'critical' : ''}`}
              style={{
                flexDirection: 'column',
                alignItems: 'stretch',
                padding: '12px',
                gap: '8px',
                borderLeftWidth: noti.unread ? '3px' : '1px',
                borderLeftColor: noti.unread ? 'var(--color-primary)' : 'var(--color-border)',
                marginBottom: 0,
              }}
            >
              <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <div style={{ marginTop: '2px' }}>{getIcon(noti.type)}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <h4 className="issue-title" style={{ fontSize: '13px', lineHeight: 1.3 }}>{noti.title}</h4>
                    <button
                      className="icon-btn"
                      style={{ width: '20px', height: '20px', fontSize: '12px' }}
                      onClick={() => handleDismiss(noti.id)}
                    >
                      <X size={12} />
                    </button>
                  </div>
                  <p className="issue-desc" style={{ fontSize: '11px', marginTop: '2px' }}>{noti.desc}</p>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                <span style={{ fontSize: '10px', color: 'var(--color-text-tertiary)' }}>{noti.time}</span>
                <button
                  className="btn btn-secondary"
                  style={{ padding: '2px 8px', fontSize: '10px', borderRadius: '4px' }}
                  onClick={() => handleToggleRead(noti.id)}
                >
                  {noti.unread ? 'Mark Read' : 'Mark Unread'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
