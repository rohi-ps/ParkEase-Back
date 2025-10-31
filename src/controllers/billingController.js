const Invoice = require('../models/invoice');
const { calculateParkingCharges, PAYMENT_METHODS } = require('../utils/billingUtils');

// Get all invoices
const getAllInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find()
      .sort({ createdAt: -1 }) // Sort by latest first
      .populate('userId', 'email name'); // Populate user details if needed
    
    res.status(200).json({
      status: 'success',
      results: invoices.length,
      data: invoices
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error fetching invoices'
    });
  }
};

// Get invoice by ID
const getInvoiceById = async (req, res) => {
  try {
    const invoice = await Invoice.findOne({ invoiceId: req.params.id })
      .populate('userId', 'email name');

    if (!invoice) {
      return res.status(404).json({
        status: 'fail',
        message: 'Invoice not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: invoice
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error fetching invoice'
    });
  }
};

// Generate new invoice
const generateInvoice = async (req, res) => {
  try {
    const { userId, parkingSpotId, vehicleType, checkInTime, checkOutTime } = req.body;

    // Calculate charges using billing utils
    const charges = await calculateParkingCharges(vehicleType, checkInTime, checkOutTime);

    // Create new invoice using the Mongoose model
    const newInvoice = new Invoice({
      userId,
      parkingSpotId,
      vehicleType,
      checkInTime,
      checkOutTime,
      amount: charges.totalAmount,
      duration: charges.duration,
      breakdown: {
        baseRate: charges.baseRate,
        additionalHourRate: charges.additionalHourRate,
        hours: charges.duration
      }
    });

    // Save the invoice
    await newInvoice.save();

    res.status(201).json({
      status: 'success',
      data: newInvoice
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        status: 'fail',
        message: error.message
      });
    }
    res.status(500).json({
      status: 'error',
      message: error.message || 'Error generating invoice'
    });
  }
};

// Process payment for an invoice
const processPayment = async (req, res) => {
  try {
    const { paymentMethod } = req.body;
    const invoiceId = req.params.id;

    const invoice = await Invoice.findOne({ invoiceId });

    if (!invoice) {
      return res.status(404).json({
        status: 'fail',
        message: 'Invoice not found'
      });
    }

    // Check if invoice is already paid
    if (invoice.status === 'paid') {
      return res.status(400).json({
        status: 'fail',
        message: 'Invoice is already paid'
      });
    }

    // Process payment using the model method
    const updatedInvoice = await invoice.processPayment(paymentMethod);

    res.status(200).json({
      status: 'success',
      data: updatedInvoice
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        status: 'fail',
        message: error.message
      });
    }
    res.status(500).json({
      status: 'error',
      message: 'Error processing payment'
    });
  }
};

// Get available payment methods
const getPaymentMethods = async (req, res) => {
  try {
    res.status(200).json({
      status: 'success',
      data: PAYMENT_METHODS
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error fetching payment methods'
    });
  }
};

module.exports = {
  getAllInvoices,
  getInvoiceById,
  generateInvoice,
  processPayment,
  getPaymentMethods
};
