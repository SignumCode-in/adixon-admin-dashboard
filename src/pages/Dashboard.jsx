import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement, 
  ArcElement, 
  Title, 
  Tooltip, 
  Legend 
} from 'chart.js';
import { 
  DollarSign, 
  Users, 
  Calendar, 
  Activity, 
  PlusCircle, 
  UserPlus, 
  FileDown, 
  Settings, 
  Clock,
  Layout,
  CheckCircle,
  FileText
} from 'lucide-react';
import { userAPI, patientAPI, appointmentAPI, clinicAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useClinic } from '../context/ClinicContext';

// Register ChartJS elements
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default function Dashboard() {
  const { user, isAdmin } = useAuth();
  const { selectedClinicId, clinics } = useClinic();
  const navigate = useNavigate();
  
  // Dashboard states
  const [stats, setStats] = useState({
    totalPatients: 0,
    todayAppointmentsCount: 0,
    upcomingAppointmentsCount: 0,
    totalClinicsCount: 0,
  });

  const [todayAppointments, setTodayAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      setLoading(true);
      try {
        const queryParams = selectedClinicId && selectedClinicId !== 'all' ? { clinic_id: selectedClinicId } : {};

        const promises = [
          patientAPI.getPatients(queryParams),
          appointmentAPI.getAppointments(queryParams),
        ];

        if (isAdmin) {
          promises.push(clinicAPI.getClinics({ limit: 100 }));
        }

        const [patientsRes, apptsRes, clinicsRes] = await Promise.all(promises);

        const patientsCount = patientsRes?.data?.pagination?.total_records || patientsRes?.data?.count || patientsRes?.data?.data?.length || 0;
        const allAppts = apptsRes?.data?.data || apptsRes?.data || [];

        // Parse local date comparisons
        const todayStr = new Date().toDateString();
        
        const todayList = Array.isArray(allAppts) ? allAppts.filter((a) => {
          if (!a.date) return false;
          return new Date(a.date).toDateString() === todayStr;
        }) : [];

        const upcomingCount = Array.isArray(allAppts) ? allAppts.filter((a) => {
          if (!a.date) return false;
          return new Date(a.date) >= new Date() && a.status === 'scheduled';
        }).length : 0;

        setStats({
          totalPatients: patientsCount,
          todayAppointmentsCount: todayList.length,
          upcomingAppointmentsCount: upcomingCount,
          totalClinicsCount: clinicsRes?.data?.pagination?.total_records || clinicsRes?.data?.data?.length || clinics.length || 0,
        });

        setTodayAppointments(todayList.slice(0, 5));
      } catch (err) {
        console.error("Error fetching dashboard counts:", err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, [selectedClinicId, isAdmin]);

  // Charts Mock Data
  const revenueChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'Revenue (₹)',
        data: [28000, 35000, 31000, 42000, 49000, 44000, 56000, 62000, 58000, 69000, 72000, 85000],
        borderColor: '#378ADD',
        backgroundColor: 'rgba(55, 138, 221, 0.1)',
        fill: true,
        tension: 0.3,
      }
    ]
  };

  const appointmentsChartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'This Week',
        data: [12, 19, 15, 24, 22, 10, 5],
        backgroundColor: '#378ADD',
      },
      {
        label: 'Last Week',
        data: [8, 14, 18, 19, 26, 12, 3],
        backgroundColor: '#7F77DD',
      }
    ]
  };

  const sourcesChartData = {
    labels: ['Organic', 'Direct', 'Social', 'Referral', 'Email'],
    datasets: [
      {
        data: [45, 25, 15, 10, 5],
        backgroundColor: ['#378ADD', '#7F77DD', '#1D9E75', '#BA7517', '#E24B4A'],
        borderWidth: 1,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: 'var(--color-text-secondary)',
        }
      }
    },
    scales: {
      x: {
        ticks: { color: 'var(--color-text-secondary)' },
        grid: { color: 'var(--color-border)' }
      },
      y: {
        ticks: { color: 'var(--color-text-secondary)' },
        grid: { color: 'var(--color-border)' }
      }
    }
  };

  return (
    <div>
      {/* Welcome Greeting Card */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        marginBottom: '24px', 
        backgroundColor: 'var(--color-bg)', 
        padding: '16px 20px', 
        borderRadius: 'var(--radius-lg)', 
        border: '1px solid var(--color-border)' 
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ 
            width: '48px', 
            height: '48px', 
            borderRadius: '50%', 
            backgroundColor: 'var(--color-primary)', 
            color: '#fff', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            fontWeight: 'bold', 
            fontSize: '18px' 
          }}>
            {user?.full_name ? user.full_name.split(' ').map(n => n[0]).join('').toUpperCase() : 'AD'}
          </div>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}>Hello, {user?.full_name || 'Dr. Bhumesh Kewat'}</h2>
            <p style={{ fontSize: '13px', color: 'var(--color-text-tertiary)', margin: '2px 0 0' }}>
              {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-secondary" onClick={() => alert('Exporting dashboard metrics to CSV...')}>
            <FileDown size={14} /> Export CSV
          </button>
          <button className="btn btn-primary" onClick={() => navigate('/appointments')}>
            <PlusCircle size={14} /> New Appointment
          </button>
        </div>
      </div>

      {/* KPI Row (Styled like Mobile App Grid Cards) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {/* KPI 1 - Total Patients */}
        <div style={{ 
          background: 'linear-gradient(135deg, #13B2A1, #088377)', 
          color: '#fff', 
          borderRadius: 'var(--radius-lg)', 
          padding: '20px', 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'space-between',
          minHeight: '130px',
          boxShadow: 'var(--shadow-md)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '14px', fontWeight: '500', opacity: 0.9 }}>Total Patients</span>
            <Users size={20} style={{ opacity: 0.8 }} />
          </div>
          <h2 style={{ fontSize: '36px', fontWeight: 'bold', margin: '10px 0 0' }}>{stats.totalPatients}</h2>
          <span style={{ fontSize: '11px', opacity: 0.7 }}>Registered patient files</span>
        </div>

        {/* KPI 2 - Today's Appointments */}
        <div style={{ 
          background: 'linear-gradient(135deg, #6C63FF, #483DF6)', 
          color: '#fff', 
          borderRadius: 'var(--radius-lg)', 
          padding: '20px', 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'space-between',
          minHeight: '130px',
          boxShadow: 'var(--shadow-md)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '14px', fontWeight: '500', opacity: 0.9 }}>Today's Appts</span>
            <Calendar size={20} style={{ opacity: 0.8 }} />
          </div>
          <h2 style={{ fontSize: '36px', fontWeight: 'bold', margin: '10px 0 0' }}>{stats.todayAppointmentsCount}</h2>
          <span style={{ fontSize: '11px', opacity: 0.7 }}>Consultations scheduled today</span>
        </div>

        {/* KPI 3 - Upcoming Appointments */}
        <div style={{ 
          background: 'linear-gradient(135deg, #FFB830, #E4930A)', 
          color: '#fff', 
          borderRadius: 'var(--radius-lg)', 
          padding: '20px', 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'space-between',
          minHeight: '130px',
          boxShadow: 'var(--shadow-md)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '14px', fontWeight: '500', opacity: 0.9 }}>Upcoming</span>
            <Clock size={20} style={{ opacity: 0.8 }} />
          </div>
          <h2 style={{ fontSize: '36px', fontWeight: 'bold', margin: '10px 0 0' }}>{stats.upcomingAppointmentsCount}</h2>
          <span style={{ fontSize: '11px', opacity: 0.7 }}>Active upcoming slots</span>
        </div>
      </div>

      {/* Quick Actions Panel (Grid matching screenshot styling) */}
      <div className="card" style={{ marginBottom: '24px', padding: '20px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '16px' }}>Quick Actions</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <button className="btn btn-secondary" onClick={() => navigate('/patients')} style={{ height: '80px', flexDirection: 'row', gap: '12px', justifyContent: 'flex-start', padding: '0 20px', border: '1px solid var(--color-border)' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--color-success-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <UserPlus size={20} color="var(--color-success)" />
            </div>
            <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--color-text-primary)' }}>Add Patient</span>
          </button>
          
          <button className="btn btn-secondary" onClick={() => navigate('/appointments')} style={{ height: '80px', flexDirection: 'row', gap: '12px', justifyContent: 'flex-start', padding: '0 20px', border: '1px solid var(--color-border)' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--color-primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Calendar size={20} color="var(--color-primary)" />
            </div>
            <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--color-text-primary)', textAlign: 'left' }}>Create Appointment</span>
          </button>

          <button className="btn btn-secondary" onClick={() => navigate('/templates')} style={{ height: '80px', flexDirection: 'row', gap: '12px', justifyContent: 'flex-start', padding: '0 20px', border: '1px solid var(--color-border)' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--color-info-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FileText size={20} color="var(--color-info)" />
            </div>
            <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--color-text-primary)' }}>Create Template</span>
          </button>

          <button className="btn btn-secondary" onClick={() => navigate('/settings')} style={{ height: '80px', flexDirection: 'row', gap: '12px', justifyContent: 'flex-start', padding: '0 20px', border: '1px solid var(--color-border)' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--color-warning-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Settings size={20} color="var(--color-warning)" />
            </div>
            <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--color-text-primary)' }}>Clinic Settings</span>
          </button>
        </div>
      </div>

      {/* Today's Schedule & Charts */}
      <div className="charts-grid">
        {/* Today's Schedule list */}
        <div className="chart-card" style={{ gridColumn: 'span 2' }}>
          <div className="chart-header">
            <h3 className="chart-title">Today's Schedule</h3>
            <span className="auth-link" style={{ fontSize: '13px', cursor: 'pointer' }} onClick={() => navigate('/appointments')}>View All</span>
          </div>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-tertiary)' }}>Loading schedule...</div>
          ) : todayAppointments.length === 0 ? (
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center', 
              padding: '60px 20px', 
              textAlign: 'center',
              gap: '12px'
            }}>
              <div style={{ 
                width: '64px', 
                height: '64px', 
                borderRadius: '50%', 
                backgroundColor: 'var(--color-success-light)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center' 
              }}>
                <CheckCircle size={32} color="var(--color-success)" />
              </div>
              <h4 style={{ fontSize: '15px', fontWeight: 'bold', color: 'var(--color-text-primary)' }}>No appointments scheduled for today.</h4>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Patient Name</th>
                    <th>Doctor In-Charge</th>
                    <th>Time Slot</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {todayAppointments.map((appt) => (
                    <tr key={appt._id}>
                      <td style={{ fontWeight: 'bold' }}>{appt.patient_id?.full_name || 'Walk-in'}</td>
                      <td>{appt.doctor_id?.full_name || 'Clinic Doctor'}</td>
                      <td>{appt.time}</td>
                      <td>
                        <span className={`badge ${
                          appt.status === 'completed' || appt.status === 'confirmed' ? 'badge-success' : 
                          appt.status === 'cancelled' ? 'badge-danger' : 'badge-warning'
                        }`}>
                          {appt.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Traffic Channels mock chart to keep panel complete */}
        <div className="chart-card">
          <div className="chart-header">
            <h3 className="chart-title">Traffic Channels</h3>
          </div>
          <div className="chart-container" style={{ display: 'flex', justifyContent: 'center' }}>
            <Doughnut 
              data={sourcesChartData} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom',
                    labels: { color: 'var(--color-text-secondary)' }
                  }
                }
              }} 
            />
          </div>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="charts-grid">
        <div className="chart-card chart-card-full">
          <div className="chart-header">
            <h3 className="chart-title">Revenue Forecast (12 Months)</h3>
            <span style={{ fontSize: '12px', color: 'var(--color-text-tertiary)' }}>Live Updates</span>
          </div>
          <div className="chart-container">
            <Line data={revenueChartData} options={chartOptions} />
          </div>
        </div>
      </div>
    </div>
  );
}
