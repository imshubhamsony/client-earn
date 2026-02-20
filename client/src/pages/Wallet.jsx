import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function Wallet() {
  const [config, setConfig] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [amount, setAmount] = useState('');
  const [paymentDetails, setPaymentDetails] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [message, setMessage] = useState('');
  const { user, refreshUser } = useAuth();

  const minWithdrawal = config?.minWithdrawal ?? 100;

  useEffect(() => {
    (async () => {
      try {
        const [cRes, tRes, wRes] = await Promise.all([
          api.get('/auth/config'),
          api.get('/users/transactions'),
          api.get('/withdrawals/my'),
        ]);
        setConfig(cRes.data);
        setTransactions(tRes.data.transactions || []);
        setWithdrawals(wRes.data.withdrawals || []);
      } catch (_) {}
      setLoading(false);
    })();
  }, []);

  const handleWithdraw = async (e) => {
    e.preventDefault();
    const num = Number(amount);
    if (!num || num < minWithdrawal) {
      setMessage(`Minimum withdrawal is ₹${minWithdrawal}`);
      return;
    }
    if (user?.walletBalance < num) {
      setMessage('Insufficient balance');
      return;
    }
    setSubmitLoading(true);
    setMessage('');
    try {
      await api.post('/withdrawals', { amount: num, paymentDetails: paymentDetails.trim() || 'N/A' });
      setAmount('');
      setPaymentDetails('');
      const wRes = await api.get('/withdrawals/my');
      setWithdrawals(wRes.data.withdrawals || []);
      refreshUser();
      setMessage('Withdrawal request submitted. Admin will review.');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Request failed');
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) return <Layout><div className="container">Loading...</div></Layout>;

  return (
    <Layout>
      <div className="container">
        <h1 style={{ marginBottom: 4, fontSize: '1.35rem' }}>Wallet</h1>
        <p style={{ color: 'var(--muted)', marginBottom: 20, fontSize: '0.95rem' }}>Balance, transactions & withdrawal.</p>

        <div className="card" style={{ marginBottom: 20, textAlign: 'center' }}>
          <p style={{ color: 'var(--muted)', fontSize: '0.85rem', marginBottom: 4 }}>Available balance</p>
          <p style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--primary)' }}>₹{user?.walletBalance ?? 0}</p>
        </div>

        <div className="card" style={{ marginBottom: 20 }}>
          <h2 style={{ marginBottom: 12, fontSize: '1.05rem' }}>Request withdrawal</h2>
          <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: 14 }}>Min ₹{minWithdrawal}. Admin approval required.</p>
          {message && <p style={{ color: message.includes('submitted') ? 'var(--primary)' : 'var(--danger)', marginBottom: 12, fontSize: '0.9rem' }}>{message}</p>}
          <form onSubmit={handleWithdraw}>
            <div className="field">
              <label>Amount (₹)</label>
              <input type="number" min={minWithdrawal} step={1} value={amount} onChange={(e) => setAmount(e.target.value)} placeholder={String(minWithdrawal)} />
            </div>
            <div className="field">
              <label>Payment details (UPI / bank)</label>
              <input type="text" value={paymentDetails} onChange={(e) => setPaymentDetails(e.target.value)} placeholder="UPI ID or account details" />
            </div>
            <button type="submit" className="btn-primary" disabled={submitLoading || (user?.walletBalance ?? 0) < minWithdrawal}>
              {submitLoading ? 'Submitting...' : 'Request withdrawal'}
            </button>
          </form>
        </div>

        <div className="card" style={{ marginBottom: 20 }}>
          <h2 style={{ marginBottom: 14, fontSize: '1.05rem' }}>Withdrawal history</h2>
          {withdrawals.length === 0 ? <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>No withdrawals yet.</p> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {withdrawals.map((w) => (
                <div key={w._id} className="list-row">
                  <div className="list-row__main">
                    <div className="list-row__title">₹{w.amount}</div>
                    <div className="list-row__sub">{new Date(w.createdAt).toLocaleDateString()}</div>
                  </div>
                  <div className="list-row__meta"><span className={`badge badge-${w.status}`}>{w.status}</span></div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <h2 style={{ marginBottom: 14, fontSize: '1.05rem' }}>Transaction history</h2>
          {transactions.length === 0 ? <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>No transactions yet.</p> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {transactions.map((t) => (
                <div key={t._id} className="list-row">
                  <div className="list-row__main">
                    <div className="list-row__title">{t.type}</div>
                    <div className="list-row__sub">{new Date(t.createdAt).toLocaleString()}</div>
                  </div>
                  <div className="list-row__meta" style={{ color: t.amount >= 0 ? 'var(--primary)' : 'var(--danger)', fontWeight: 600 }}>
                    {t.amount >= 0 ? '+' : ''}₹{t.amount}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
