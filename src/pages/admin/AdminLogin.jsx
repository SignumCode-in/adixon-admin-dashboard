import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../services/api';
import { ShieldCheck, Lock, Mail, Eye, EyeOff, KeyRound } from 'lucide-react';

export default function AdminLogin() {
  const { user, loginAdmin, theme, toggleTheme } = useAuth();
  const navigate = useNavigate();

  // If already authenticated as admin, redirect to admin dashboard
  useEffect(() => {
    if (user && user.role === 'admin') {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [user, navigate]);

  // Screen modes: 'login' | 'forgot' | 'verify' | 'reset'
  const [mode, setMode] = useState('login');

  // Input states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleAdminLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    try {
      await loginAdmin(email, password);
      navigate('/admin/dashboard');
    } catch (err) {
      console.error('Admin authentication error:', err);
      // USER REQUIREMENT: Treat non-admin or failed auth strictly as "Invalid credentials."
      setError('Invalid credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await authAPI.forgotPassword(email);
      setMessage('A verification code has been dispatched to your email.');
      setMode('verify');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to request password reset.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifySubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await authAPI.verifyOtp(email, otp);
      setMessage('Code verified. Set your new administrative password.');
      setMode('reset');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired OTP code.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await authAPI.resetPassword(email, otp, newPassword);
      setMessage('Password updated successfully. Please authenticate.');
      setMode('login');
      setPassword('');
      setNewPassword('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card" style={{ maxWidth: '440px' }}>
        <div className="auth-header">
          <img 
            src="/adixon-logo.png" 
            alt="Adixon Clinic OS" 
            style={{ 
              height: '42px', 
              maxWidth: '180px', 
              objectFit: 'contain', 
              margin: '0 auto 18px', 
              display: 'block' 
            }} 
          />
          <h2 className="auth-title" style={{ letterSpacing: '-0.02em' }}>Platform Administration</h2>
          <p className="auth-subtitle">Master command center & multi-tenant governance</p>
        </div>

        {error && (
          <div 
            className="badge badge-danger" 
            style={{ 
              display: 'block', 
              width: '100%', 
              padding: '12px 14px', 
              borderRadius: '8px', 
              marginBottom: '18px', 
              fontSize: '13px',
              textAlign: 'center',
              boxShadow: '0 2px 8px rgba(239, 68, 68, 0.15)'
            }}
          >
            {error}
          </div>
        )}

        {message && (
          <div 
            className="badge badge-success" 
            style={{ 
              display: 'block', 
              width: '100%', 
              padding: '12px 14px', 
              borderRadius: '8px', 
              marginBottom: '18px', 
              fontSize: '13px',
              textAlign: 'center'
            }}
          >
            {message}
          </div>
        )}

        {mode === 'login' && (
          <form onSubmit={handleAdminLoginSubmit}>
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Mail size={13} style={{ color: 'var(--color-primary)' }} />
                Administrator Email
              </label>
              <input
                type="email"
                className="input-field"
                placeholder="admin@adixon.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div className="form-group" style={{ marginBottom: '8px' }}>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Lock size={13} style={{ color: 'var(--color-primary)' }} />
                Security Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="input-field"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  style={{ paddingRight: '42px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--color-text-tertiary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '4px',
                  }}
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
              <span
                className="auth-link"
                style={{ fontSize: '12px', cursor: 'pointer' }}
                onClick={() => {
                  setError('');
                  setMessage('');
                  setMode('forgot');
                }}
              >
                Recover Credentials
              </span>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ 
                width: '100%', 
                justifyContent: 'center', 
                padding: '12px',
                fontSize: '14px',
                fontWeight: '600',
                background: 'linear-gradient(135deg, #4f46e5, #4338ca)',
                border: 'none',
                boxShadow: '0 4px 14px rgba(79, 70, 229, 0.35)'
              }} 
              disabled={loading}
            >
              {loading ? 'Authenticating Admin...' : 'Enter Admin Console'}
            </button>
          </form>
        )}

        {mode === 'forgot' && (
          <form onSubmit={handleForgotSubmit}>
            <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '18px', textAlign: 'center', lineHeight: '1.5' }}>
              Enter your master administrator email below. A secure 6-digit OTP verification token will be dispatched.
            </p>

            <div className="form-group">
              <label className="form-label">Administrator Email</label>
              <input
                type="email"
                className="input-field"
                placeholder="admin@adixon.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginBottom: '12px' }} disabled={loading}>
              {loading ? 'Dispatching OTP...' : 'Send Recovery Token'}
            </button>

            <button
              type="button"
              className="btn btn-secondary"
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={() => {
                setError('');
                setMessage('');
                setMode('login');
              }}
            >
              Back to Sign In
            </button>
          </form>
        )}

        {mode === 'verify' && (
          <form onSubmit={handleVerifySubmit}>
            <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '18px', textAlign: 'center', lineHeight: '1.5' }}>
              Enter the 6-digit OTP token delivered to <strong>{email}</strong>.
            </p>

            <div className="form-group">
              <label className="form-label">Verification Token</label>
              <input
                type="text"
                className="input-field"
                placeholder="123456"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                style={{ textAlign: 'center', letterSpacing: '0.5em', fontSize: '18px', fontWeight: 'bold' }}
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginBottom: '12px' }} disabled={loading}>
              {loading ? 'Verifying...' : 'Validate Code'}
            </button>

            <button
              type="button"
              className="btn btn-secondary"
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={() => {
                setError('');
                setMessage('');
                setMode('forgot');
              }}
            >
              Resend Code
            </button>
          </form>
        )}

        {mode === 'reset' && (
          <form onSubmit={handleResetSubmit}>
            <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '18px', textAlign: 'center', lineHeight: '1.5' }}>
              Validation confirmed. Enter your new strong administrator password below.
            </p>

            <div className="form-group">
              <label className="form-label">New Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  className="input-field"
                  placeholder="Minimum 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  style={{ paddingRight: '42px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--color-text-tertiary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '4px',
                  }}
                  title={showNewPassword ? 'Hide password' : 'Show password'}
                >
                  {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
              {loading ? 'Updating Credentials...' : 'Save New Password'}
            </button>
          </form>
        )}

        <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--color-border)', textAlign: 'center' }}>
          <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '8px' }}>
            Healthcare Provider or Clinic Staff?
          </p>
          <button 
            type="button"
            className="btn btn-secondary" 
            style={{ width: '100%', justifyContent: 'center', fontSize: '13px', gap: '6px' }}
            onClick={() => navigate('/login')}
          >
            &larr; Return to Clinic Portal Login
          </button>
        </div>

        <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'center' }}>
          <button
            onClick={toggleTheme}
            className="btn btn-secondary"
            style={{ fontSize: '11px', padding: '6px 14px', borderRadius: '20px' }}
          >
            Switch to {theme === 'light' ? 'Dark' : 'Light'} Mode
          </button>
        </div>
      </div>
    </div>
  );
}
