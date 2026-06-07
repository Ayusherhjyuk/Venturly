import mongoose from 'mongoose';

// A single rich content block the creator adds to their page.
const blockSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ['paragraph', 'image', 'video', 'link'], required: true },
    // paragraph -> text + optional backgroundImage
    // image     -> url (uploaded or external)
    // video     -> url (uploaded file or youtube/vimeo embed url)
    // link      -> url + label
    text: { type: String, default: '' },
    url: { type: String, default: '' },
    label: { type: String, default: '' },
    backgroundImage: { type: String, default: '' },
  },
  { _id: true }
);

const ideaSchema = new mongoose.Schema(
  {
    creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    title: { type: String, required: true, trim: true },
    tagline: { type: String, default: '' },
    category: {
      type: String,
      enum: ['creative', 'innovation', 'charity', 'startup', 'other'],
      default: 'creative',
    },

    coverImage: { type: String, default: '' },     // hero image of the page
    backgroundImage: { type: String, default: '' }, // page-wide background

    // Rich, ordered content blocks (paragraphs w/ bg, images, videos, links)
    blocks: { type: [blockSchema], default: [] },

    // ===== Funding =====
    fundingGoal: { type: Number, default: 0 },
    amountRaised: { type: Number, default: 0 },
    minInvestment: { type: Number, default: 1000 },
    // default period the creator is offering the work/return for (months)
    fundingPeriodMonths: { type: Number, default: 12 },
    // Fixed ROI offered to investors over the full period (percent).
    // e.g. 15 => an investor gets back principal + 15% at maturity.
    // Charity ideas typically set this to 0 (a donation).
    expectedRoi: { type: Number, default: 12 },

    isPublished: { type: Boolean, default: true },
    views: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model('Idea', ideaSchema);
