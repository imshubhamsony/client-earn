import User from '../models/User.js';
import Transaction from '../models/Transaction.js';

const SIGNUP_BONUS = Number(process.env.SIGNUP_BONUS) || 10;
const TASK_REWARD = Number(process.env.TASK_REWARD) || 10;
const REFERRAL_BONUS = Number(process.env.REFERRAL_BONUS) || 10;

export async function addSignupBonus(userId) {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');
  user.walletBalance += SIGNUP_BONUS;
  user.totalEarned += SIGNUP_BONUS;
  await user.save();
  await Transaction.create({
    user: userId,
    type: 'signup',
    amount: SIGNUP_BONUS,
    balanceAfter: user.walletBalance,
    description: 'Signup bonus',
  });
  return user.walletBalance;
}

export async function addReferralBonus(referrerId) {
  const user = await User.findById(referrerId);
  if (!user) throw new Error('Referrer not found');
  user.walletBalance += REFERRAL_BONUS;
  user.totalEarned += REFERRAL_BONUS;
  await user.save();
  await Transaction.create({
    user: referrerId,
    type: 'referral',
    amount: REFERRAL_BONUS,
    balanceAfter: user.walletBalance,
    description: 'Referral signup bonus',
  });
  return user.walletBalance;
}

export async function addTaskReward(userId, taskId) {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');
  const amount = TASK_REWARD;
  user.walletBalance += amount;
  user.totalEarned += amount;
  await user.save();
  await Transaction.create({
    user: userId,
    type: 'task',
    amount,
    balanceAfter: user.walletBalance,
    reference: { task: taskId },
    description: 'Task completion reward',
  });
  return user.walletBalance;
}

export async function deductForWithdrawal(userId, amount) {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');
  if (user.walletBalance < amount) throw new Error('Insufficient balance');
  user.walletBalance -= amount;
  user.totalWithdrawn += amount;
  await user.save();
  await Transaction.create({
    user: userId,
    type: 'withdrawal',
    amount: -amount,
    balanceAfter: user.walletBalance,
    description: 'Withdrawal',
  });
  return user.walletBalance;
}
