import React from 'react';
import { Layers, Calendar as CalendarIcon, CheckSquare, Users } from 'lucide-react';

const initialProjects = [
  { id: 1, name: 'Vulnerability Vulnerability Scan', progress: 75, due: '2026-07-28', status: 'In Progress', color: 'var(--color-primary)' },
  { id: 2, name: 'OAuth 2.0 Integration', progress: 40, due: '2026-08-05', status: 'Planning', color: 'var(--color-secondary)' },
  { id: 3, name: 'GDPR ROPA Data Audits', progress: 100, due: '2026-07-10', status: 'Completed', color: 'var(--color-success)' },
];

const ganttTasks = [
  { name: 'Define scope policy', start: 1, duration: 5, color: '#378ADD' },
  { name: 'Code verifyIdToken login', start: 4, duration: 8, color: '#7F77DD' },
  { name: 'Audit log table schema', start: 10, duration: 6, color: '#1D9E75' },
  { name: 'Firewall CIDR testing', start: 14, duration: 10, color: '#BA7517' },
  { name: 'SSL checks dashboard', start: 20, duration: 8, color: '#E24B4A' },
];

export default function Projects() {
  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Projects & Timeline</h1>
          <p className="page-subtitle">Milestones tracking, task completions, and Gantt charts</p>
        </div>
      </div>

      <div className="charts-grid" style={{ marginBottom: '24px' }}>
        {initialProjects.map((p) => (
          <div key={p.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' }}>
                <Layers size={18} color="var(--color-primary)" />
                {p.name}
              </span>
              <span className={`badge ${
                p.status === 'Completed' ? 'badge-success' : 
                p.status === 'In Progress' ? 'badge-info' : 'badge-warning'
              }`}>
                {p.status}
              </span>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                <span>Completion progress</span>
                <strong>{p.progress}%</strong>
              </div>
              <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--color-bg-tertiary)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${p.progress}%`, height: '100%', backgroundColor: p.color, borderRadius: '4px' }} />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: 'var(--color-text-tertiary)', borderTop: '1px solid var(--color-border)', paddingTop: '12px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <CalendarIcon size={12} /> Due: {p.due}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Users size={12} /> 3 members
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Gantt Timeline section */}
      <div className="card">
        <div className="chart-header" style={{ marginBottom: '16px' }}>
          <h3 className="chart-title">July 2026 Project Gantt Timeline</h3>
          <span style={{ fontSize: '11px', color: 'var(--color-text-tertiary)' }}>CSS Timeline Grid</span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <div style={{ minWidth: '800px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Timeline Header days 1 to 30 */}
            <div style={{ display: 'grid', gridTemplateColumns: '200px repeat(30, 1fr)', borderBottom: '1px solid var(--color-border)', paddingBottom: '8px' }}>
              <div style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--color-text-secondary)' }}>Task Name</div>
              {Array.from({ length: 30 }).map((_, i) => (
                <div key={i} style={{ textAlign: 'center', fontSize: '10px', color: 'var(--color-text-tertiary)' }}>
                  {i + 1}
                </div>
              ))}
            </div>

            {/* Timeline rows */}
            {ganttTasks.map((t, idx) => (
              <div key={idx} style={{ display: 'grid', gridTemplateColumns: '200px repeat(30, 1fr)', alignItems: 'center' }}>
                <div style={{ fontSize: '12px', fontWeight: 'medium', color: 'var(--color-text-primary)' }}>
                  {t.name}
                </div>
                <div style={{ gridColumnStart: t.start + 1, gridColumnEnd: t.start + t.duration + 1, padding: '2px 0' }}>
                  <div
                    style={{
                      backgroundColor: t.color,
                      height: '20px',
                      borderRadius: '4px',
                      color: '#fff',
                      fontSize: '9px',
                      display: 'flex',
                      alignItems: 'center',
                      paddingLeft: '8px',
                      fontWeight: 'bold',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                      whiteSpace: 'nowrap',
                      textOverflow: 'ellipsis',
                      overflow: 'hidden'
                    }}
                  >
                    {t.duration} days
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
