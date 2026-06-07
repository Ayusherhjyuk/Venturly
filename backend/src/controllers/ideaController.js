import Idea from '../models/Idea.js';
import Investment from '../models/Investment.js';

const fileUrl = (f) => `/uploads/${f.filename}`;

// Decide if a given user is allowed to see an idea's FULL content.
const canSeeFull = (user, idea) => {
  if (!user) return false;
  if (user.role === 'admin') return true;
  // creator viewing their own idea
  if (idea.creator && String(idea.creator._id || idea.creator) === String(user._id)) return true;
  // subscribed investor
  if (user.subscription?.isActive) return true;
  return false;
};

// Returns a "preview" version exposing ~10% of the content for locked users.
const gateIdea = (ideaDoc, user) => {
  const idea = ideaDoc.toObject ? ideaDoc.toObject() : ideaDoc;
  const full = canSeeFull(user, idea);

  if (full) return { ...idea, locked: false, preview: false };

  const totalBlocks = idea.blocks?.length || 0;
  // show ~10% of blocks, at least 1
  const visibleCount = Math.max(1, Math.ceil(totalBlocks * 0.1));
  const visibleBlocks = (idea.blocks || []).slice(0, visibleCount).map((b) => {
    if (b.type === 'paragraph' && b.text) {
      // also truncate the first paragraph to ~10% of its text
      const words = b.text.split(/\s+/);
      const keep = Math.max(8, Math.ceil(words.length * 0.1));
      return { ...b, text: words.slice(0, keep).join(' ') + (words.length > keep ? ' …' : '') };
    }
    return b;
  });

  return {
    ...idea,
    blocks: visibleBlocks,
    lockedBlockCount: Math.max(0, totalBlocks - visibleCount),
    locked: true,
    preview: true,
  };
};

// GET /api/ideas  (marketplace — verified investors / admin)
export const listIdeas = async (req, res) => {
  try {
    const { category, search } = req.query;
    const filter = { isPublished: true };
    if (category && category !== 'all') filter.category = category;
    if (search) filter.$or = [
      { title: new RegExp(search, 'i') },
      { tagline: new RegExp(search, 'i') },
    ];

    let ideas = await Idea.find(filter)
      .populate('creator', 'name avatar headline role isVerified')
      .sort({ createdAt: -1 });

    // investors only see ideas from KYC-verified creators (admin sees all)
    if (req.user.role !== 'admin') {
      ideas = ideas.filter((i) => i.creator?.isVerified);
    }

    res.json({ ideas: ideas.map((i) => gateIdea(i, req.user)) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/ideas/:id
export const getIdea = async (req, res) => {
  try {
    const idea = await Idea.findById(req.params.id).populate('creator', 'name avatar headline bio role');
    if (!idea) return res.status(404).json({ message: 'Idea not found' });

    // only bump views for non-owners
    if (!req.user || String(idea.creator._id) !== String(req.user._id)) {
      idea.views += 1;
      await idea.save();
    }
    res.json({ idea: gateIdea(idea, req.user) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/ideas/mine  (creator's own ideas, always full)
export const myIdeas = async (req, res) => {
  try {
    const ideas = await Idea.find({ creator: req.user._id }).sort({ createdAt: -1 });
    // attach investment summary
    const withStats = await Promise.all(
      ideas.map(async (i) => {
        const investments = await Investment.countDocuments({ idea: i._id, status: 'paid' });
        return { ...i.toObject(), locked: false, investorCount: investments };
      })
    );
    res.json({ ideas: withStats });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/ideas  (creator creates)
export const createIdea = async (req, res) => {
  try {
    const payload = parseIdeaBody(req);
    payload.creator = req.user._id;
    const idea = await Idea.create(payload);
    res.status(201).json({ idea: { ...idea.toObject(), locked: false } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/ideas/:id
export const updateIdea = async (req, res) => {
  try {
    const idea = await Idea.findById(req.params.id);
    if (!idea) return res.status(404).json({ message: 'Idea not found' });
    if (String(idea.creator) !== String(req.user._id))
      return res.status(403).json({ message: 'Not your idea' });

    const payload = parseIdeaBody(req, idea);
    Object.assign(idea, payload);
    await idea.save();
    res.json({ idea: { ...idea.toObject(), locked: false } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/ideas/:id
export const deleteIdea = async (req, res) => {
  try {
    const idea = await Idea.findById(req.params.id);
    if (!idea) return res.status(404).json({ message: 'Idea not found' });
    if (String(idea.creator) !== String(req.user._id) && req.user.role !== 'admin')
      return res.status(403).json({ message: 'Not allowed' });
    await idea.deleteOne();
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Helper: builds idea fields from multipart/JSON body + uploaded files.
// Files come in as fields: coverImage, backgroundImage, and block files via
// block index mapping in `blocks` JSON. For simplicity the frontend uploads
// media separately (see /api/uploads) and sends URLs inside the blocks JSON.
function parseIdeaBody(req) {
  const body = req.body || {};
  const out = {};
  ['title', 'tagline', 'category', 'coverImage', 'backgroundImage'].forEach((k) => {
    if (body[k] !== undefined) out[k] = body[k];
  });
  ['fundingGoal', 'minInvestment', 'fundingPeriodMonths', 'expectedRoi'].forEach((k) => {
    if (body[k] !== undefined) out[k] = Number(body[k]) || 0;
  });
  if (body.blocks !== undefined) {
    out.blocks = typeof body.blocks === 'string' ? JSON.parse(body.blocks) : body.blocks;
  }
  if (body.isPublished !== undefined) out.isPublished = body.isPublished === true || body.isPublished === 'true';

  // uploaded cover / background via multer.fields
  if (req.files?.coverImage?.[0]) out.coverImage = fileUrl(req.files.coverImage[0]);
  if (req.files?.backgroundImage?.[0]) out.backgroundImage = fileUrl(req.files.backgroundImage[0]);
  return out;
}
