import express from 'express';
import Withdrawal from '../models/Withdrawal.js';
import User from '../models/User.js';
import { protect, adminOnly } from '../middleware/auth.js';
import { deductForWithdrawal } from '../utils/wallet.js';

const router = express.Router();
const MIN_WITHDRAWAL = Number(process.env.MIN_WITHDRAWAL) || 100;

router.post('/', protect, async (req, res) => {
  try {
    if (req.user.role === 'admin') return res.status(403).json({ message: 'Use user account for withdrawal' });
    const { amount, paymentMethod, paymentDetails } = req.body;
    const numAmount = Number(amount);
    if (!numAmount || numAmount < MIN_WITHDRAWAL) {
      return res.status(400).json({ message: `Minimum withdrawal is ₹${MIN_WITHDRAWAL}` });
    }
    const user = await User.findById(req.user._id);
    if (user.walletBalance < numAmount) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }
    const withdrawal = await Withdrawal.create({
      user: req.user._id,
      amount: numAmount,
      paymentMethod: paymentMethod || '',
      paymentDetails: paymentDetails || '',
      status: 'pending',
    });
    const populated = await Withdrawal.findById(withdrawal._id).populate('user', 'name email');
    res.status(201).json({ withdrawal: populated });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Request failed' });
  }
});

router.get('/my', protect, async (req, res) => {
  try {
    const list = await Withdrawal.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ withdrawals: list });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to fetch' });
  }
});

router.get('/admin', protect, adminOnly, async (req, res) => {
  try {
    const status = req.query.status || 'pending';
    const list = await Withdrawal.find({ status })
      .populate('user', 'name email walletBalance')
      .sort({ createdAt: -1 });
    res.json({ withdrawals: list });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to fetch' });
  }
});

router.put('/admin/:id/approve', protect, adminOnly, async (req, res) => {
  try {
    const w = await Withdrawal.findById(req.params.id).populate('user');
    if (!w) return res.status(404).json({ message: 'Withdrawal not found' });
    if (w.status !== 'pending') return res.status(400).json({ message: 'Already processed' });
    await deductForWithdrawal(w.user._id, w.amount);
    w.status = 'approved';
    w.reviewedBy = req.user._id;
    w.reviewedAt = new Date();
    await w.save();
    res.json({ withdrawal: w, message: 'Approved. Deduct from wallet. Mark as paid when done.' });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Approve failed' });
  }
});

router.put('/admin/:id/reject', protect, adminOnly, async (req, res) => {
  try {
    const w = await Withdrawal.findById(req.params.id);
    if (!w) return res.status(404).json({ message: 'Withdrawal not found' });
    if (w.status !== 'pending') return res.status(400).json({ message: 'Already processed' });
    w.status = 'rejected';
    w.reviewedBy = req.user._id;
    w.reviewedAt = new Date();
    w.rejectionReason = req.body.reason || '';
    await w.save();
    res.json({ withdrawal: w, message: 'Rejected' });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Reject failed' });
  }
});

router.put('/admin/:id/paid', protect, adminOnly, async (req, res) => {
  try {
    const w = await Withdrawal.findById(req.params.id);
    if (!w) return res.status(404).json({ message: 'Withdrawal not found' });
    if (w.status !== 'approved') return res.status(400).json({ message: 'Only approved withdrawals can be marked paid' });
    w.status = 'paid';
    w.paidAt = new Date();
    await w.save();
    res.json({ withdrawal: w, message: 'Marked as paid' });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Update failed' });
  }
});

export default router;
