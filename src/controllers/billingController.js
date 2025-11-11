const mongoose = require('mongoose');
const Invoice = require('../models/invoice');
const Rate = require('../models/rate');
const User= require('../models/Registeruser');
const { calculateParkingCharges, PAYMENT_METHODS } = require('../utils/billingUtils');

// Get all invoices
const getAllInvoices = async (req, res) => {
  try {
    let invoices = await Invoice.find().sort({ createdAt: -1 });

    // Populate only valid ObjectIds
    invoices = await Promise.all(
      invoices.map(async (invoice) => {
        if (mongoose.Types.ObjectId.isValid(invoice.userId)) {
          await invoice.populate({
            path: 'userId',
            model: 'User',
            select: 'name email'
          });
        } else {
          // Add a virtual field for guest
          invoice.userId = { name: `${invoice.userId}_Guest`, email: null };
        }
        return invoice;
      })
    );

    if (!invoices || invoices.length === 0) {
      return res.status(404).json({
        status: 'fail',
        message: 'No invoices found'
      });
    }

    res.status(200).json({
      status: 'success',
      results: invoices.length,
      data: invoices
    });
  } catch (error) {
    console.error('Error in getAllInvoices:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching invoices',
      error: error.message
    });
  }
};
// Get invoice by ID
const getInvoiceById = async (req, res) => {
  try {
    // Authorization should be handled by middleware
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid invoice ID format'
      });
    }

    const invoice = await Invoice.find({ userId: req.params.id })
      .populate({
        path: 'userId',
        model: 'user',
        select: 'name email'
      })

      console.log(invoice);
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
    console.error('Error in getInvoiceById:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching invoice',
      error: error.message
    });
  }
};

// Generate new invoice
const generateInvoice = async (req, res) => {
  try {
    const { userId, parkingSpotId, vehicleType, checkInTime, checkOutTime } = req.body;

    // Validate vehicle type
    const validVehicleTypes = ['2W', '4W'];
    if (!validVehicleTypes.includes(vehicleType)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid vehicle type. Must be either "2W" or "4W"'
      });
    }

    // Check if rate exists for this vehicle type
    const rate = await Rate.findOne({ vehicleType });
    if (!rate) {
      return res.status(400).json({
        status: 'fail',
        message: `No parking rate found for vehicle type: ${vehicleType}`
      });
    }

    // Calculate charges using billing utils
    const charges = await calculateParkingCharges(vehicleType, checkInTime, checkOutTime);

    // Create new invoice using the Mongoose model
    const newInvoice = new Invoice({
      userId,
      parkingSpotId,
      vehicleType,
      checkInTime,
      checkOutTime,
      totalAmount: {
        baseRate: charges.baseRate,
        additionalHourRate: charges.additionalHourRate,
        hours: charges.duration
      }
    });

    // Save the invoice
    await newInvoice.save();
    User.findByIdAndUpdate(userId,{
      $push:{
        invoices: newInvoice._id
      }
    })// for the one to many relationship

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

    if (!PAYMENT_METHODS.includes(paymentMethod)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid payment method'
      });
    }

    const invoice = await Invoice.findById(invoiceId);

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

    // Update invoice with payment details
    invoice.paymentMethod = paymentMethod;
    invoice.status = 'paid';
    invoice.paidAt = new Date();
    const updatedInvoice = await invoice.save();

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
    // Authorization should be handled by middleware
    if (!PAYMENT_METHODS || PAYMENT_METHODS.length === 0) {
      return res.status(404).json({
        status: 'fail',
        message: 'No payment methods available'
      });
    }

    res.status(200).json({
      status: 'success',
      count: PAYMENT_METHODS.length,
      data: PAYMENT_METHODS
    });
  } catch (error) {
    console.error('Error in getPaymentMethods:', error);
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
  getPaymentMethods,
};
