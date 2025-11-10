const Rate = require('../models/rate');

// Get all rates
const getRates = async (req, res) => {
  try {
    const rates = await Rate.find();
    res.status(200).json({
      status: 'success',
      data: rates
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error fetching rates'
    });
  }
};

// Create new rate
const createRate = async (req, res) => {
  try {
    const { vehicleType, baseRate, additionalHourRate } = req.body;
    
    // Check if rate already exists for this vehicle type
    const existingRate = await Rate.findOne({ vehicleType });
    if (existingRate) {
      return res.status(400).json({
        status: 'fail',
        message: `Rate for ${vehicleType} already exists`
      });
    }

    const newRate = new Rate({
      vehicleType,
      baseRate,
      additionalHourRate
    });

    await newRate.save();

    res.status(201).json({
      status: 'success',
      data: newRate
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
      message: 'Error creating rate'
    });
  }
};

// Update rate
const updateRate = async (req, res) => {
  try {
    const { vehicleType } = req.params;
    const { baseRate, additionalHourRate } = req.body;

    const rate = await Rate.findOne({ vehicleType });
    if (!rate) {
      return res.status(404).json({
        status: 'fail',
        message: 'Rate not found'
      });
    }

    rate.baseRate = baseRate;
    rate.additionalHourRate = additionalHourRate;
    await rate.save();

    res.status(200).json({
      status: 'success',
      data: rate
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
      message: 'Error updating rate'
    });
  }
};

module.exports = {
  getRates,
  createRate,
  updateRate
};