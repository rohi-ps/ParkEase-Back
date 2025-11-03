const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const { sendWelcomeEmail } = require('../validators/mailservice');
const { addToken } = require('../utils/tokenBlackList');

const usersFile = path.join(__dirname, '../data/users.json');
const readUsers = () => {
  if (!fs.existsSync(usersFile)) return [];
  try {
    return JSON.parse(fs.readFileSync(usersFile, 'utf-8') || '[]');
  } catch {
    return [];
  }
};
const writeUsers = (users) => {
  fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
};

exports.register = async (req, res) => {
  const { email, firstname, lastname, password } = req.body;
  const users = readUsers();
  if (users.find(u => u.email === email)) {
    return res.status(409).json({ message: 'User already exists' });
  }

  const newUser = { email, firstname, lastname, password, role: 'user' };
  users.push(newUser);
  writeUsers(users);

  try {
    const info = await sendWelcomeEmail(email, firstname);
    const status = info.accepted.includes(email)
      ? 'User registered and email sent successfully'
      : 'User registered, but email was rejected';
    res.status(201).json({ message: status });
  } catch {
    res.status(201).json({ message: 'User registered, but email failed to send' });
  }
};

exports.login = (req, res) => {
  try {
    console.log('Incoming login request:', req.body);

    const { email, password } = req.body;
    if (!email || !password) {
      console.log('Missing email or password');
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const users = readUsers();
    console.log('Loaded users:', users);

    const user = users.find(u => u.email === email && u.password === password);
    if (!user) {
      console.log('User not found or password mismatch');
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is missing');
      return res.status(500).json({ message: 'Server misconfiguration: JWT_SECRET not set' });
    }

    const token = jwt.sign(
      { email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    console.log('Token generated:', token);
    res.status(200).json({ message: 'Login successful', token, role: user.role });
  } catch (err) {
    console.error('Login error:', err.stack); // 🔥 show full stack trace
    res.status(500).json({ message: 'Internal server error' });
  }
};



exports.logout = (req, res) => {
  addToken(req.headers.authorization?.split(' ')[1]);
  res.json({ message: 'Logout successful' });
};
