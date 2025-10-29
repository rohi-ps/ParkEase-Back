const fs = require('fs');
const path = require('path');
const blacklistPath = path.join(__dirname, '../data/tokenlist.json');

const readBlacklist = () => {
  if (!fs.existsSync(blacklistPath)) return [];
  try {
    const data = fs.readFileSync(blacklistPath, 'utf8');
    return JSON.parse(data || '[]');
  } catch (err) {
    console.error('Failed to parse blacklist file:', err.message);
    return [];
  }
};

const writeBlacklist = (tokens) => {
  fs.writeFileSync(blacklistPath, JSON.stringify(tokens, null, 2));
};

exports.addToken = (token) => {
  const tokens = readBlacklist();
  if (!tokens.includes(token)) {
    tokens.push(token);
    writeBlacklist(tokens);
  }
};

exports.isBlacklisted = (token) => {
  const tokens = readBlacklist();
  return tokens.includes(token);
};
