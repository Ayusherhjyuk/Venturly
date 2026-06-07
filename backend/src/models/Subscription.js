import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    plan: { type: String, enum: ['monthly', 'yearly'], required: true },
    amount: { type: Number, required: true },
    status: { type: String, enum: ['pending', 'active', 'failed'], default: 'pending' },

    razorpayOrderId: { type: String, default: '' },
    razorpayPaymentId: { type: String, default: '' },

    activatedAt: { type: Date },
    expiresAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model('Subscription', subscriptionSchema);
