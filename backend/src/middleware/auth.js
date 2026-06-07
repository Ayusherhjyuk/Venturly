import User from '../models/User.js';
import { verifyToken } from '../utils/token.js';

// Requires a valid JWT; attaches req.user
export const protect = async (req, res, next) => {
  try {
    let token;
    const header = req.headers.authorization;
    if (header && header.startsWith('Bearer ')) token = header.split(' ')[1];

    if (!token) return res.status(401).json({ message: 'Not authorized, no token' });

    const decoded = verifyToken(token);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ message: 'User not found' });

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

// Restrict to certain roles, e.g. requireRole('admin')
export const requireRole = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ message: `Access denied. Requires role: ${roles.join(', ')}` });
  }
  next();
};

// Investor must be verified by admin to browse the marketplace.
export const requireVerifiedInvestor = (req, res, next) => {
  if (req.user.role === 'admin') return next();
  if (req.user.role !== 'investor') {
    return res.status(403).json({ message: 'Only investors can access this resource' });
  }
  if (!req.user.isVerified) {
    return res.status(403).json({
      message: 'Your investor account is awaiting verification by the admin.',
      code: 'NOT_VERIFIED',
    });
  }
  next();
};
