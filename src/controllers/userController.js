const fs = require('fs');
const path = require('path');
const { sendWelcomeEmail } = require('../validators/mailservice');
const jwt = require('jsonwebtoken');

const usersFile = path.join(__dirname, '../data/users.json');
const readUsers = () => {
  if (!fs.existsSync(usersFile)) return [];
  const data = fs.readFileSync(usersFile);
  return JSON.parse(data);
};
const writeUsers = (users) => {
  fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
};

exports.register = (req, res) => {
  const { email, firstname,lastname,password,confirmpassword } = req.body;
  // if (!username || !password || password.length < 8) {
  //   return res.status(400).json({ message: 'Invalid input' });
  // }

  const users = readUsers();
  const exists = users.find(u => u.email === email && u.password===password && u.confirmpassword===confirmpassword);
  if (exists) return res.status(409).json({ message: 'User already exists' });

  const newUser = { email,firstname,lastname, password,confirmpassword, role: 'user' };
  users.push(newUser);
  writeUsers(users);
try {
    sendWelcomeEmail(email,password);
    res.status(201).json({ message: 'User registered and email sent successfully' });
  } catch (err) {
    console.error('Email error:', err);
    res.status(201).json({ message: 'User registered, but email failed to send' });
  }
};

exports.login = (req, res) => {
  const { email, password } = req.body;
  const users = readUsers();
  const user = users.find(u => u.email === email && u.password === password);

  if (!user) return res.status(401).json({ message: 'Invalid credentials' });

  const token = jwt.sign({ email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
  res.status(200).json({ message: 'Login successful', token });
};
