import React, { useState } from 'react';
import { Line } from 'react-chartjs-2';

export default function Analytics() {
  const [dateRange, setDateRange] = useState('30d');

  // Pageviews line chart
  const pageviewsData = {
    labels: ['Day 1', 'Day 5', 'Day 10', 'Day 15', 'Day 20', 'Day 25', 'Day 30'],
    datasets: [
      {
        label: 'Page Views',
        data: [1200, 1800, 1600, 2400, 2900, 2700, 3400],
        borderColor: '#378ADD',
        backgroundColor: 'rgba(55, 138, 221, 0.1)',
        tension: 0.4,
      },
      {
        label: 'Sessions',
        data: [800, 1200, 1100, 1700, 2100, 1900, 2600],
        borderColor: '#7F77DD',
        backgroundColor: 'rgba(127, 119, 221, 0.1)',
        tension: 0.4,
      }
    ]
  };

  // Simulated active hours CSS Grid heatmap
  // 7 rows (days), 24 cells (hours)
  const heatmapRows = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const getHeatmapColor = (dayIndex, hour) => {
    // Generate simulated density
    const val = (dayIndex * 3 + hour * 2) % 10;
    if (val < 2) return 'rgba(55, 138, 221, 0.05)';
    if (val < 5) return 'rgba(55, 138, 221, 0.2)';
    if (val < 8) return 'rgba(55, 138, 221, 0.5)';
    return 'rgba(55, 138, 221, 0.8)';
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Analytics Statistics</h1>
          <p className="page-subtitle">Inspect system traffic, pageviews, and user activity</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {['Today', '7d', '30d', '90d'].map((range) => (
            <button
              key={range}
              onClick={() => setDateRange(range)}
              className={`btn ${dateRange === range ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '4px 12px', fontSize: '12px' }}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card chart-card-full">
          <div className="chart-header">
            <h3 className="chart-title">System Traffic & Daily Sessions</h3>
          </div>
          <div className="chart-container">
            <Line
              data={pageviewsData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { labels: { color: 'var(--color-text-secondary)' } } },
                scales: {
                  x: { ticks: { color: 'var(--color-text-secondary)' }, grid: { color: 'var(--color-border)' } },
                  y: { ticks: { color: 'var(--color-text-secondary)' }, grid: { color: 'var(--color-border)' } },
                }
              }}
            />
          </div>
        </div>

        {/* Heatmap */}
        <div className="chart-card chart-card-full">
          <div className="chart-header">
            <h3 className="chart-title">Hourly Activity Density</h3>
            <span style={{ fontSize: '11px', color: 'var(--color-text-tertiary)' }}>Timezone: UTC+05:30</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', overflowX: 'auto', paddingBottom: '8px' }}>
            <div style={{ display: 'flex', gap: '4px', minWidth: '700px' }}>
              <div style={{ width: '40px' }} />
              {Array.from({ length: 24 }).map((_, i) => (
                <div key={i} style={{ flex: 1, textAlign: 'center', fontSize: '10px', color: 'var(--color-text-tertiary)' }}>
                  {i}h
                </div>
              ))}
            </div>

            {heatmapRows.map((day, dIdx) => (
              <div key={day} style={{ display: 'flex', gap: '4px', alignItems: 'center', minWidth: '700px' }}>
                <div style={{ width: '40px', fontSize: '11px', fontWeight: 'bold', color: 'var(--color-text-secondary)' }}>
                  {day}
                </div>
                {Array.from({ length: 24 }).map((_, hIdx) => (
                  <div
                    key={hIdx}
                    title={`${day} at ${hIdx}:00`}
                    style={{
                      flex: 1,
                      height: '24px',
                      borderRadius: '4px',
                      backgroundColor: getHeatmapColor(dIdx, hIdx),
                      transition: 'transform 0.1s',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => (e.target.style.transform = 'scale(1.15)')}
                    onMouseLeave={(e) => (e.target.style.transform = 'scale(1)')}
                  />
                ))}
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', fontSize: '10px', color: 'var(--color-text-tertiary)', marginTop: '8px' }}>
            <span>Less Active</span>
            <div style={{ width: '12px', height: '12px', backgroundColor: 'rgba(55, 138, 221, 0.05)', borderRadius: '2px' }} />
            <div style={{ width: '12px', height: '12px', backgroundColor: 'rgba(55, 138, 221, 0.2)', borderRadius: '2px' }} />
            <div style={{ width: '12px', height: '12px', backgroundColor: 'rgba(55, 138, 221, 0.5)', borderRadius: '2px' }} />
            <div style={{ width: '12px', height: '12px', backgroundColor: 'rgba(55, 138, 221, 0.8)', borderRadius: '2px' }} />
            <span>Highly Active</span>
          </div>
        </div>
      </div>
    </div>
  );
}
