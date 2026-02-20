import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export default function Dashboard() {
  const { user, refreshUser } = useAuth();
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpMessage, setOtpMessage] = useState('');

  const handleSendOtp = async () => {
    setOtpLoading(true);
    setOtpMessage('');
    try {
      await api.post('/auth/otp/send');
      setOtpSent(true);
      setOtpMessage('OTP sent to your email (check console in dev if no email configured).');
    } catch (err) {
      setOtpMessage(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp.trim()) return;
    setOtpLoading(true);
    setOtpMessage('');
    try {
      await api.post('/auth/otp/verify', { otp: otp.trim() });
      setOtp('');
      setOtpSent(false);
      refreshUser();
      setOtpMessage('Email verified.');
    } catch (err) {
      setOtpMessage(err.response?.data?.message || 'Invalid OTP');
    } finally {
      setOtpLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container">
        <h1 style={{ marginBottom: 4, fontSize: '1.35rem' }}>Hi, {user?.name}</h1>
        <p style={{ color: 'var(--muted)', marginBottom: 20, fontSize: '0.95rem' }}>Complete tasks & refer friends to earn.</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
          <div className="card" style={{ textAlign: 'center' }}>
            <p style={{ color: 'var(--muted)', fontSize: '0.85rem', marginBottom: 4 }}>Wallet Balance</p>
            <p style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--primary)' }}>₹{user?.walletBalance ?? 0}</p>
            <Link to="/wallet" style={{ fontSize: '0.9rem', marginTop: 8, display: 'inline-block', color: 'var(--primary)' }}>View wallet →</Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="card" style={{ textAlign: 'center' }}>
              <p style={{ color: 'var(--muted)', fontSize: '0.8rem', marginBottom: 4 }}>Total Earned</p>
              <p style={{ fontSize: '1.25rem', fontWeight: 700 }}>₹{user?.totalEarned ?? 0}</p>
            </div>
            <div className="card" style={{ textAlign: 'center' }}>
              <p style={{ color: 'var(--muted)', fontSize: '0.8rem', marginBottom: 4 }}>Withdrawn</p>
              <p style={{ fontSize: '1.25rem', fontWeight: 700 }}>₹{user?.totalWithdrawn ?? 0}</p>
            </div>
          </div>
        </div>

        <div className="card" style={{ marginBottom: 16 }}>
          <h2 style={{ marginBottom: 14, fontSize: '1.05rem' }}>Quick actions</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Link to="/tasks">
              <button type="button" className="btn-primary">View tasks & earn ₹10 each</button>
            </Link>
            <Link to="/referral">
              <button type="button" className="btn-ghost">Share referral link</button>
            </Link>
            <Link to="/wallet">
              <button type="button" className="btn-ghost">Withdraw (min ₹100)</button>
            </Link>
          </div>
        </div>

        {!user?.isEmailVerified && (
          <div className="card" style={{ marginBottom: 16 }}>
            <h2 style={{ marginBottom: 10, fontSize: '1.05rem' }}>Verify email (optional)</h2>
            {otpMessage && <p style={{ color: otpMessage.includes('verified') ? 'var(--primary)' : 'var(--danger)', marginBottom: 10, fontSize: '0.9rem' }}>{otpMessage}</p>}
            {!otpSent ? (
              <button type="button" className="btn-ghost" onClick={handleSendOtp} disabled={otpLoading}>{otpLoading ? 'Sending...' : 'Send OTP'}</button>
            ) : (
              <form onSubmit={handleVerifyOtp} style={{ display: 'flex', gap: 8, alignItems: 'stretch', flexWrap: 'wrap' }}>
                <input type="text" placeholder="6-digit OTP" value={otp} onChange={(e) => setOtp(e.target.value)} maxLength={6} style={{ flex: '1 1 120px', minWidth: 0 }} />
                <button type="submit" className="btn-primary" disabled={otpLoading} style={{ flex: '1 1 100px' }}>{otpLoading ? 'Verifying...' : 'Verify'}</button>
              </form>
            )}
          </div>
        )}

        <div className="card">
          <h2 style={{ marginBottom: 10, fontSize: '1.05rem' }}>How it works</h2>
          <ul style={{ color: 'var(--muted)', paddingLeft: 20, lineHeight: 1.9, fontSize: '0.9rem' }}>
            <li>Get ₹10 on signup (already credited)</li>
            <li>Complete tasks and earn ₹10 per approved task</li>
            <li>Refer friends: you and they earn ₹10 when they sign up</li>
            <li>Withdraw when balance ≥ ₹100 (admin approval required)</li>
          </ul>
        </div>
      </div>
    </Layout>
  );
}
