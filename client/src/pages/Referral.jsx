import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../api/axios';

export default function Referral() {
  const [link, setLink] = useState('');
  const [code, setCode] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    api.get('/users/referral-link').then(({ data }) => {
      setCode(data.referralCode || '');
      setLink(data.referralLink || '');
    }).catch(() => {});
  }, []);

  const copy = () => {
    if (link) {
      navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Layout>
      <div className="container">
        <h1 style={{ marginBottom: 4, fontSize: '1.35rem' }}>Referral</h1>
        <p style={{ color: 'var(--muted)', marginBottom: 20, fontSize: '0.95rem' }}>Share your link. You and your friend each get ₹10 when they sign up.</p>

        <div className="card" style={{ marginBottom: 20 }}>
          <h2 style={{ marginBottom: 12, fontSize: '1.05rem' }}>Your referral link</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <input readOnly value={link} style={{ fontSize: '0.9rem' }} />
            <button type="button" className="btn-primary" onClick={copy}>
              {copied ? 'Copied!' : 'Copy link'}
            </button>
          </div>
          {code && <p style={{ marginTop: 14, color: 'var(--muted)', fontSize: '0.9rem' }}>Referral code: <strong style={{ color: 'var(--text)' }}>{code}</strong></p>}
        </div>

        <div className="card">
          <h2 style={{ marginBottom: 10, fontSize: '1.05rem' }}>How it works</h2>
          <ul style={{ color: 'var(--muted)', paddingLeft: 20, lineHeight: 1.9, fontSize: '0.9rem' }}>
            <li>Share the link above with friends</li>
            <li>When they register using your link, they get ₹10 signup bonus</li>
            <li>You get ₹10 referral bonus when they sign up</li>
            <li>One account per device; self-referral is not allowed</li>
          </ul>
        </div>
      </div>
    </Layout>
  );
}
