const passport = require('passport');
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const path = require('path');
const fs = require('fs');

const usersFile = path.join(__dirname, '../data/users.json');
const readUsers = () => {
  if (!fs.existsSync(usersFile)) return [];
  try {
    return JSON.parse(fs.readFileSync(usersFile, 'utf-8') || '[]');
  } catch {
    return [];
  }
};

const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET,
};

passport.use(new JwtStrategy(opts, (jwt_payload, done) => {
  const users = readUsers();
  const user = users.find(u => u.email === jwt_payload.email);
  if (user) return done(null, jwt_payload);
  return done(null, false);
}));

module.exports = passport;
