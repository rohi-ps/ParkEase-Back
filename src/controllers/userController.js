const jwt = require('jsonwebtoken');
const { addToken } = require('../utils/tokenBlackList');
const User=require('../models/user');
const bcrypt = require('bcrypt');
exports.register = async (req, res) => {
  const { email, firstName, lastName, password, phone } = req.body;
  const name = `${firstName} ${lastName}`;
  const existingUser =  await User.findOne({ email });
  if (existingUser) {
    return res.status(409).json({ message: 'User already exists' });
  }

const hashedPassword = await bcrypt.hash(password, 10);
  const newUser =  await new User({ email, name, phone, password: hashedPassword,role:'user' });
  newUser.save();
  res.status(201).json({ message: 'User registered successfully' });
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }); 
    if (!user || !(await bcrypt.compare(password, user.password))) {
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
      { expiresIn: '15m' }
    );
    res.status(200).json({ message: 'Login successful', token, role: user.role,email: user.email,id: user._id });
  } catch (err) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.logout = (req, res) => {
  addToken(req.headers.authorization?.split(' ')[1]);
  res.json({ message: 'Logout successful' });
};
