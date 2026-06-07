import Connection from '../models/Connection.js';
import Idea from '../models/Idea.js';

// POST /api/connections  (investor connects with a creator)
export const createConnection = async (req, res) => {
  try {
    const { creatorId, ideaId, message } = req.body;
    let creator = creatorId;
    if (!creator && ideaId) {
      const idea = await Idea.findById(ideaId);
      creator = idea?.creator;
    }
    if (!creator) return res.status(400).json({ message: 'creatorId or ideaId required' });

    if (String(creator) === String(req.user._id))
      return res.status(400).json({ message: "You can't connect with yourself" });

    // an investor can only have ONE connection with a given creator
    const existing = await Connection.findOne({ investor: req.user._id, creator });
    if (existing) {
      const label = existing.status === 'accepted' ? 'already connected with' : 'already sent a request to';
      return res.status(409).json({
        message: `You've ${label} this creator.`,
        connection: existing,
        code: 'ALREADY_CONNECTED',
      });
    }

    const connection = await Connection.create({
      investor: req.user._id,
      creator,
      idea: ideaId || undefined,
      message: message || '',
    });
    res.status(201).json({ connection, message: 'Connection request sent!' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/connections/mine  (investor's sent requests)
export const myConnections = async (req, res) => {
  try {
    const connections = await Connection.find({ investor: req.user._id })
      .populate('creator', 'name avatar headline')
      .populate('idea', 'title')
      .sort({ createdAt: -1 });
    res.json({ connections });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/connections/received  (creator's incoming requests)
export const receivedConnections = async (req, res) => {
  try {
    const connections = await Connection.find({ creator: req.user._id })
      .populate('investor', 'name avatar headline')
      .populate('idea', 'title')
      .sort({ createdAt: -1 });
    res.json({ connections });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/connections/:id  (creator accepts/declines)
export const respondConnection = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['accepted', 'declined'].includes(status))
      return res.status(400).json({ message: 'Invalid status' });
    const conn = await Connection.findById(req.params.id);
    if (!conn) return res.status(404).json({ message: 'Not found' });
    if (String(conn.creator) !== String(req.user._id))
      return res.status(403).json({ message: 'Not allowed' });
    conn.status = status;
    await conn.save();
    res.json({ connection: conn });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
