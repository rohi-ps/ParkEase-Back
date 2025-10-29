const fs = require('fs');
const path = require('path');
const { sendWelcomeEmail } = require('../validators/mailservice');
const jwt = require('jsonwebtoken');
const { addToken} = require('../utils/tokenBlackList.js')
const crypto = require('crypto');
const usersFile = path.join(__dirname, '../data/users.json');
const readUsers = () => {
  if (!fs.existsSync(usersFile)) return [];

  const data = fs.readFileSync(usersFile, 'utf-8');
  try {
    return JSON.parse(data || '[]'); 
  } catch (err) {
    console.error('Failed to parse users.json:', err.message);
    return []; 
  }
};

const writeUsers = (users) => {
  fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
};
exports.register = async (req, res) => {
  try {
    const { email, firstname, lastname, password, confirmPassword } = req.body;
    console.log("Incoming registration:", email);

    const users = readUsers();
    const exists = users.find(u => u.email === email);
    if (exists) return res.status(409).json({ message: 'User already exists' });

    const newUser = { email, firstname, lastname, password,role: 'user' };
    users.push(newUser);
    writeUsers(users);
    console.log("User saved to file");

    try {
      const info = await sendWelcomeEmail(email, firstname);
      if (info.accepted.includes(email)) {
        return res.status(201).json({ message: 'User registered and email sent successfully' });
      } else {
        return res.status(201).json({ message: 'User registered, but email was rejected' });
      }
    } catch (emailErr) {
      console.error('Email error:', emailErr);
      return res.status(201).json({ message: 'User registered, but email failed to send' });
    }
  } catch (err) {
    console.error('Register error:', err);
    if (!res.headersSent) {
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
};


exports.login = (req, res) => {
  const { email, password } = req.body;
  const users = readUsers();
  const user = users.find(u => u.email === email && u.password === password);

  if (!user) return res.status(401).json({ message: 'Invalid credentials' });

  const token = jwt.sign({ email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '10s' });
//   const token = jwt.sign({
//   email: user.email,
//   role: user.role,
//   jti: crypto.randomUUID()
// }, process.env.JWT_SECRET, { expiresIn: '1h' });
  res.status(200).json({ message: 'Login successful', token });
};



exports.logout = (req, res) => {
  addToken(req.token);
  res.json({ message: 'Logout successful' });
};