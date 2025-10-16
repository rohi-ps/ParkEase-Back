
const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/userController');
const { verifyToken } = require('../middleware/jwt');
const { createReservation ,updateReservation, deleteReservation,allusers} = require('../controllers/userController');
router.post('/register', register);
router.post('/login', login);
router.delete('/delete/:slotID', deleteReservation);
router.put('/update', updateReservation);
router.post('/create', createReservation);
router.get('/getall',allusers)
// Example protected route
router.get('/profile', verifyToken, (req, res) => {
  res.json({ message: `Welcome ${req.user.username}` });
});



module.exports = router;


