const express = require('express');
const router = express.Router();
const { validationResult } = require('express-validator');

const {createReservation,updateReservation,deleteReservation,allusers} = require('../controllers/reservationController');

const { reservationValidators, updateReservationValidators } = require('../validators/reservationValidator');

router.post('/create', reservationValidators, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  await createReservation(req, res);
});

router.put('/update/:slotId', updateReservationValidators, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  await updateReservation(req, res);
});

router.delete('/delete/:slotId', deleteReservation);

router.get('/getall', allusers);

module.exports = router;
