const express = require('express');
const router = express.Router();
const passport = require("../config/passportconfig");
const { validationResult } = require('express-validator');

const { createReservation, updateReservation, deleteReservation, allusers, getReservationByUser } = require('../controllers/reservationController');

const { reservationValidators, updateReservationValidators } = require('../validators/reservationValidator');

const { requireRole } = require("../middleware/jwt.js");

router.post('/create', passport.authenticate('jwt', { session: false }),
  reservationValidators, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    await createReservation(req, res);
  });

router.put('/update/:slotId', passport.authenticate('jwt', { session: false }),
  updateReservationValidators, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    await updateReservation(req, res);
  });

router.delete('/delete/:slotId', passport.authenticate('jwt', { session: false }),
  deleteReservation);

router.get('/user', passport.authenticate('jwt', { session: false }),
  getReservationByUser);
router.get('/getall', passport.authenticate('jwt', { session: false }),requireRole('admin'),
  allusers);

module.exports = router;