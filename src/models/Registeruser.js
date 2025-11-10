const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
    phone: {
    type: String,
    required: true,
    match: /^[6-9]\d{9}$/
  },
  reservations: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Reservation'
    }
  ],

  invoices: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Invoice'
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('user', userSchema);
