import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ users: 0, tasks: 0, pendingSubmissions: 0, pendingWithdrawals: 0 });

  useEffect(() => {
    (async () => {
      try {
        const [uRes, tRes, sRes, wRes] = await Promise.all([
          api.get('/users/admin'),
          api.get('/tasks/admin'),
          api.get('/tasks/admin/submissions?status=pending'),
          api.get('/withdrawals/admin?status=pending'),
        ]);
        setStats({
          users: (uRes.data.users || []).length,
          tasks: (tRes.data.tasks || []).length,
          pendingSubmissions: (sRes.data.submissions || []).length,
          pendingWithdrawals: (wRes.data.withdrawals || []).length,
        });
      } catch (_) {}
    })();
  }, []);

  return (
    <>
      <h1 style={{ marginBottom: '0.5rem' }}>Admin Dashboard</h1>
      <p style={{ color: 'var(--muted)', marginBottom: '1.5rem' }}>Manage tasks, submissions & withdrawals.</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div className="card">
          <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>Users</p>
          <p style={{ fontSize: '1.5rem', fontWeight: 700 }}>{stats.users}</p>
          <Link to="/admin/users" style={{ fontSize: '0.9rem' }}>View →</Link>
        </div>
        <div className="card">
          <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>Tasks</p>
          <p style={{ fontSize: '1.5rem', fontWeight: 700 }}>{stats.tasks}</p>
          <Link to="/admin/tasks" style={{ fontSize: '0.9rem' }}>Manage →</Link>
        </div>
        <div className="card">
          <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>Pending submissions</p>
          <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--warning)' }}>{stats.pendingSubmissions}</p>
          <Link to="/admin/submissions" style={{ fontSize: '0.9rem' }}>Review →</Link>
        </div>
        <div className="card">
          <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>Pending withdrawals</p>
          <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--warning)' }}>{stats.pendingWithdrawals}</p>
          <Link to="/admin/withdrawals" style={{ fontSize: '0.9rem' }}>Review →</Link>
        </div>
      </div>

      <div className="card">
        <h2 style={{ marginBottom: '0.75rem', fontSize: '1.1rem' }}>Quick links</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
          <Link to="/admin/tasks"><button type="button" className="btn-primary">Create task</button></Link>
          <Link to="/admin/submissions"><button type="button" className="btn-ghost">Task submissions</button></Link>
          <Link to="/admin/withdrawals"><button type="button" className="btn-ghost">Withdrawals</button></Link>
        </div>
      </div>
    </>
  );
}
