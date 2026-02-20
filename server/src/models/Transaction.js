import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['signup', 'task', 'referral', 'withdrawal', 'admin_adjustment'], required: true },
    amount: { type: Number, required: true },
    balanceAfter: { type: Number },
    reference: { type: mongoose.Schema.Types.Mixed },
    description: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model('Transaction', transactionSchema);
