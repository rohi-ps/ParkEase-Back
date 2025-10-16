const express = require('express');
const router = express.Router();
const {
  getAllInvoices,
  getInvoiceById,
  generateInvoice,
  processPayment,
  getPaymentMethods
} = require('../controllers/billingController');

// Get all invoices
router.get('/invoices', getAllInvoices);

// Get specific invoice
router.get('/invoices/:id', getInvoiceById);

// Generate new invoice
router.post('/invoices', generateInvoice);

// Process payment for an invoice
router.post('/invoices/:id/payment', processPayment);

// Get available payment methods
router.get('/payment-methods', getPaymentMethods);

module.exports = router;
