import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6, select: false },

    // creator  -> posts work / ideas
    // investor -> browses & invests (requires verification by admin)
    // admin    -> verifies investors, manages platform
    role: {
      type: String,
      enum: ['creator', 'investor', 'admin'],
      default: 'creator',
    },

    avatar: { type: String, default: '' },
    bio: { type: String, default: '' },
    headline: { type: String, default: '' }, // e.g. "Indie filmmaker", "Climate-tech founder"

    // ===== Investor verification =====
    // Investor uploads a document; admin flips isVerified to true.
    verificationDocument: { type: String, default: '' },
    verificationStatus: {
      type: String,
      enum: ['none', 'pending', 'verified', 'rejected'],
      default: 'none',
    },
    isVerified: { type: Boolean, default: false },

    // ===== Subscription (unlocks full ideas) =====
    subscription: {
      isActive: { type: Boolean, default: false },
      plan: { type: String, enum: ['none', 'monthly', 'yearly'], default: 'none' },
      activatedAt: { type: Date },
      expiresAt: { type: Date },
    },
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.matchPassword = function (entered) {
  return bcrypt.compare(entered, this.password);
};

userSchema.methods.toPublic = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

export default mongoose.model('User', userSchema);
