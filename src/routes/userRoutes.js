const express = require('express');
const router = express.Router();
const passport = require('../config/passportconfig');
const { register, login, logout, searchUsersById } = require('../controllers/userController');
const { requireRole } = require('../middleware/jwt');
const { registerValidators, loginValidators } = require('../validators/user-validations');
const { validationResult } = require('express-validator');
const User = require('../models/userCredentials');
const checkBlacklist = require('../middleware/logoutmiddleware');
router.post('/register', registerValidators, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  await register(req, res);
});

router.post('/login', loginValidators, (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  login(req, res);
});

router.get('/profile',
  checkBlacklist, // must run first
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    res.json({ message: `Welcome ${req.user.email}`, user: req.user });
  }
);



router.get('/admin',
  passport.authenticate('jwt', { session: false }),
  requireRole('admin'),
  (req, res) => {
    res.json({ message: `Welcome Admin ${req.user.email}` });
  }
);
router.post('/logout',
  checkBlacklist,
  passport.authenticate('jwt', { session: false }),
  logout
);

router.get('/getallusers', async (req, res) => {
  const users = await User.find();
  res.json(users);
});

//search user ID by phone number
router.get('/search-user',passport.authenticate('jwt',{session:false}),requireRole('admin'),searchUsersById);


module.exports = router;
