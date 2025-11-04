const mongoose = require('mongoose');

const registerSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  role: {
    type: String,
    default: 'user'
  },
  password: {
    type: String,
    required: true
  }
}, { timestamps: true });



module.exports = mongoose.model('userCred', registerSchema);