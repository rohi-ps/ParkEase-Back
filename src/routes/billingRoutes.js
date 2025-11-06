const express = require('express');
const router = express.Router();
const { validationResult } = require('express-validator');
const passport = require('../config/passportconfig');
const { requireRole } = require('../middleware/jwt');
const {
  generateInvoiceValidators,
  processPaymentValidators,
  getInvoiceValidators
} = require('../validators/billing-validations');
const { createRateValidators, updateRateValidators } = require('../validators/rate-validations');
const {
  getAllInvoices,
  getInvoiceById,
  generateInvoice,
  processPayment,
  getPaymentMethods,
  getRates,
  createRate,
  updateRate
} = require('../controllers/billingController');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed');
    error.array = () => errors.array();
    return next(error);
  }
  next();
};

// Get all invoices (admin only)
router.get('/invoices', 
  // passport.authenticate('jwt', { session: false }),
  // requireRole('admin'),
  getAllInvoices
);

// Get specific invoice (authenticated user)
router.get('/invoices/:id', 
  // passport.authenticate('jwt', { session: false }),
  // getInvoiceValidators,
  // validate,
  getInvoiceById
);

// Generate new invoice (authenticated user)
router.post('/invoices', 
  // passport.authenticate('jwt', { session: false }),
  // generateInvoiceValidators,
  // validate,
  generateInvoice
);

// Process payment for an invoice (authenticated user)
router.put('/invoices/:id/payment', 
  passport.authenticate('jwt', { session: false }),
  processPaymentValidators,
  validate,
  processPayment
);

// Get available payment methods (authenticated user)
router.get('/payment-methods',
  passport.authenticate('jwt', { session: false }),
  getPaymentMethods
);

// Rate management routes (admin only)
router.get('/rates',
  passport.authenticate('jwt', { session: false }),
  requireRole('admin'),
  getRates
);

//Create rates
router.post('/rates',
  passport.authenticate('jwt', { session: false }),
  requireRole('admin'),
  createRateValidators,
  validate,
  createRate
);

// Update rates
router.put('/rates/:vehicleType',
  passport.authenticate('jwt', { session: false }),
  requireRole('admin'),
  updateRateValidators,
  validate,
  updateRate
);

module.exports = router;
