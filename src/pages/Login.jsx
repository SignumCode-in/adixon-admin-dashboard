import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import { Stethoscope, Lock, Mail, Eye, EyeOff, Hospital } from 'lucide-react';

export default function Login() {
  const { user, loginClinic, loginWithGoogle, theme, toggleTheme } = useAuth();
  const navigate = useNavigate();

  // If already authenticated, redirect appropriately
  useEffect(() => {
    if (user) {
      if (user.role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
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

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const res = await loginClinic(email, password);
      if (res?.user?.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    setMessage('');
    try {
      await loginWithGoogle();
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || err.message || 'Google Login failed.');
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
      setMessage('An OTP has been sent to your email.');
      setMode('verify');
    } catch (err) {
      setError(err.response?.data?.message || 'Error requesting password reset.');
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
      setMessage('OTP verified. Set your new password below.');
      setMode('reset');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired OTP.');
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
      setMessage('Password updated successfully. Please log in.');
      setMode('login');
      setPassword('');
      setNewPassword('');
    } catch (err) {
      setError(err.response?.data?.message || 'Error updating password.');
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
          <h2 className="auth-title" style={{ letterSpacing: '-0.02em' }}>Adixon Clinic Portal</h2>
          <p className="auth-subtitle">Healthcare provider & clinical staff access</p>
        </div>

        {error && (
          <div className="badge badge-danger" style={{ display: 'block', width: '100%', padding: '12px 14px', borderRadius: '8px', marginBottom: '18px', fontSize: '13px', textAlign: 'center' }}>
            {error}
          </div>
        )}

        {message && (
          <div className="badge badge-success" style={{ display: 'block', width: '100%', padding: '12px 14px', borderRadius: '8px', marginBottom: '18px', fontSize: '13px', textAlign: 'center' }}>
            {message}
          </div>
        )}

        {mode === 'login' && (
          <form onSubmit={handleLoginSubmit}>
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Mail size={13} style={{ color: 'var(--color-primary)' }} />
                Email Address
              </label>
              <input
                type="email"
                className="input-field"
                placeholder="doctor@clinic.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div className="form-group" style={{ marginBottom: '8px' }}>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Lock size={13} style={{ color: 'var(--color-primary)' }} />
                Password
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
                Forgot Password?
              </span>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ 
                width: '100%', 
                justifyContent: 'center', 
                marginBottom: '12px',
                padding: '12px',
                fontSize: '14px',
                fontWeight: '600'
              }} 
              disabled={loading}
            >
              {loading ? 'Authenticating...' : 'Sign In to Clinic'}
            </button>
            
            <div style={{ textAlign: 'center', margin: '14px 0', color: 'var(--color-text-secondary)', fontSize: '12px' }}>OR</div>
            
            <button
              type="button"
              className="btn btn-secondary"
              style={{ width: '100%', justifyContent: 'center', padding: '11px', fontSize: '13px' }}
              onClick={handleGoogleLogin}
              disabled={loading}
            >
              <svg style={{ width: '18px', height: '18px', marginRight: '8px' }} viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Sign in with Google
            </button>
          </form>
        )}

        {mode === 'forgot' && (
          <form onSubmit={handleForgotSubmit}>
            <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '18px', textAlign: 'center', lineHeight: '1.5' }}>
              Enter your registered clinical email address below. We will send you a 6-digit verification code.
            </p>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="input-field"
                placeholder="name@clinic.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginBottom: '12px' }} disabled={loading}>
              {loading ? 'Sending Code...' : 'Send Verification OTP'}
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
              Back to Login
            </button>
          </form>
        )}

        {mode === 'verify' && (
          <form onSubmit={handleVerifySubmit}>
            <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '18px', textAlign: 'center', lineHeight: '1.5' }}>
              Enter the 6-digit OTP code sent to <strong>{email}</strong>.
            </p>

            <div className="form-group">
              <label className="form-label">6-Digit OTP</label>
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
              {loading ? 'Verifying...' : 'Verify Code'}
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
              Verification successful. Enter your new secure password below.
            </p>

            <div className="form-group">
              <label className="form-label">New Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  className="input-field"
                  placeholder="At least 6 characters"
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
              {loading ? 'Updating Credentials...' : 'Reset Password'}
            </button>
          </form>
        )}

        <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--color-border)', textAlign: 'center' }}>
          <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '8px' }}>
            System or Platform Administrator?
          </p>
          <button 
            type="button"
            className="btn btn-secondary" 
            style={{ width: '100%', justifyContent: 'center', fontSize: '13px', gap: '6px' }}
            onClick={() => navigate('/admin/login')}
          >
            Sign In to Master Admin Console &rarr;
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
