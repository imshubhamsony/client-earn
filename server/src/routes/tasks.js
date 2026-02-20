import express from 'express';
import Task from '../models/Task.js';
import TaskSubmission from '../models/TaskSubmission.js';
import { protect, adminOnly } from '../middleware/auth.js';
import { addTaskReward } from '../utils/wallet.js';

const router = express.Router();

router.get('/', protect, async (req, res) => {
  try {
    const tasks = await Task.find({ isActive: true }).sort({ createdAt: -1 });
    const submissions = await TaskSubmission.find({ user: req.user._id }).select('task status');
    const doneMap = {};
    submissions.forEach(s => { doneMap[s.task.toString()] = s.status; });
    const list = tasks.map(t => ({
      ...t.toObject(),
      myStatus: doneMap[t._id.toString()] || null,
    }));
    res.json({ tasks: list });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to fetch tasks' });
  }
});

router.post('/submit', protect, async (req, res) => {
  try {
    const { taskId, proof } = req.body;
    if (!taskId || !proof) return res.status(400).json({ message: 'Task ID and proof required' });
    const task = await Task.findOne({ _id: taskId, isActive: true });
    if (!task) return res.status(404).json({ message: 'Task not found or inactive' });
    const existing = await TaskSubmission.findOne({ user: req.user._id, task: taskId });
    if (existing) {
      if (existing.status === 'approved') return res.status(400).json({ message: 'Task already completed' });
      if (existing.status === 'pending') return res.status(400).json({ message: 'Submission already pending' });
    }
    const submission = await TaskSubmission.create({
      user: req.user._id,
      task: taskId,
      proof,
      status: 'pending',
    });
    const populated = await TaskSubmission.findById(submission._id)
      .populate('task', 'title reward')
      .populate('user', 'name email');
    res.status(201).json({ submission: populated });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Submit failed' });
  }
});

router.get('/my-submissions', protect, async (req, res) => {
  try {
    const list = await TaskSubmission.find({ user: req.user._id })
      .populate('task', 'title reward')
      .sort({ createdAt: -1 });
    res.json({ submissions: list });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to fetch submissions' });
  }
});

// Admin: list all tasks
router.get('/admin', protect, adminOnly, async (req, res) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 });
    res.json({ tasks });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to fetch' });
  }
});

// Admin: create task
router.post('/admin', protect, adminOnly, async (req, res) => {
  try {
    const { title, description, instructions, reward, isActive } = req.body;
    const task = await Task.create({
      title: title || 'New Task',
      description: description || '',
      instructions: instructions || '',
      reward: reward ?? 10,
      isActive: isActive !== false,
      createdBy: req.user._id,
    });
    res.status(201).json({ task });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Create task failed' });
  }
});

router.put('/admin/:id', protect, adminOnly, async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      { new: true }
    );
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json({ task });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Update failed' });
  }
});

router.get('/admin/submissions', protect, adminOnly, async (req, res) => {
  try {
    const status = req.query.status || 'pending';
    const list = await TaskSubmission.find({ status })
      .populate('user', 'name email')
      .populate('task', 'title reward')
      .sort({ createdAt: -1 });
    res.json({ submissions: list });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to fetch' });
  }
});

router.put('/admin/submissions/:id/approve', protect, adminOnly, async (req, res) => {
  try {
    const sub = await TaskSubmission.findById(req.params.id).populate('task');
    if (!sub) return res.status(404).json({ message: 'Submission not found' });
    if (sub.status !== 'pending') return res.status(400).json({ message: 'Already reviewed' });
    sub.status = 'approved';
    sub.reviewedBy = req.user._id;
    sub.reviewedAt = new Date();
    await sub.save();
    await addTaskReward(sub.user, sub.task._id);
    res.json({ submission: sub, message: 'Approved. Reward credited.' });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Approve failed' });
  }
});

router.put('/admin/submissions/:id/reject', protect, adminOnly, async (req, res) => {
  try {
    const sub = await TaskSubmission.findById(req.params.id);
    if (!sub) return res.status(404).json({ message: 'Submission not found' });
    if (sub.status !== 'pending') return res.status(400).json({ message: 'Already reviewed' });
    sub.status = 'rejected';
    sub.reviewedBy = req.user._id;
    sub.reviewedAt = new Date();
    sub.rejectionReason = req.body.reason || '';
    await sub.save();
    res.json({ submission: sub, message: 'Rejected' });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Reject failed' });
  }
});

export default router;
