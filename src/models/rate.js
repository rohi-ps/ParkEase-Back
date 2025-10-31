const mongoose = require('mongoose');

const rateSchema = new mongoose.Schema({
  vehicleType: {
    type: String,
    enum: ['2W', '4W'],
    required: true
  },
  baseRate: {
    type: Number,
    required: true,
    min: 0
  },
  additionalHourRate: {
    type: Number,
    required: true,
    min: 0
  }
}, {
  timestamps: true
});

// Ensure unique vehicle types
rateSchema.index({ vehicleType: 1 }, { unique: true });

module.exports = mongoose.model('Rate', rateSchema);
