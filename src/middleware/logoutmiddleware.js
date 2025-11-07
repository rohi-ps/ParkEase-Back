const { isBlacklisted } = require('../utils/tokenBlackList');

const checkBlacklist = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Missing token' });
  }

  const token = authHeader.split(' ')[1];
  if (isBlacklisted(token)) {
    return res.status(403).json({ message: 'Token is blacklisted' });
  }

  req.token = token;
  next();
};

module.exports = checkBlacklist;
