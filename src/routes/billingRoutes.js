const express = require('express');
const router = express.Router();
const { validationResult } = require('express-validator');
const { verifyToken } = require('../middleware/jwt');
const {
  getAllInvoices,
  getInvoiceById,
  generateInvoice,
  processPayment,
  getPaymentMethods
} = require('../controllers/billingController');
const {
  generateInvoiceValidators,
  processPaymentValidators,
  getInvoiceValidators
} = require('../validators/billing-validations');

// Middleware to check for validation errors
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: 'fail',
      errors: errors.array()
    });
  }
  next();
};

// Get all invoices
router.get('/invoices', verifyToken, getAllInvoices);

// Get specific invoice
router.get('/invoices/:id', 
  verifyToken, 
  getInvoiceValidators,
  validate,
  getInvoiceById
);

// Generate new invoice
router.post('/invoices', 
  verifyToken,
  generateInvoiceValidators,
  validate,
  generateInvoice
);

// Process payment for an invoice
router.post('/invoices/:id/payment', 
  verifyToken,
  processPaymentValidators,
  validate,
  processPayment
);

// Get available payment methods
// router.get('/payment-methods', getPaymentMethods);

module.exports = router;
