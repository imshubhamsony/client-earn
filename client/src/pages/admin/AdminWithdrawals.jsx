import React, { useState, useEffect } from 'react';
import api from '../../api/axios';

const statusTabs = ['pending', 'approved', 'rejected', 'paid'];

export default function AdminWithdrawals() {
  const [withdrawals, setWithdrawals] = useState([]);
  const [status, setStatus] = useState('pending');
  const [loading, setLoading] = useState(true);
  const [rejectReason, setRejectReason] = useState({});
  const [message, setMessage] = useState('');

  const load = () => api.get(`/withdrawals/admin?status=${status}`).then((r) => setWithdrawals(r.data.withdrawals || [])).catch(() => {});

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, [status]);

  const approve = async (id) => {
    try {
      await api.put(`/withdrawals/admin/${id}/approve`);
      setMessage('Approved. Deduct from wallet; mark as paid when payment sent.');
      await load();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed');
    }
  };

  const reject = async (id) => {
    const reason = rejectReason[id] || '';
    try {
      await api.put(`/withdrawals/admin/${id}/reject`, { reason });
      setRejectReason((p) => ({ ...p, [id]: '' }));
      setMessage('Rejected.');
      await load();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed');
    }
  };

  const markPaid = async (id) => {
    try {
      await api.put(`/withdrawals/admin/${id}/paid`);
      setMessage('Marked as paid.');
      await load();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed');
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <>
      <h1 style={{ marginBottom: '0.5rem' }}>Withdrawals</h1>
      <p style={{ color: 'var(--muted)', marginBottom: '1rem' }}>Review and approve withdrawal requests.</p>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        {statusTabs.map((s) => (
          <button
            key={s}
            type="button"
            className={status === s ? 'btn-primary' : 'btn-ghost'}
            onClick={() => setStatus(s)}
          >
            {s}
          </button>
        ))}
      </div>

      {message && <p style={{ color: 'var(--primary)', marginBottom: '1rem' }}>{message}</p>}

      {withdrawals.length === 0 ? (
        <p style={{ color: 'var(--muted)' }}>No withdrawals in this status.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {withdrawals.map((w) => (
            <div key={w._id} className="card">
              <div style={{ marginBottom: '0.5rem' }}>
                <strong>{w.user?.name}</strong> ({w.user?.email}) — Balance: ₹{w.user?.walletBalance}
              </div>
              <p style={{ marginBottom: '0.5rem' }}>Amount: <strong>₹{w.amount}</strong></p>
              {w.paymentDetails && <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '0.75rem' }}>Details: {w.paymentDetails}</p>}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
                {w.status === 'pending' && (
                  <>
                    <button type="button" className="btn-primary" onClick={() => approve(w._id)}>Approve</button>
                    <input
                      type="text"
                      placeholder="Rejection reason"
                      value={rejectReason[w._id] || ''}
                      onChange={(e) => setRejectReason((p) => ({ ...p, [w._id]: e.target.value }))}
                      style={{ width: 200 }}
                    />
                    <button type="button" className="btn-ghost" onClick={() => reject(w._id)}>Reject</button>
                  </>
                )}
                {w.status === 'approved' && (
                  <button type="button" className="btn-primary" onClick={() => markPaid(w._id)}>Mark as paid</button>
                )}
                <span className={`badge badge-${w.status}`} style={{ marginLeft: 'auto' }}>{w.status}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
