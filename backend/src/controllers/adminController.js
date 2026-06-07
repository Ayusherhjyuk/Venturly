import User from '../models/User.js';
import Idea from '../models/Idea.js';
import Investment from '../models/Investment.js';

// GET /api/admin/investors  (list all investors + verification status)
export const listInvestors = async (req, res) => {
  try {
    const investors = await User.find({ role: 'investor' }).sort({ createdAt: -1 });
    res.json({ investors: investors.map((u) => u.toPublic()) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/admin/creators  (list all creators + KYC status)
export const listCreators = async (req, res) => {
  try {
    const creators = await User.find({ role: 'creator' }).sort({ createdAt: -1 });
    res.json({ creators: creators.map((u) => u.toPublic()) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/admin/investors/:id/verify  -> toggle / set verification (investor OR creator)
// body: { isVerified: boolean }  (the "toggle the key" action, in-app)
export const setVerification = async (req, res) => {
  try {
    const { isVerified } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (!['investor', 'creator'].includes(user.role))
      return res.status(400).json({ message: 'Only investors and creators are verified' });

    user.isVerified = Boolean(isVerified);
    user.verificationStatus = user.isVerified ? 'verified' : 'rejected';
    await user.save();
    res.json({ user: user.toPublic(), message: `${user.role} ${user.isVerified ? 'verified' : 'rejected'}.` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/admin/stats
export const stats = async (req, res) => {
  try {
    const [creators, investors, pendingInvestors, pendingCreators, ideas, paidInvestments] = await Promise.all([
      User.countDocuments({ role: 'creator' }),
      User.countDocuments({ role: 'investor' }),
      User.countDocuments({ role: 'investor', verificationStatus: 'pending' }),
      User.countDocuments({ role: 'creator', verificationStatus: 'pending' }),
      Idea.countDocuments({}),
      Investment.find({ status: 'paid' }),
    ]);
    const totalInvested = paidInvestments.reduce((s, i) => s + i.amount, 0);
    res.json({
      stats: {
        creators, investors,
        pendingVerifications: pendingInvestors + pendingCreators,
        pendingInvestors, pendingCreators,
        ideas, totalInvested, investmentCount: paidInvestments.length,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
