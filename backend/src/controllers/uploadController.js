// POST /api/uploads  (single file) -> returns its public URL
export const uploadFile = (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
  res.json({ url: `/uploads/${req.file.filename}`, type: req.file.mimetype });
};

// POST /api/uploads/verification  (investor OR creator uploads KYC doc)
import User from '../models/User.js';
export const uploadVerification = async (req, res) => {
  try {
    if (!['investor', 'creator'].includes(req.user.role))
      return res.status(403).json({ message: 'Only investors and creators need verification' });
    if (!req.file) return res.status(400).json({ message: 'No document uploaded' });

    req.user.verificationDocument = `/uploads/${req.file.filename}`;
    req.user.verificationStatus = 'pending';
    await req.user.save();
    res.json({ user: req.user.toPublic(), message: 'Document submitted. Awaiting admin verification.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
