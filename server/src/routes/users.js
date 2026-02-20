import express from 'express';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

router.get('/profile', protect, (req, res) => {
  res.json({ user: req.user });
});

router.get('/transactions', protect, async (req, res) => {
  try {
    const list = await Transaction.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(100);
    res.json({ transactions: list });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to fetch' });
  }
});

router.get('/referral-link', protect, (req, res) => {
  const base = process.env.CLIENT_URL || 'http://localhost:5173';
  const link = `${base}/register?ref=${req.user.referralCode}`;
  res.json({ referralCode: req.user.referralCode, referralLink: link });
});

// Admin: list users
router.get('/admin', protect, adminOnly, async (req, res) => {
  try {
    const users = await User.find({ role: 'user' })
      .select('-password -otp')
      .sort({ createdAt: -1 });
    res.json({ users });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to fetch' });
  }
});

router.put('/admin/:id/block', protect, adminOnly, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isBlocked: true },
      { new: true }
    ).select('-password -otp');
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.role === 'admin') return res.status(400).json({ message: 'Cannot block admin' });
    res.json({ user, message: 'User blocked' });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Block failed' });
  }
});

router.put('/admin/:id/unblock', protect, adminOnly, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isBlocked: false },
      { new: true }
    ).select('-password -otp');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ user, message: 'User unblocked' });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Unblock failed' });
  }
});

export default router;
