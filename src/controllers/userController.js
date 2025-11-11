const jwt = require("jsonwebtoken");
const BlacklistedToken = require("../models/logout model");
const User = require("../models/Registeruser");
const UserCred = require("../models/userCredentials");
const bcrypt = require("bcrypt");
exports.register = async (req, res) => {
  const { email, firstName, lastName, password, phone } = req.body;
  const name = `${firstName} ${lastName}`;
  console.log("Incoming payload:", req.body);

  const existingUser = await UserCred.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    return res.status(409).json({ success: false, message: "User already exists" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const login = new UserCred({email: email.toLowerCase(),role: "user",password: hashedPassword});
  const registeredUser = new User({name,email: email.toLowerCase(),phone,invoices: [],});
  await login.save();
  await registeredUser.save();
  res.status(201).json({ message: "User registered successfully" });
};

exports.registerAdmin = async (req, res) => {
  const { email, firstName, lastName, password, phone } = req.body;
  const name = `${firstName} ${lastName}`;
  console.log("Incoming payload:", req.body);

  const existingUser = await UserCred.findOne({ email });
  if (existingUser) {
    return res.status(409).json({ message: "Admin already exists" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const login = new UserCred({
    email,
    role: "admin",
    password: hashedPassword,
  });
  const registeredUser = new User({ name, email, phone, invoices: [] });
  login.save();
  registeredUser.save();
  res.status(201).json({ message: "Admin registered successfully" });
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const credUser = await UserCred.findOne({ email: email.toLowerCase() });
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!credUser || !user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!(await bcrypt.compare(password, credUser.password))) {
      return res.status(401).json({ message: "Wrong Password" });
    }

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is missing");
      return res
        .status(500)
        .json({ message: "Server misconfiguration: JWT_SECRET not set" });
    }

    const token = jwt.sign(
      { email: user.email, role: credUser.role, id: user._id, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );
    // console.log("JWT_SECRET:", process.env.JWT_SECRET);
    res.status(200).json({
      message: "Login successful",
      token,
      email: user.email,
        role: credUser.role,
        id: user._id,
    });
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.logout = async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(400).json({ message: "Token missing" });

  try {
    await BlacklistedToken.updateOne(
      { token },
      { $setOnInsert: { token } },
      { upsert: true }
    );
    res.json({ message: "Logout successful" });
  } catch (err) {
    console.error("Logout error:", err.message);
    res.status(500).json({ message: "Logout failed" });
  }
};

exports.searchUsersById = async (req, res, next) => {
  const phone = req.query.phone;
  if (!phone || phone.length < 3) {
    return res.status(200).json([]);
  }
  try {
    const users = await User.find({ phone });
    res.status(200).json(users);
  } catch (err) {
    console.error("Fetch user error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
