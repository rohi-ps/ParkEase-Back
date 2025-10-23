
const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/userController');
const { verifyToken } = require('../middleware/jwt');
router.post('/register', register);
router.post('/login', login);

// Example protected route
router.get('/profile', verifyToken, (req, res) => {
  res.json({ message: `Welcome ${req.user.username}` });
});



module.exports = router;


