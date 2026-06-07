import mongoose from 'mongoose';

// An investor expressing interest / connecting with a creator.
const connectionSchema = new mongoose.Schema(
  {
    investor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    idea: { type: mongoose.Schema.Types.ObjectId, ref: 'Idea' },
    message: { type: String, default: '' },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'declined'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

connectionSchema.index({ investor: 1, creator: 1, idea: 1 }, { unique: false });

export default mongoose.model('Connection', connectionSchema);
