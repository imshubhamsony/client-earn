import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitTask, setSubmitTask] = useState(null);
  const [proof, setProof] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);
  const [message, setMessage] = useState('');
  const { refreshUser } = useAuth();

  const load = async () => {
    try {
      const [tRes, sRes] = await Promise.all([
        api.get('/tasks'),
        api.get('/tasks/my-submissions'),
      ]);
      setTasks(tRes.data.tasks || []);
      setSubmissions(sRes.data.submissions || []);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!submitTask || !proof.trim()) return;
    setSubmitLoading(true);
    setMessage('');
    try {
      await api.post('/tasks/submit', { taskId: submitTask._id, proof: proof.trim() });
      setSubmitTask(null);
      setProof('');
      await load();
      refreshUser();
      setMessage('Submission sent. Wait for admin approval.');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Submit failed');
    } finally {
      setSubmitLoading(false);
    }
  };

  const getStatus = (taskId) => {
    const t = tasks.find((x) => x._id === taskId);
    return t?.myStatus || null;
  };

  if (loading) return <Layout><div className="container">Loading tasks...</div></Layout>;

  return (
    <Layout>
      <div className="container">
        <h1 style={{ marginBottom: 4, fontSize: '1.35rem' }}>Tasks</h1>
        <p style={{ color: 'var(--muted)', marginBottom: 20, fontSize: '0.95rem' }}>Complete a task and earn ₹10 after approval.</p>

        {message && <p style={{ color: message.includes('sent') ? 'var(--primary)' : 'var(--danger)', marginBottom: 16, fontSize: '0.9rem' }}>{message}</p>}

        {submitTask && (
          <div className="card" style={{ marginBottom: 20 }}>
            <h3 style={{ marginBottom: 8, fontSize: '1rem' }}>Submit proof: {submitTask.title}</h3>
            <form onSubmit={handleSubmit}>
              <textarea value={proof} onChange={(e) => setProof(e.target.value)} placeholder="Paste link or describe your proof..." rows={3} required style={{ minHeight: 80 }} />
              <div style={{ marginTop: 12, display: 'flex', gap: 10 }}>
                <button type="submit" className="btn-primary" disabled={submitLoading} style={{ flex: 1 }}>{submitLoading ? 'Submitting...' : 'Submit'}</button>
                <button type="button" className="btn-ghost" onClick={() => { setSubmitTask(null); setProof(''); }}>Cancel</button>
              </div>
            </form>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {tasks.length === 0 ? (
            <p style={{ color: 'var(--muted)', padding: 20, textAlign: 'center' }}>No tasks available yet.</p>
          ) : (
            tasks.map((task) => {
              const status = getStatus(task._id);
              const canSubmit = !status || status === 'rejected';
              return (
                <div key={task._id} className="card">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div>
                      <h3 style={{ marginBottom: 4, fontSize: '1rem' }}>{task.title}</h3>
                      <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>{task.description}</p>
                      {task.instructions && <p style={{ marginTop: 6, fontSize: '0.85rem', color: 'var(--muted)' }}>{task.instructions}</p>}
                      <p style={{ marginTop: 8, fontWeight: 600, color: 'var(--primary)', fontSize: '0.95rem' }}>₹{task.reward} reward</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                      {status === 'approved' && <span className="badge badge-approved">Done</span>}
                      {status === 'pending' && <span className="badge badge-pending">Pending</span>}
                      {status === 'rejected' && <span className="badge badge-rejected">Rejected</span>}
                      {canSubmit && !submitTask && (
                        <button type="button" className="btn-primary" style={{ flex: 1, minWidth: 0 }} onClick={() => setSubmitTask(task)}>Submit proof</button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {submissions.length > 0 && (
          <div className="card" style={{ marginTop: 24 }}>
            <h2 style={{ marginBottom: 14, fontSize: '1.05rem' }}>My submissions</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {submissions.map((s) => (
                <div key={s._id} className="list-row">
                  <div className="list-row__main">
                    <div className="list-row__title">{s.task?.title}</div>
                    <div className="list-row__sub" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.proof}</div>
                  </div>
                  <div className="list-row__meta">
                    <span className={`badge badge-${s.status}`}>{s.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
