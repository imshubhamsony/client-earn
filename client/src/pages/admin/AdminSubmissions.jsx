import React, { useState, useEffect } from 'react';
import api from '../../api/axios';

export default function AdminSubmissions() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rejectReason, setRejectReason] = useState({});
  const [message, setMessage] = useState('');

  const load = () => api.get('/tasks/admin/submissions?status=pending').then((r) => setSubmissions(r.data.submissions || [])).catch(() => {});

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, []);

  const approve = async (id) => {
    try {
      await api.put(`/tasks/admin/submissions/${id}/approve`);
      setMessage('Approved. Reward credited.');
      await load();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed');
    }
  };

  const reject = async (id) => {
    const reason = rejectReason[id] || '';
    try {
      await api.put(`/tasks/admin/submissions/${id}/reject`, { reason });
      setRejectReason((p) => ({ ...p, [id]: '' }));
      setMessage('Rejected.');
      await load();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed');
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <>
      <h1 style={{ marginBottom: '0.5rem' }}>Task submissions</h1>
      <p style={{ color: 'var(--muted)', marginBottom: '1.5rem' }}>Approve or reject pending submissions.</p>

      {message && <p style={{ color: 'var(--primary)', marginBottom: '1rem' }}>{message}</p>}

      {submissions.length === 0 ? (
        <p style={{ color: 'var(--muted)' }}>No pending submissions.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {submissions.map((s) => (
            <div key={s._id} className="card">
              <div style={{ marginBottom: '0.75rem' }}>
                <strong>{s.user?.name}</strong> ({s.user?.email}) — Task: <strong>{s.task?.title}</strong> (₹{s.task?.reward})
              </div>
              <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '0.75rem', whiteSpace: 'pre-wrap' }}>Proof: {s.proof}</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
                <button type="button" className="btn-primary" onClick={() => approve(s._id)}>Approve</button>
                <input
                  type="text"
                  placeholder="Rejection reason (optional)"
                  value={rejectReason[s._id] || ''}
                  onChange={(e) => setRejectReason((p) => ({ ...p, [s._id]: e.target.value }))}
                  style={{ width: 220 }}
                />
                <button type="button" className="btn-ghost" onClick={() => reject(s._id)}>Reject</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
