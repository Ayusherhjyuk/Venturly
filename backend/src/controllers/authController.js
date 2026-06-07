import User from '../models/User.js';
import { signToken } from '../utils/token.js';

const sanitize = (user) => {
  const u = user.toObject();
  delete u.password;
  return u;
};

// POST /api/auth/register
export const register = async (req, res) => {
  try {
    const { name, email, password, role, headline, bio } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: 'Name, email and password are required' });

    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) return res.status(409).json({ message: 'Email already registered' });

    const safeRole = ['creator', 'investor'].includes(role) ? role : 'creator';

    const user = await User.create({
      name,
      email,
      password,
      role: safeRole,
      headline: headline || '',
      bio: bio || '',
      // investors start as pending-none until they upload a doc
      verificationStatus: 'none',
    });

    const token = signToken(user._id);
    res.status(201).json({ token, user: sanitize(user) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/auth/login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email?.toLowerCase() }).select('+password');
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const match = await user.matchPassword(password);
    if (!match) return res.status(401).json({ message: 'Invalid credentials' });

    const token = signToken(user._id);
    res.json({ token, user: sanitize(user) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/auth/me
export const me = async (req, res) => {
  res.json({ user: sanitize(req.user) });
};

// PUT /api/auth/profile
export const updateProfile = async (req, res) => {
  try {
    const { name, bio, headline } = req.body;
    const user = req.user;
    if (name !== undefined) user.name = name;
    if (bio !== undefined) user.bio = bio;
    if (headline !== undefined) user.headline = headline;
    if (req.file) user.avatar = `/uploads/${req.file.filename}`;
    await user.save();
    res.json({ user: sanitize(user) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
