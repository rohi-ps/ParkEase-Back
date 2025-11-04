const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  parkingSpotId: {
    type: String,
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
    enum: ['credit_card', 'debit_card', 'upi', 'net_banking', 'wallet'],
    default: null
  },
  status: {
    type: String,
    enum: ['pending', 'paid', 'cancelled'],
    default: 'pending'
  },
  paidAt: {
    type: Date,
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

// Methods for payment processing
invoiceSchema.methods.processPayment = async function(paymentMethod) {
  this.paymentMethod = paymentMethod;
  this.status = 'paid';
  this.paidAt = new Date();
  return await this.save();
};

module.exports = mongoose.model('Invoice', invoiceSchema);
