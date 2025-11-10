const express = require('express');
const router = express.Router();
const { validationResult } = require('express-validator');
const passport = require('../config/passportconfig');
const { requireRole } = require('../middleware/jwt');
const {
    getRates,
    createRate,
    updateRate
} = require('../controllers/rateController');
const {
    createRateValidators,
    updateRateValidators
} = require('../validators/rate-validations');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed');
    error.array = () => errors.array();
    return next(error);
  }
  next();
};
// Rate management routes
router.get('/',
  passport.authenticate('jwt', { session: false }),
  getRates
);

//Create rates
router.post('/',
  passport.authenticate('jwt', { session: false }),
  requireRole('admin'),
  createRateValidators,
  validate,
  createRate
);

// Update rates
router.put('/:vehicleType',
  passport.authenticate('jwt', { session: false }),
  requireRole('admin'),
  updateRateValidators,
  validate,
  updateRate
);

module.exports = router;