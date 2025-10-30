const express = require('express');
const router = express.Router();
const passport = require('passport');
const { register, login, logout } = require('../controllers/userController');
const { requireRole } = require('../middleware/jwt');
const { registerValidators, loginValidators } = require('../validators/user-validations');
const { validationResult } = require('express-validator');

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
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    res.json({ message: `Welcome ${req.user.email}` });
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
  passport.authenticate('jwt', { session: false }),
  logout
);

module.exports = router;
