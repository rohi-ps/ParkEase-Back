const { ref } = require('joi');
const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.Mixed,
    ref: 'User',
    required: true
  },
  parkingSpotId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ParkingSlot',
    required: true
  },
  vehicleType: {
    type: String,
    required: true
  },
  checkInTime: {
    type: Date,
    required: true
  },
  checkOutTime: {
    type: Date,
    required: true
  },
  paymentMethod: {
    type: String,
    enum: ['credit_card', 'debit_card', 'upi', 'net_banking', 'wallet', null],
    default: null
  },
  status: {
    type: String,
    enum: ['pending', 'paid', 'cancelled', 'failed'],
    default: 'pending'
  },
  paidAt: {
    type: Date,
    default: null
  },
  reservationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Reservation',
    default: null
  },
  totalAmount: {
    baseRate: {
      type: Number,
      required: true
    },
    additionalHourRate: {
      type: Number,
      required: true
    },
    hours: {
      type: Number,
      required: true
    }
  }
}, {
  timestamps: true
});

// Create indexes for frequently queried fields
invoiceSchema.index({ userId: 1 });
invoiceSchema.index({ status: 1 });
invoiceSchema.index({ parkingSpotId: 1 });
invoiceSchema.index({ paidAt: 1 });


module.exports = mongoose.model('Invoice', invoiceSchema);
