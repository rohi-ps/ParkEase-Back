const express = require('express');
const router = express.Router();
const passport = require("../config/passportconfig");
const { validationResult } = require('express-validator');
 
const { createReservation, updateReservation, deleteReservation, allusers, getReservationByUser } = require('../controllers/reservationController');
 
const { reservationValidators, updateReservationValidators } = require('../validators/reservationValidator');
 
const { requireRole } = require("../middleware/jwt.js");

router.post('/create', 
  reservationValidators, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    await createReservation(req, res);
  });

router.put('/update/:id', 
  updateReservationValidators, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    await updateReservation(req, res);
  });

router.delete('/delete/:id', 
  deleteReservation);

router.get('/user/:userId',
  getReservationByUser);
router.get('/getall', 
  allusers);

module.exports = router;