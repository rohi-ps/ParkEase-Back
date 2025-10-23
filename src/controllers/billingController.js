const { readJsonFile, writeJsonFile, calculateParkingCharges, generateInvoiceId } = require('../utils/billingUtils');

// Get all invoices
const getAllInvoices = async (req, res) => {
  try {
    const data = await readJsonFile();
    res.status(200).json({
      status: 'success',
      data: data.invoices
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
    const data = await readJsonFile();
    const invoice = data.invoices.find(inv => inv.invoiceId === req.params.id);
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

    // Validate required fields
    if (!userId || !parkingSpotId || !vehicleType || !checkInTime || !checkOutTime) {
      return res.status(400).json({
        status: 'fail',
        message: 'Missing required fields'
      });
    }

    // Validate vehicle type
    if (!["2W", "4W"].includes(vehicleType)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid vehicle type. Must be either "2W" or "4W"'
      });
    }

    // Calculate charges
    const charges = await calculateParkingCharges(vehicleType, checkInTime, checkOutTime);

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

    // Read current data
    const data = await readJsonFile();
    
    // Add new invoice
    data.invoices.push(newInvoice);
    
    // Write updated data back to file
    await writeJsonFile(data);

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
const processPayment = async (req, res) => {
  try {
    const { paymentMethod } = req.body;
    const invoiceId = req.params.id;

    // Read current data
    const data = await readJsonFile();

    if (!paymentMethod || !data.paymentMethods.includes(paymentMethod)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid payment method'
      });
    }

    // Find invoice
    const invoiceIndex = data.invoices.findIndex(inv => inv.invoiceId === invoiceId);
    if (invoiceIndex === -1) {
      return res.status(404).json({
        status: 'fail',
        message: 'Invoice not found'
      });
    }

    // Update invoice
    data.invoices[invoiceIndex] = {
      ...data.invoices[invoiceIndex],
      paymentMethod,
      status: 'paid',
      paidAt: new Date().toISOString()
    };

    // Write updated data back to file
    await writeJsonFile(data);

    res.status(200).json({
      status: 'success',
      data: data.invoices[invoiceIndex]
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error processing payment'
    });
  }
};

// Get available payment methods
const getPaymentMethods = async (req, res) => {
  try {
    const data = await readJsonFile();
    res.status(200).json({
      status: 'success',
      data: data.paymentMethods
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
