import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { protect, adminOnly } from '../middleware/auth.js';
import { checkDeviceOnRegister } from '../middleware/deviceLimit.js';
import { trackIP } from '../middleware/trackIP.js';
import { generateReferralCode } from '../utils/generateReferralCode.js';
import { addSignupBonus, addReferralBonus } from '../utils/wallet.js';
import { generateNumericOTP, isOTPExpired } from '../utils/otp.js';

const router = express.Router();
const MIN_WITHDRAWAL = Number(process.env.MIN_WITHDRAWAL) || 100;

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

function sendToken(user, res) {
  const token = jwt.sign(
    { id: user._id },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
  res.cookie('token', token, cookieOptions);
  const u = user.toObject ? user.toObject() : user;
  delete u.password;
  delete u.otp;
  res.json({ user: u, token });
}

router.post('/register', trackIP, checkDeviceOnRegister, async (req, res) => {
  try {
    const { name, email, password, referralCode, deviceId } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password required' });
    }
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(400).json({ message: 'Email already registered' });

    let referredBy = null;
    if (referralCode) {
      const referrer = await User.findOne({ referralCode: referralCode.toUpperCase() });
      if (referrer) referredBy = referrer._id;
    }

    const user = new User({
      name,
      email: email.toLowerCase(),
      password,
      referralCode: generateReferralCode(),
      referredBy,
      deviceId: deviceId || undefined,
      lastLoginIP: req.clientIP,
    });
    await user.save();

    await addSignupBonus(user._id);
    if (referredBy && referredBy.toString() !== user._id.toString()) {
      await addReferralBonus(referredBy);
    }

    sendToken(user, res);
  } catch (err) {
    res.status(500).json({ message: err.message || 'Registration failed' });
  }
});

router.post('/login', trackIP, async (req, res) => {
  try {
    const { email, password, deviceId } = req.body;
    const user = await User.findOne({ email: email?.toLowerCase() }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    if (user.isBlocked) return res.status(403).json({ message: 'Account is blocked' });
    if (deviceId) {
      const other = await User.findOne({ deviceId, _id: { $ne: user._id } });
      if (other) return res.status(400).json({ message: 'This device is linked to another account' });
      user.deviceId = deviceId;
    }
    user.lastLoginIP = req.clientIP;
    await user.save({ validateBeforeSave: false });
    sendToken(user, res);
  } catch (err) {
    res.status(500).json({ message: err.message || 'Login failed' });
  }
});

router.post('/logout', (req, res) => {
  res.cookie('token', '', { ...cookieOptions, maxAge: 0 });
  res.json({ message: 'Logged out' });
});

router.get('/me', protect, (req, res) => {
  res.json({ user: req.user });
});

router.get('/config', (req, res) => {
  res.json({
    minWithdrawal: MIN_WITHDRAWAL,
    signupBonus: Number(process.env.SIGNUP_BONUS) || 10,
    taskReward: Number(process.env.TASK_REWARD) || 10,
    referralBonus: Number(process.env.REFERRAL_BONUS) || 10,
  });
});

// OTP: request OTP for email verification
router.post('/otp/send', protect, async (req, res) => {
  try {
    const otp = generateNumericOTP(6);
    const expires = new Date(Date.now() + 10 * 60 * 1000);
    await User.findByIdAndUpdate(req.user._id, { otp, otpExpires: expires });
    // In production: send email via nodemailer
    if (process.env.SMTP_HOST) {
      // await sendOTPEmail(req.user.email, otp);
    } else {
      console.log('OTP for', req.user.email, ':', otp);
    }
    res.json({ message: 'OTP sent to your email' });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to send OTP' });
  }
});

router.post('/otp/verify', protect, async (req, res) => {
  try {
    const { otp } = req.body;
    const user = await User.findById(req.user._id);
    if (!user.otp || user.otp !== String(otp)) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }
    if (isOTPExpired(user.otpExpires)) {
      return res.status(400).json({ message: 'OTP expired' });
    }
    await User.findByIdAndUpdate(req.user._id, { isEmailVerified: true, otp: null, otpExpires: null });
    const updated = await User.findById(req.user._id).select('-password -otp');
    res.json({ user: updated, message: 'Email verified' });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Verification failed' });
  }
});

// Admin login (separate or use role check)
router.post('/admin/login', trackIP, async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email?.toLowerCase(), role: 'admin' }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid admin credentials' });
    }
    if (user.isBlocked) return res.status(403).json({ message: 'Account is blocked' });
    user.lastLoginIP = req.clientIP;
    await user.save({ validateBeforeSave: false });
    sendToken(user, res);
  } catch (err) {
    res.status(500).json({ message: err.message || 'Login failed' });
  }
});

export default router;
