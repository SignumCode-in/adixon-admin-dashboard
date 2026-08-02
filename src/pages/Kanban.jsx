import React, { useState } from 'react';
import { Plus, MessageSquare, Paperclip, Clock, Filter, Sparkles } from 'lucide-react';

const initialTasks = [
  { id: 'T-101', title: 'Verify TLS 1.3 Handshake', desc: 'Confirm HTTPS connections discard obsolete cipher suites.', column: 'backlog', priority: 'critical', tags: ['Security', 'Infra'], comments: 4, attachments: 2, date: '2026-07-20', assignees: ['JD', 'AL'] },
  { id: 'T-102', title: 'Implement rate limiting warning', desc: 'Show alert modal to client when 429 status is returned.', column: 'in-progress', priority: 'high', tags: ['Backend', 'UX'], comments: 2, attachments: 1, date: '2026-07-16', assignees: ['BK'] },
  { id: 'T-103', title: 'CSP builder UI mocks', desc: 'Create checkboxes for default-src, script-src, and style-src.', column: 'in-review', priority: 'medium', tags: ['UI/UX'], comments: 6, attachments: 3, date: '2026-07-15', assignees: ['AL'] },
  { id: 'T-104', title: 'Verify Firebase token verify', desc: 'Verify the token validity with verifyIdToken on login route.', column: 'done', priority: 'high', tags: ['Auth'], comments: 8, attachments: 0, date: '2026-07-14', assignees: ['BK', 'JD'] },
];

export default function Kanban() {
  const [tasks, setTasks] = useState(initialTasks);
  const [activeColumnFilter, setActiveColumnFilter] = useState('');
  const [activePriorityFilter, setActivePriorityFilter] = useState('');
  
  // Inline task fields
  const [newTitle, setNewTitle] = useState('');
  const [showAddForm, setShowAddForm] = useState(null); // column id

  // HTML5 Drag and Drop Handlers
  const handleDragStart = (e, id) => {
    e.dataTransfer.setData('text/plain', id);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, targetColumn) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain');
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, column: targetColumn } : t))
    );
  };

  const handleAddTaskSubmit = (e, column) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newTask = {
      id: `T-${100 + tasks.length + 1}`,
      title: newTitle,
      desc: 'Double-click card to edit details and write description.',
      column,
      priority: 'medium',
      tags: ['Task'],
      comments: 0,
      attachments: 0,
      date: new Date().toISOString().split('T')[0],
      assignees: ['U'],
    };

    setTasks((prev) => [...prev, newTask]);
    setNewTitle('');
    setShowAddForm(null);
  };

  const getPriorityBadgeClass = (priority) => {
    switch (priority) {
      case 'critical': return 'badge-danger';
      case 'high': return 'badge-warning';
      case 'medium': return 'badge-info';
      default: return 'badge-success';
    }
  };

  const columns = [
    { id: 'backlog', title: 'Backlog Tasks' },
    { id: 'in-progress', title: 'In Progress' },
    { id: 'in-review', title: 'In Review' },
    { id: 'done', title: 'Completed' },
  ];

  // Filter tasks
  const filteredTasks = tasks.filter((t) => {
    if (activePriorityFilter && t.priority !== activePriorityFilter) return false;
    return true;
  });

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Kanban Task Board</h1>
          <p className="page-subtitle">WIP limits, column states, and drag & drop activities</p>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <Filter size={14} className="breadcrumbs-separator" />
          <select 
            className="input-field" 
            style={{ width: '150px', padding: '4px 8px', fontSize: '12px' }}
            value={activePriorityFilter}
            onChange={(e) => setActivePriorityFilter(e.target.value)}
          >
            <option value="">All Priorities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      <div className="kanban-board">
        {columns.map((col) => {
          const colTasks = filteredTasks.filter((t) => t.column === col.id);
          
          return (
            <div 
              key={col.id} 
              className="kanban-column"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, col.id)}
            >
              <div className="kanban-column-header">
                <span className="kanban-column-title">
                  {col.title}
                  <span className="badge badge-info" style={{ borderRadius: '4px', fontSize: '10px' }}>
                    {colTasks.length}
                  </span>
                </span>
                <button 
                  className="icon-btn" 
                  style={{ width: '24px', height: '24px' }}
                  onClick={() => setShowAddForm(col.id)}
                >
                  <Plus size={14} />
                </button>
              </div>

              {showAddForm === col.id && (
                <form onSubmit={(e) => handleAddTaskSubmit(e, col.id)} style={{ marginBottom: '8px' }}>
                  <input
                    type="text"
                    className="input-field"
                    style={{ fontSize: '12px', padding: '6px' }}
                    placeholder="Enter card title..."
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    required
                    autoFocus
                  />
                  <div style={{ display: 'flex', gap: '4px', marginTop: '4px', justifyContent: 'flex-end' }}>
                    <button 
                      type="button" 
                      className="btn btn-secondary" 
                      style={{ fontSize: '10px', padding: '2px 6px' }}
                      onClick={() => setShowAddForm(null)}
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="btn btn-primary" 
                      style={{ fontSize: '10px', padding: '2px 6px' }}
                    >
                      Add Task
                    </button>
                  </div>
                </form>
              )}

              <div className="kanban-task-list">
                {colTasks.map((task) => (
                  <div
                    key={task.id}
                    className="kanban-card"
                    draggable
                    onDragStart={(e) => handleDragStart(e, task.id)}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '10px', fontWeight: 'bold', color: 'var(--color-text-tertiary)' }}>
                        {task.id}
                      </span>
                      <span className={`badge ${getPriorityBadgeClass(task.priority)}`} style={{ fontSize: '9px', padding: '1px 6px' }}>
                        {task.priority}
                      </span>
                    </div>

                    <h4 className="kanban-card-title">{task.title}</h4>
                    <p className="kanban-card-desc">{task.desc}</p>

                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '4px' }}>
                      {task.tags.map((tag) => (
                        <span 
                          key={tag} 
                          style={{ fontSize: '9px', backgroundColor: 'var(--color-bg-tertiary)', padding: '1px 4px', borderRadius: '2px', color: 'var(--color-text-secondary)' }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="kanban-card-footer">
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', color: 'var(--color-text-tertiary)' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '2px', fontSize: '10px' }}>
                          <MessageSquare size={10} /> {task.comments}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '2px', fontSize: '10px' }}>
                          <Paperclip size={10} /> {task.attachments}
                        </span>
                      </div>

                      <div style={{ display: 'flex', gap: '-4px', alignItems: 'center' }}>
                        {task.assignees.map((init) => (
                          <div 
                            key={init} 
                            style={{ 
                              width: '18px', 
                              height: '18px', 
                              borderRadius: '50%', 
                              backgroundColor: 'var(--color-primary)', 
                              color: '#fff', 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center', 
                              fontSize: '8px', 
                              fontWeight: 'bold',
                              border: '1px solid var(--color-bg)'
                            }}
                          >
                            {init}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
