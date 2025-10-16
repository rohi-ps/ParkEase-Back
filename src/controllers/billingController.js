const { invoices, paymentMethods } = require('../data/billingData');
const { calculateParkingCharges, generateInvoiceId } = require('../utils/billingUtils');

// Get all invoices
const getAllInvoices = (req, res) => {
  try {
    res.status(200).json({
      status: 'success',
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
const getInvoiceById = (req, res) => {
  try {
    const invoice = invoices.find(inv => inv.invoiceId === req.params.id);
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
const generateInvoice = (req, res) => {
  try {
    const { userId, parkingSpotId, vehicleType, checkInTime, checkOutTime } = req.body;

    // Validate required fields
    if (!userId || !parkingSpotId || !vehicleType || !checkInTime || !checkOutTime) {
      return res.status(400).json({
        status: 'fail',
        message: 'Missing required fields'
      });
    }

    // Calculate charges
    const charges = calculateParkingCharges(vehicleType, checkInTime, checkOutTime);

    // Create new invoice
    const newInvoice = {
      invoiceId: generateInvoiceId(),
      userId,
      parkingSpotId,
      vehicleType,
      checkInTime,
      checkOutTime,
      amount: charges.totalAmount,
      paymentMethod: null,
      status: 'pending',
      timestamp: new Date().toISOString(),
      duration: charges.duration,
      breakdown: {
        baseRate: charges.baseRate,
        additionalHourRate: charges.additionalHourRate,
        hours: charges.duration
      }
    };

    invoices.push(newInvoice);

    res.status(201).json({
      status: 'success',
      data: newInvoice
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message || 'Error generating invoice'
    });
  }
};

// Process payment for an invoice
const processPayment = (req, res) => {
  try {
    const { paymentMethod } = req.body;
    const invoiceId = req.params.id;

    if (!paymentMethod || !paymentMethods.includes(paymentMethod)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid payment method'
      });
    }

    // Find invoice
    const invoiceIndex = invoices.findIndex(inv => inv.invoiceId === invoiceId);
    if (invoiceIndex === -1) {
      return res.status(404).json({
        status: 'fail',
        message: 'Invoice not found'
      });
    }

    invoices[invoiceIndex] = {
      ...invoices[invoiceIndex],
      paymentMethod,
      status: 'paid',
      paidAt: new Date().toISOString()
    };

    res.status(200).json({
      status: 'success',
      data: invoices[invoiceIndex]
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error processing payment'
    });
  }
};

// Get available payment methods
const getPaymentMethods = (req, res) => {
  try {
    res.status(200).json({
      status: 'success',
      data: paymentMethods
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
