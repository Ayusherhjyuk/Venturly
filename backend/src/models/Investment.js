import mongoose from 'mongoose';

const investmentSchema = new mongoose.Schema(
  {
    investor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    idea: { type: mongoose.Schema.Types.ObjectId, ref: 'Idea', required: true },
    creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    amount: { type: Number, required: true },
    periodMonths: { type: Number, required: true, default: 12 },
    message: { type: String, default: '' },

    // payment status
    status: {
      type: String,
      enum: ['pending', 'paid', 'failed'],
      default: 'pending',
    },

    // ===== Fixed ROI returns =====
    roiPercent: { type: Number, default: 0 },      // snapshot of idea.expectedRoi at invest time
    expectedReturn: { type: Number, default: 0 },  // principal + ROI (total owed back)
    maturityDate: { type: Date },                  // when the period ends
    totalReturned: { type: Number, default: 0 },   // sum of payouts disbursed so far
    // ledger of returns the creator has paid out
    payouts: [
      {
        amount: { type: Number, required: true },
        note: { type: String, default: '' },
        date: { type: Date, default: Date.now },
      },
    ],
    // lifecycle of the investment after payment succeeds
    returnStatus: {
      type: String,
      enum: ['active', 'matured'],
      default: 'active',
    },

    // ===== Investment agreement =====
    // The investor must accept the terms before paying. We snapshot the agreed
    // terms so there's an immutable record of what both parties committed to.
    agreementAccepted: { type: Boolean, default: false },
    agreementAcceptedAt: { type: Date },
    agreementTerms: {
      amount: Number,
      roiPercent: Number,
      periodMonths: Number,
      expectedReturn: Number,
      maturityDate: Date,
      text: String,
    },

    // Razorpay (dummy/test) references
    razorpayOrderId: { type: String, default: '' },
    razorpayPaymentId: { type: String, default: '' },
  },
  { timestamps: true }
);

export default mongoose.model('Investment', investmentSchema);
