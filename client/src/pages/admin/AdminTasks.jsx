import React, { useState, useEffect } from 'react';
import api from '../../api/axios';

export default function AdminTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [instructions, setInstructions] = useState('');
  const [reward, setReward] = useState(10);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [message, setMessage] = useState('');

  const load = () => api.get('/tasks/admin').then((r) => setTasks(r.data.tasks || [])).catch(() => {});

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    setMessage('');
    try {
      await api.post('/tasks/admin', { title, description, instructions, reward, isActive: true });
      setTitle('');
      setDescription('');
      setInstructions('');
      setReward(10);
      setShowForm(false);
      await load();
      setMessage('Task created.');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Create failed');
    } finally {
      setSubmitLoading(false);
    }
  };

  const toggleActive = async (task) => {
    try {
      await api.put(`/tasks/admin/${task._id}`, { isActive: !task.isActive });
      await load();
    } catch (_) {}
  };

  if (loading) return <p>Loading...</p>;

  return (
    <>
      <h1 style={{ marginBottom: '0.5rem' }}>Tasks</h1>
      <p style={{ color: 'var(--muted)', marginBottom: '1.5rem' }}>Create and manage tasks.</p>

      {message && <p style={{ color: 'var(--primary)', marginBottom: '1rem' }}>{message}</p>}

      {!showForm ? (
        <button type="button" className="btn-primary" onClick={() => setShowForm(true)} style={{ marginBottom: '1rem' }}>Create task</button>
      ) : (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>New task</h2>
          <form onSubmit={handleCreate}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.9rem' }}>Title</label>
              <input value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.9rem' }}>Description</label>
              <input value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.9rem' }}>Instructions</label>
              <textarea value={instructions} onChange={(e) => setInstructions(e.target.value)} rows={2} />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.9rem' }}>Reward (₹)</label>
              <input type="number" min={1} value={reward} onChange={(e) => setReward(Number(e.target.value))} />
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button type="submit" className="btn-primary" disabled={submitLoading}>{submitLoading ? 'Creating...' : 'Create'}</button>
              <button type="button" className="btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {tasks.length === 0 ? <p style={{ color: 'var(--muted)' }}>No tasks.</p> : (
          tasks.map((task) => (
            <div key={task._id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <h3 style={{ marginBottom: '0.25rem' }}>{task.title}</h3>
                <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>{task.description}</p>
                <span style={{ fontSize: '0.9rem' }}>₹{task.reward}</span>
                <span className={task.isActive ? 'badge badge-approved' : 'badge badge-rejected'} style={{ marginLeft: '0.5rem' }}>
                  {task.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <button type="button" className="btn-ghost" onClick={() => toggleActive(task)}>
                {task.isActive ? 'Deactivate' : 'Activate'}
              </button>
            </div>
          ))
        )}
      </div>
    </>
  );
}
