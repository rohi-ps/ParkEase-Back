const BlacklistedToken = require('../models/logout model');  

const checkBlacklist = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Missing token' });
  }

  const token = authHeader.split(' ')[1];
  const isBlacklisted = await BlacklistedToken.exists({ token });

  if (isBlacklisted) {
    return res.status(403).json({ message: 'Token is blacklisted' });
  }

  req.token = token;
  next();
};

module.exports = checkBlacklist;
