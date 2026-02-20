import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../models/User.js';
import { connectDB } from '../config/db.js';

async function seed() {
  await connectDB();
  const email = process.env.ADMIN_EMAIL || 'admin@earntask.com';
  const existing = await User.findOne({ email, role: 'admin' });
  if (existing) {
    console.log('Admin already exists:', email);
    process.exit(0);
    return;
  }
  await User.create({
    name: 'Admin',
    email,
    password: process.env.ADMIN_PASSWORD || 'Admin@123',
    role: 'admin',
  });
  console.log('Admin created:', email);
  process.exit(0);
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
