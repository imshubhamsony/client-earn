import React, { useState, useEffect } from 'react';
import api from '../../api/axios';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const load = () => api.get('/users/admin').then((r) => setUsers(r.data.users || [])).catch(() => {});

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, []);

  const toggleBlock = async (u) => {
    try {
      if (u.isBlocked) {
        await api.put(`/users/admin/${u._id}/unblock`);
        setMessage('User unblocked.');
      } else {
        await api.put(`/users/admin/${u._id}/block`);
        setMessage('User blocked.');
      }
      await load();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed');
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <>
      <h1 style={{ marginBottom: '0.5rem' }}>Users</h1>
      <p style={{ color: 'var(--muted)', marginBottom: '1.5rem' }}>View and block users.</p>

      {message && <p style={{ color: 'var(--primary)', marginBottom: '1rem' }}>{message}</p>}

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              <th style={{ textAlign: 'left', padding: '0.5rem 0' }}>Name</th>
              <th style={{ textAlign: 'left', padding: '0.5rem 0' }}>Email</th>
              <th style={{ textAlign: 'left', padding: '0.5rem 0' }}>Balance</th>
              <th style={{ textAlign: 'left', padding: '0.5rem 0' }}>Total earned</th>
              <th style={{ textAlign: 'left', padding: '0.5rem 0' }}>Referral code</th>
              <th style={{ textAlign: 'left', padding: '0.5rem 0' }}>Status</th>
              <th style={{ textAlign: 'left', padding: '0.5rem 0' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '0.5rem 0' }}>{u.name}</td>
                <td style={{ padding: '0.5rem 0' }}>{u.email}</td>
                <td style={{ padding: '0.5rem 0' }}>₹{u.walletBalance ?? 0}</td>
                <td style={{ padding: '0.5rem 0' }}>₹{u.totalEarned ?? 0}</td>
                <td style={{ padding: '0.5rem 0', fontFamily: 'monospace' }}>{u.referralCode}</td>
                <td style={{ padding: '0.5rem 0' }}>
                  {u.isBlocked ? <span className="badge badge-rejected">Blocked</span> : <span className="badge badge-approved">Active</span>}
                </td>
                <td style={{ padding: '0.5rem 0' }}>
                  <button type="button" className={u.isBlocked ? 'btn-primary' : 'btn-ghost'} onClick={() => toggleBlock(u)}>
                    {u.isBlocked ? 'Unblock' : 'Block'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {users.length === 0 && <p style={{ color: 'var(--muted)', marginTop: '1rem' }}>No users.</p>}
    </>
  );
}
