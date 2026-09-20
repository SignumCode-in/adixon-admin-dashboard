import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, userAPI } from '../services/api';
import { auth, googleProvider } from '../config/firebase';
import { signInWithPopup } from 'firebase/auth';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');

  // Load user from localStorage and verify live session with backend
  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('id_token');
      const savedUser = localStorage.getItem('user');

      if (savedToken && savedUser) {
        setToken(savedToken);

        // Fresh profile fetch from backend to verify session validity
        try {
          const res = await userAPI.getMe();
          if (res && res.data) {
            setUser(res.data);
            localStorage.setItem('user', JSON.stringify(res.data));
          }
        } catch (err) {
          console.warn('Could not refresh user profile on init:', err?.message);
          if (err.response?.status === 401 || err.response?.data?.session_revoked) {
            setUser(null);
            setToken(null);
            localStorage.removeItem('id_token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('session_id');
            localStorage.removeItem('user');
            const isAdminPath = window.location.pathname.startsWith('/admin');
            window.location.href = isAdminPath ? '/admin/login' : '/login';
            return;
          }
          // Only fallback to cached user if backend was unreachable
          try {
            setUser(JSON.parse(savedUser));
          } catch (e) {
            console.error('Failed to parse cached user:', e);
          }
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  // Update theme in DOM & localStorage
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const loginUser = async (email, password) => {
    return loginClinic(email, password);
  };

  const loginClinic = async (email, password) => {
    setLoading(true);
    try {
      // 1. Generate Firebase token via backend endpoint
      const tokenRes = await authAPI.generateToken(email, password);
      const idToken = tokenRes.data.id_token;
      const refreshToken = tokenRes.data.refresh_token;

      // 2. Pass ID token to login route to load user from MongoDB
      const loginRes = await authAPI.login(idToken);
      const userProfile = loginRes.data.user;

      // 3. Save to state & storage
      setToken(idToken);
      setUser(userProfile);
      localStorage.setItem('id_token', idToken);
      localStorage.setItem('refresh_token', refreshToken);
      localStorage.setItem('user', JSON.stringify(userProfile));
      if (loginRes.data?.session_id) {
        localStorage.setItem('session_id', loginRes.data.session_id);
      }

      return { success: true, user: userProfile };
    } catch (error) {
      console.error('Clinic login failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loginAdmin = async (email, password) => {
    setLoading(true);
    try {
      // 1. Generate Firebase token via backend endpoint
      const tokenRes = await authAPI.generateToken(email, password);
      const idToken = tokenRes.data.id_token;
      const refreshToken = tokenRes.data.refresh_token;

      // 2. Pass ID token to login route to load user from MongoDB
      const loginRes = await authAPI.login(idToken);
      const userProfile = loginRes.data.user;

      // STRICT SECURITY CHECK: Reject non-admin credentials immediately without leaking role
      if (!userProfile || userProfile.role !== 'admin') {
        // Clear any residue and reject with generic message
        localStorage.removeItem('id_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
        const err = new Error('Invalid credentials.');
        err.isUnauthorized = true;
        throw err;
      }

      // 3. Save to state & storage for verified admin
      setToken(idToken);
      setUser(userProfile);
      localStorage.setItem('id_token', idToken);
      localStorage.setItem('refresh_token', refreshToken);
      localStorage.setItem('user', JSON.stringify(userProfile));
      if (loginRes.data?.session_id) {
        localStorage.setItem('session_id', loginRes.data.session_id);
      }

      return { success: true, user: userProfile };
    } catch (error) {
      console.error('Admin login failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();
      const refreshToken = result.user.refreshToken;

      const loginRes = await authAPI.login(idToken);
      const userProfile = loginRes.data.user;

      setToken(idToken);
      setUser(userProfile);
      localStorage.setItem('id_token', idToken);
      localStorage.setItem('refresh_token', refreshToken);
      localStorage.setItem('user', JSON.stringify(userProfile));

      return { success: true };
    } catch (error) {
      console.error('Google login failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const registerUser = async (registrationData) => {
    setLoading(true);
    try {
      // Create user (and clinic, if doctor role)
      const res = await userAPI.createUser(registrationData);
      return res;
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logoutUser = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always clear state and localStorage
      setToken(null);
      setUser(null);
      localStorage.removeItem('id_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('session_id');
      localStorage.removeItem('user');
    }
  };

  const hasPermission = (perm) => {
    if (!user) return false;
    if (user.role === 'admin' || user.role === 'doctor') return true;
    if (user.role === 'staff') {
      if (perm === 'medicines') return true;
      const perms = user.permissions || [];
      return perms.includes(perm);
    }
    return false;
  };

  const refreshUserProfile = async () => {
    try {
      const res = await userAPI.getMe();
      if (res && res.data) {
        setUser(res.data);
        localStorage.setItem('user', JSON.stringify(res.data));
        return res.data;
      }
    } catch (err) {
      console.warn('Failed to refresh user profile:', err);
    }
    return null;
  };

  const isAdmin = user?.role === 'admin';
  const isDoctor = user?.role === 'doctor';
  const isStaff = user?.role === 'staff';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        theme,
        toggleTheme,
        login: loginUser,
        loginClinic,
        loginAdmin,
        loginWithGoogle,
        register: registerUser,
        logout: logoutUser,
        setUser,
        refreshUserProfile,
        hasPermission,
        isAdmin,
        isDoctor,
        isStaff,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
