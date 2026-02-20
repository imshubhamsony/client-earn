import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

import Login from './pages/Login';
import Register from './pages/Register';
import AdminLogin from './pages/AdminLogin';
import Dashboard from './pages/Dashboard';
import Tasks from './pages/Tasks';
import Wallet from './pages/Wallet';
import Referral from './pages/Referral';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminTasks from './pages/admin/AdminTasks';
import AdminSubmissions from './pages/admin/AdminSubmissions';
import AdminWithdrawals from './pages/admin/AdminWithdrawals';
import AdminUsers from './pages/admin/AdminUsers';

function PrivateRoute({ children, adminOnly }) {
  const { user, loading, isAdmin } = useAuth();
  if (loading) return <div className="auth-screen" style={{ justifyContent: 'center' }}><p style={{ color: 'var(--muted)' }}>Loading...</p></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && !isAdmin) return <Navigate to="/" replace />;
  return children;
}

function PublicRedirect({ children }) {
  const { user, loading, isAdmin } = useAuth();
  if (loading) return <div className="auth-screen" style={{ justifyContent: 'center' }}><p style={{ color: 'var(--muted)' }}>Loading...</p></div>;
  if (user && isAdmin) return <Navigate to="/admin" replace />;
  if (user) return <Navigate to="/dashboard" replace />;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <div className="app">
        <Routes>
          <Route path="/login" element={<PublicRedirect><Login /></PublicRedirect>} />
          <Route path="/register" element={<PublicRedirect><Register /></PublicRedirect>} />
          <Route path="/admin/login" element={<PublicRedirect><AdminLogin /></PublicRedirect>} />

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/tasks" element={<PrivateRoute><Tasks /></PrivateRoute>} />
          <Route path="/wallet" element={<PrivateRoute><Wallet /></PrivateRoute>} />
          <Route path="/referral" element={<PrivateRoute><Referral /></PrivateRoute>} />

          <Route path="/admin" element={<PrivateRoute adminOnly><AdminLayout /></PrivateRoute>}>
            <Route index element={<AdminDashboard />} />
            <Route path="tasks" element={<AdminTasks />} />
            <Route path="submissions" element={<AdminSubmissions />} />
            <Route path="withdrawals" element={<AdminWithdrawals />} />
            <Route path="users" element={<AdminUsers />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </AuthProvider>
  );
}
