import User from '../models/User.js';

export async function oneAccountPerDevice(req, res, next) {
  const deviceId = req.headers['x-device-id'] || req.body?.deviceId;
  if (!deviceId) return next();
  const existing = await User.findOne({ deviceId, _id: { $ne: req.user?._id } });
  if (existing) {
    return res.status(400).json({
      message: 'One account per device. This device is already linked to another account.',
    });
  }
  next();
}

export async function checkDeviceOnRegister(req, res, next) {
  const deviceId = req.body?.deviceId || req.headers['x-device-id'];
  if (!deviceId) return next();
  const existing = await User.findOne({ deviceId });
  if (existing) {
    return res.status(400).json({
      message: 'One account per device. This device already has an account.',
    });
  }
  next();
}
