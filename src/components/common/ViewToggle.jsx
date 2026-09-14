import React from 'react';
import { LayoutGrid, List } from 'lucide-react';

export default function ViewToggle({ mode = 'list', onChange }) {
  return (
    <div 
      className="view-toggle-container"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        background: 'var(--color-bg-secondary)',
        border: '1px solid var(--color-border)',
        borderRadius: '8px',
        padding: '3px',
        gap: '2px'
      }}
    >
      <button
        type="button"
        className={`btn-icon ${mode === 'list' ? 'active' : ''}`}
        onClick={() => onChange('list')}
        title="List / Table View"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '32px',
          height: '30px',
          borderRadius: '6px',
          border: 'none',
          cursor: 'pointer',
          background: mode === 'list' ? 'var(--color-primary)' : 'transparent',
          color: mode === 'list' ? '#ffffff' : 'var(--color-text-secondary)',
          boxShadow: mode === 'list' ? '0 2px 4px rgba(0,0,0,0.12)' : 'none',
          transition: 'all 0.15s ease'
        }}
      >
        <List size={16} />
      </button>
      <button
        type="button"
        className={`btn-icon ${mode === 'grid' ? 'active' : ''}`}
        onClick={() => onChange('grid')}
        title="Grid / Card View"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '32px',
          height: '30px',
          borderRadius: '6px',
          border: 'none',
          cursor: 'pointer',
          background: mode === 'grid' ? 'var(--color-primary)' : 'transparent',
          color: mode === 'grid' ? '#ffffff' : 'var(--color-text-secondary)',
          boxShadow: mode === 'grid' ? '0 2px 4px rgba(0,0,0,0.12)' : 'none',
          transition: 'all 0.15s ease'
        }}
      >
        <LayoutGrid size={16} />
      </button>
    </div>
  );
}
