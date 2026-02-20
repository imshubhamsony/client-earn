import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const s = localStorage.getItem('earntask_user');
      return s ? JSON.parse(s) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(!!user);

  const fetchUser = async () => {
    try {
      const { data } = await api.get('/auth/me');
      setUser(data.user);
      localStorage.setItem('earntask_user', JSON.stringify(data.user));
      return data.user;
    } catch {
      setUser(null);
      localStorage.removeItem('earntask_user');
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchUser();
    else setLoading(false);
  }, []);

  useEffect(() => {
    const onUnauth = () => {
      setUser(null);
      localStorage.removeItem('earntask_user');
    };
    window.addEventListener('earntask_unauth', onUnauth);
    return () => window.removeEventListener('earntask_unauth', onUnauth);
  }, []);

  const login = async (email, password, deviceId) => {
    const { data } = await api.post('/auth/login', { email, password, deviceId: deviceId || undefined });
    setUser(data.user);
    localStorage.setItem('earntask_user', JSON.stringify(data.user));
    return data;
  };

  const register = async (name, email, password, referralCode) => {
    const deviceId = localStorage.getItem('earntask_device_id') || undefined;
    const { data } = await api.post('/auth/register', { name, email, password, referralCode, deviceId });
    setUser(data.user);
    localStorage.setItem('earntask_user', JSON.stringify(data.user));
    return data;
  };

  const adminLogin = async (email, password) => {
    const { data } = await api.post('/auth/admin/login', { email, password });
    setUser(data.user);
    localStorage.setItem('earntask_user', JSON.stringify(data.user));
    return data;
  };

  const logout = async () => {
    try { await api.post('/auth/logout'); } catch (_) {}
    setUser(null);
    localStorage.removeItem('earntask_user');
  };

  const refreshUser = () => fetchUser();

  const value = {
    user,
    loading,
    login,
    register,
    adminLogin,
    logout,
    refreshUser,
    isAdmin: user?.role === 'admin',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
