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
  Users, 
  Calendar, 
  FileSpreadsheet, 
  Hospital, 
  PlusCircle, 
  UserPlus, 
  Clock,
  CheckCircle,
  FileText
} from 'lucide-react';
import { patientAPI, appointmentAPI, prescriptionAPI, clinicAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useClinic } from '../context/ClinicContext';

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
  
  // KPI States
  const [stats, setStats] = useState({
    totalPatients: 0,
    todayAppointmentsCount: 0,
    upcomingAppointmentsCount: 0,
    totalPrescriptions: 0,
    totalClinicsCount: 0,
  });

  const [todayAppointments, setTodayAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Chart Datasets computed from real MongoDB database
  const [monthlyGrowthData, setMonthlyGrowthData] = useState({
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: []
  });

  const [appointmentStatusData, setAppointmentStatusData] = useState({
    labels: ['Scheduled', 'Completed', 'Cancelled', 'Rescheduled'],
    datasets: []
  });

  const [genderDistributionData, setGenderDistributionData] = useState({
    labels: ['Male', 'Female', 'Other'],
    datasets: []
  });

  useEffect(() => {
    async function loadDashboardData() {
      setLoading(true);
      try {
        const queryParams = selectedClinicId && selectedClinicId !== 'all' ? { clinic_id: selectedClinicId } : {};

        const promises = [
          patientAPI.getPatients(queryParams),
          appointmentAPI.getAppointments(queryParams),
          prescriptionAPI.getPrescriptions(queryParams),
        ];

        if (isAdmin) {
          promises.push(clinicAPI.getClinics({ limit: 100 }));
        }

        const [patientsRes, apptsRes, presRes, clinicsRes] = await Promise.allSettled(promises);

        const patientsList = patientsRes.status === 'fulfilled' ? (patientsRes.value?.data?.data || patientsRes.value?.data || []) : [];
        const apptsList = apptsRes.status === 'fulfilled' ? (apptsRes.value?.data?.data || apptsRes.value?.data || []) : [];
        const presList = presRes.status === 'fulfilled' ? (presRes.value?.data?.data || presRes.value?.data || []) : [];
        const clinicsList = clinicsRes?.status === 'fulfilled' ? (clinicsRes.value?.data?.data || clinicsRes.value?.data || []) : [];

        const todayStr = new Date().toDateString();
        
        const todayList = Array.isArray(apptsList) ? apptsList.filter((a) => {
          if (!a.date) return false;
          return new Date(a.date).toDateString() === todayStr;
        }) : [];

        const upcomingCount = Array.isArray(apptsList) ? apptsList.filter((a) => {
          if (!a.date) return false;
          return new Date(a.date) >= new Date() && a.status === 'scheduled';
        }).length : 0;

        setStats({
          totalPatients: Array.isArray(patientsList) ? patientsList.length : 0,
          todayAppointmentsCount: todayList.length,
          upcomingAppointmentsCount: upcomingCount,
          totalPrescriptions: Array.isArray(presList) ? presList.length : 0,
          totalClinicsCount: Array.isArray(clinicsList) ? clinicsList.length : clinics.length || 1,
        });

        setTodayAppointments(todayList.slice(0, 5));

        // 1. Calculate Real Monthly Patient Growth Chart Data
        const monthlyCounts = new Array(12).fill(0);
        if (Array.isArray(patientsList)) {
          patientsList.forEach((p) => {
            if (p.createdAt) {
              const monthIdx = new Date(p.createdAt).getMonth();
              if (monthIdx >= 0 && monthIdx < 12) monthlyCounts[monthIdx]++;
            }
          });
        }

        setMonthlyGrowthData({
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
          datasets: [
            {
              label: 'New Patients Registered',
              data: monthlyCounts,
              borderColor: '#378ADD',
              backgroundColor: 'rgba(55, 138, 221, 0.15)',
              fill: true,
              tension: 0.3,
            }
          ]
        });

        // 2. Calculate Real Appointment Status Breakdown Chart Data
        let scheduled = 0, completed = 0, cancelled = 0, rescheduled = 0;
        if (Array.isArray(apptsList)) {
          apptsList.forEach((a) => {
            const st = (a.status || 'scheduled').toLowerCase();
            if (st === 'completed') completed++;
            else if (st === 'cancelled') cancelled++;
            else if (st === 'rescheduled') rescheduled++;
            else scheduled++;
          });
        }

        setAppointmentStatusData({
          labels: ['Scheduled', 'Completed', 'Cancelled', 'Rescheduled'],
          datasets: [
            {
              label: 'Appointments Count',
              data: [scheduled, completed, cancelled, rescheduled],
              backgroundColor: ['#378ADD', '#1D9E75', '#E24B4A', '#BA7517'],
              borderWidth: 1,
            }
          ]
        });

        // 3. Calculate Real Gender Distribution Chart Data
        let male = 0, female = 0, other = 0;
        if (Array.isArray(patientsList)) {
          patientsList.forEach((p) => {
            const g = (p.gender || '').toLowerCase();
            if (g === 'female') female++;
            else if (g === 'male') male++;
            else other++;
          });
        }

        setGenderDistributionData({
          labels: ['Male', 'Female', 'Other'],
          datasets: [
            {
              data: [male, female, other],
              backgroundColor: ['#378ADD', '#7F77DD', '#1D9E75'],
              borderWidth: 1,
            }
          ]
        });

      } catch (err) {
        console.error("Error fetching dashboard counts:", err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, [selectedClinicId, isAdmin, clinics]);

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
            {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'D'}
          </div>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold' }}>Welcome back, Dr. {user?.full_name || 'Practitioner'}</h2>
            <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', margin: 0 }}>
              Live Clinic Dashboard • Real-time MongoDB patient & appointment metrics
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-primary" onClick={() => navigate('/patients?add=true')}>
            <UserPlus size={14} /> Register Patient
          </button>
          <button className="btn btn-secondary" onClick={() => navigate('/appointments')}>
            <PlusCircle size={14} /> Book Appointment
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="kpi-row" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', marginBottom: '24px' }}>
        <div className="card kpi-card">
          <div className="kpi-details">
            <span className="kpi-label">Registered Patients</span>
            <span className="kpi-value">{loading ? '...' : stats.totalPatients}</span>
            <span className="kpi-trend up">Total Database Entries</span>
          </div>
          <div className="kpi-icon-wrapper" style={{ backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)' }}>
            <Users size={20} />
          </div>
        </div>

        <div className="card kpi-card">
          <div className="kpi-details">
            <span className="kpi-label">Today's Appointments</span>
            <span className="kpi-value">{loading ? '...' : stats.todayAppointmentsCount}</span>
            <span className="kpi-trend up">Scheduled for today</span>
          </div>
          <div className="kpi-icon-wrapper" style={{ backgroundColor: 'var(--color-success-light)', color: 'var(--color-success)' }}>
            <Calendar size={20} />
          </div>
        </div>

        <div className="card kpi-card">
          <div className="kpi-details">
            <span className="kpi-label">Total Prescriptions</span>
            <span className="kpi-value">{loading ? '...' : stats.totalPrescriptions}</span>
            <span className="kpi-trend up">Issued by clinic doctors</span>
          </div>
          <div className="kpi-icon-wrapper" style={{ backgroundColor: 'var(--color-info-light)', color: 'var(--color-info)' }}>
            <FileSpreadsheet size={20} />
          </div>
        </div>

        <div className="card kpi-card">
          <div className="kpi-details">
            <span className="kpi-label">Upcoming Schedules</span>
            <span className="kpi-value">{loading ? '...' : stats.upcomingAppointmentsCount}</span>
            <span className="kpi-trend up">Pending bookings</span>
          </div>
          <div className="kpi-icon-wrapper" style={{ backgroundColor: 'rgba(168, 85, 247, 0.15)', color: '#a855f7' }}>
            <Clock size={20} />
          </div>
        </div>
      </div>

      {/* Real Charts Grid */}
      <div className="charts-grid" style={{ gridTemplateColumns: '2fr 1fr', marginBottom: '24px' }}>
        <div className="card chart-card">
          <div className="card-header" style={{ marginBottom: '16px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 'bold' }}>Monthly Patient Registrations (Live DB)</h3>
          </div>
          <div style={{ height: '260px' }}>
            {loading ? (
              <div style={{ textAlign: 'center', paddingTop: '100px', color: 'var(--color-text-tertiary)' }}>Computing monthly growth...</div>
            ) : (
              <Line data={monthlyGrowthData} options={chartOptions} />
            )}
          </div>
        </div>

        <div className="card chart-card">
          <div className="card-header" style={{ marginBottom: '16px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 'bold' }}>Patient Gender Distribution</h3>
          </div>
          <div style={{ height: '260px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {loading ? (
              <div style={{ color: 'var(--color-text-tertiary)' }}>Calculating demographics...</div>
            ) : (
              <Doughnut data={genderDistributionData} options={{ responsive: true, maintainAspectRatio: false }} />
            )}
          </div>
        </div>
      </div>

      {/* Today's Schedule Table */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 'bold' }}>Today's Scheduled Appointments</h3>
          <button className="btn btn-secondary" onClick={() => navigate('/appointments')} style={{ fontSize: '12px' }}>
            View Full Schedule
          </button>
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Patient Name</th>
                <th>Time Slot</th>
                <th>Doctor</th>
                <th>Notes</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {todayAppointments.map((a) => (
                <tr key={a._id}>
                  <td style={{ fontWeight: 'bold' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Users size={16} color="var(--color-primary)" />
                      {a.patient_id?.full_name || 'Patient Entry'}
                    </span>
                  </td>
                  <td>{a.time || a.time_slot || '10:00 AM'}</td>
                  <td>{a.doctor_id?.full_name || 'Primary Doctor'}</td>
                  <td>{a.notes || '-'}</td>
                  <td>
                    <span className={`badge ${a.status === 'completed' ? 'badge-success' : a.status === 'cancelled' ? 'badge-danger' : 'badge-info'}`}>
                      {a.status || 'scheduled'}
                    </span>
                  </td>
                </tr>
              ))}
              {todayAppointments.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '24px', color: 'var(--color-text-tertiary)' }}>
                    No appointments scheduled for today.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
