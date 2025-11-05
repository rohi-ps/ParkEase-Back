exports.requireRole = (role) => {
  return (req, res, next) => {
    if (!req.user || req.user.role !== role) {
      return res.status(403).json({ message: 'Access denied: insufficient permissions' });
    }
    next();
  };
};
const { isBlacklisted } = require('../utils/tokenBlackList');

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (isBlacklisted(token)) {
    return res.status(401).json({ error: 'Token is blacklisted' });
  }
  next();
};
