import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, PlusCircle, Calendar as CalendarIcon, Clock } from 'lucide-react';

const initialEvents = [
  { id: 1, date: 14, title: 'Dental Surgery - Bruce Wayne', time: '10:00 AM', color: 'blue' },
  { id: 2, date: 14, title: 'General Checkup - Selina Kyle', time: '11:30 AM', color: 'green' },
  { id: 3, date: 15, title: 'Routine Clean - Clark Kent', time: '02:00 PM', color: 'blue' },
  { id: 4, date: 20, title: 'Root Canal Therapy - Diana Prince', time: '04:15 PM', color: 'amber' },
  { id: 5, date: 5, title: 'Orthodontic Align - Peter Parker', time: '09:00 AM', color: 'green' },
];

export default function Calendar() {
  const [events, setEvents] = useState(initialEvents);
  const [selectedDay, setSelectedDay] = useState(14); // default to July 14 (current local date)
  const [modalOpen, setModalOpen] = useState(false);
  
  // Event form fields
  const [newTitle, setNewTitle] = useState('');
  const [newTime, setNewTime] = useState('10:00 AM');
  const [newColor, setNewColor] = useState('blue');

  // July 2026 starts on Wednesday (3rd index, if Sun=0, Mon=1, Tue=2, Wed=3)
  // Total days in July = 31
  const startDayOffset = 3;
  const totalDays = 31;
  const daysArray = Array.from({ length: totalDays }, (_, i) => i + 1);

  // Generate matrix cells
  const gridCells = [];
  // Previous month padding (June 2026 ends with 30)
  for (let i = startDayOffset - 1; i >= 0; i--) {
    gridCells.push({ day: 30 - i, currentMonth: false });
  }
  // Current month
  daysArray.forEach((d) => {
    gridCells.push({ day: d, currentMonth: true });
  });
  // Next month padding
  const totalCellsSoFar = gridCells.length;
  const nextMonthPadding = 35 - totalCellsSoFar > 0 ? 35 - totalCellsSoFar : 42 - totalCellsSoFar;
  for (let i = 1; i <= nextMonthPadding; i++) {
    gridCells.push({ day: i, currentMonth: false });
  }

  const selectedDayEvents = events.filter((e) => e.date === selectedDay);

  const handleAddEvent = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newEvt = {
      id: Date.now(),
      date: selectedDay,
      title: newTitle,
      time: newTime,
      color: newColor,
    };

    setEvents((prev) => [...prev, newEvt]);
    setNewTitle('');
    setModalOpen(false);
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Clinic Schedule Calendar</h1>
          <p className="page-subtitle">Schedule appointments, consult times, and doctor shift patterns</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModalOpen(true)}>
          <PlusCircle size={14} /> Add Event / Slot
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '20px' }}>
        {/* Calendar Grid Wrapper */}
        <div>
          {/* Calendar Controller */}
          <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', marginBottom: '16px' }}>
            <span style={{ fontWeight: 'bold', fontSize: '15px' }}>July 2026</span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="icon-btn" style={{ width: '28px', height: '28px' }} disabled>
                <ChevronLeft size={16} />
              </button>
              <button className="btn btn-secondary" style={{ padding: '2px 10px', fontSize: '11px' }}>
                Today
              </button>
              <button className="icon-btn" style={{ width: '28px', height: '28px' }} disabled>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          <div className="calendar-grid">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div key={d} className="calendar-header-day">{d}</div>
            ))}
            {gridCells.map((cell, idx) => {
              const dayEvents = cell.currentMonth ? events.filter((e) => e.date === cell.day) : [];
              const isSelected = cell.currentMonth && cell.day === selectedDay;
              const isToday = cell.currentMonth && cell.day === 14;

              return (
                <div
                  key={idx}
                  className={`calendar-day-cell ${!cell.currentMonth ? 'other-month' : ''}`}
                  style={{
                    backgroundColor: isSelected ? 'var(--color-primary-light)' : '',
                    border: isToday ? '1px solid var(--color-primary)' : '',
                  }}
                  onClick={() => cell.currentMonth && setSelectedDay(cell.day)}
                >
                  <span className="calendar-day-num" style={{ fontWeight: isToday ? 'bold' : '' }}>
                    {cell.day}
                  </span>

                  <div className="calendar-events-container">
                    {dayEvents.map((evt) => (
                      <span key={evt.id} className={`calendar-event-dot ${evt.color}`}>
                        {evt.time} {evt.title.split(' - ')[0]}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Day Event Panel */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px', height: 'max-content' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--color-border)', paddingBottom: '12px' }}>
            <CalendarIcon size={18} color="var(--color-primary)" />
            <h3 style={{ fontSize: '14px', fontWeight: 'bold' }}>Schedule for July {selectedDay}, 2026</h3>
          </div>

          {selectedDayEvents.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--color-text-tertiary)' }}>
              No consultations scheduled for this day.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {selectedDayEvents.map((evt) => (
                <div
                  key={evt.id}
                  className="issue-card"
                  style={{
                    flexDirection: 'column',
                    alignItems: 'stretch',
                    padding: '10px',
                    gap: '4px',
                    borderLeftColor: evt.color === 'blue' ? 'var(--color-primary)' : evt.color === 'green' ? 'var(--color-success)' : 'var(--color-warning)',
                    marginBottom: 0,
                  }}
                >
                  <h4 style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--color-text-primary)' }}>{evt.title}</h4>
                  <span style={{ fontSize: '10px', color: 'var(--color-text-tertiary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={10} /> {evt.time}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Event Modal */}
      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Schedule Appointment for July {selectedDay}</h3>
              <button className="icon-btn" onClick={() => setModalOpen(false)}>×</button>
            </div>
            <form onSubmit={handleAddEvent}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Event Description</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="e.g. Root Canal - John Doe"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    required
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Time Slot</label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="e.g. 10:00 AM"
                      value={newTime}
                      onChange={(e) => setNewTime(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Category Color</label>
                    <select className="input-field" value={newColor} onChange={(e) => setNewColor(e.target.value)}>
                      <option value="blue">Blue (Surgery)</option>
                      <option value="green">Green (Checkup)</option>
                      <option value="amber">Amber (Therapy)</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Schedule Slot</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
