import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const nav = [
  { to: '/admin', label: 'Dashboard' },
  { to: '/admin/tasks', label: 'Tasks' },
  { to: '/admin/submissions', label: 'Submissions' },
  { to: '/admin/withdrawals', label: 'Withdrawals' },
  { to: '/admin/users', label: 'Users' },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <>
      <header style={{
        borderBottom: '1px solid var(--border)',
        padding: '0.75rem 1rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.5rem',
      }}>
        <Link to="/admin" style={{ fontWeight: 700, color: 'var(--text)', textDecoration: 'none' }}>EarnTask Admin</Link>
        <nav style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          {nav.map(({ to, label }) => (
            <Link key={to} to={to} style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>{label}</Link>
          ))}
          <span style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>{user?.email}</span>
          <button type="button" className="btn-ghost" onClick={handleLogout}>Logout</button>
        </nav>
      </header>
      <main style={{ flex: 1, padding: '1.5rem 0' }}>
        <div className="container">
          <Outlet />
        </div>
      </main>
    </>
  );
}
