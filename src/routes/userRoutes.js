
const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/userController');
const {validationResult}  = require('express-validator');
const { verifyToken,requireRole } = require('../middleware/jwt');
const {registerValidators,loginValidators}=require('../validators/user-validations')
router.post('/register', registerValidators,(req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  register(req,res);
});
router.post('/login', loginValidators,(req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
   login(req,res);
});
router.get('/profile', verifyToken, (req, res) => {
  res.json({ message: `Welcome ${req.user.username}` });
});
router.get('/admin', verifyToken, requireRole('admin'), (req, res) => {
  res.json({ message: `Welcome Admin ${req.user.username}` });
});



module.exports = router;


