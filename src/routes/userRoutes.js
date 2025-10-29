
const express = require('express');
const router = express.Router();
const { register, login, logout } = require('../controllers/userController');
const {validationResult}  = require('express-validator');
const { verifyToken,requireRole } = require('../middleware/jwt');
const {registerValidators,loginValidators}=require('../validators/user-validations')
router.post('/register', registerValidators, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  await register(req, res);
});

router.post('/login', loginValidators,(req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
   login(req,res);
});
router.post('/logout', verifyToken,logout, (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

router.get('/profile', verifyToken, (req, res) => {
  res.json({ message: `Welcome ${req.user.email}` });
});
router.get('/admin', verifyToken, requireRole('admin'), (req, res) => {
  res.json({ message: `Welcome Admin ${req.user.email}` });
});



module.exports = router;


