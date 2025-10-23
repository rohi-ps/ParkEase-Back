const jwt = require('jsonwebtoken');
const users = []; // In-memory for demo

exports.register = (req, res) => {
  const { username, password } = req.body;
  if (!username || !password || password.length < 8) {
    return res.status(400).json({ message: 'Invalid input' });
  }

  const exists = users.find(u => u.username === username);
  if (exists) return res.status(409).json({ message: 'User already exists' });

  users.push({ username, password });
  res.status(201).json({ message: 'User registered successfully' });
};

exports.login = (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username && u.password === password);

  if (!user) return res.status(401).json({ message: 'Invalid credentials' });

  const token = jwt.sign({ username }, process.env.JWT_SECRET, { expiresIn: '1h' });
  res.status(200).json({ message: 'Login successful', token });
};

