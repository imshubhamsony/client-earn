import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const nav = [
  { to: '/dashboard', label: 'Home', icon: '🏠' },
  { to: '/tasks', label: 'Tasks', icon: '📋' },
  { to: '/wallet', label: 'Wallet', icon: '💰' },
  { to: '/referral', label: 'Refer', icon: '🔗' },
];

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    setMenuOpen(false);
    logout();
    navigate('/login');
  };

  return (
    <>
      <header className="top-bar">
        <span className="top-bar__title">EarnTask</span>
        <span className="top-bar__balance">₹{user?.walletBalance ?? 0}</span>
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            className="btn-ghost"
            style={{ padding: '8px 12px', minHeight: 36 }}
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Menu"
          >
            ⋮
          </button>
          {menuOpen && (
            <>
              <div
                style={{ position: 'fixed', inset: 0, zIndex: 21 }}
                onClick={() => setMenuOpen(false)}
                aria-hidden="true"
              />
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: 4,
                  background: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  padding: 8,
                  minWidth: 140,
                  zIndex: 22,
                }}
              >
                <div style={{ padding: '8px 12px', fontSize: '0.9rem', color: 'var(--muted)' }}>{user?.email}</div>
                <button type="button" className="btn-ghost" style={{ width: '100%', justifyContent: 'center' }} onClick={handleLogout}>
                  Logout
                </button>
              </div>
            </>
          )}
        </div>
      </header>

      <main className="page">
        {children}
      </main>

      <nav className="bottom-nav" role="navigation">
        {nav.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `bottom-nav__item ${isActive ? 'active' : ''}`}
            end={to === '/dashboard'}
          >
            <span className="bottom-nav__icon">{icon}</span>
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </>
  );
}
