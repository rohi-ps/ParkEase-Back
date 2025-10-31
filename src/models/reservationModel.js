const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
  slotID: { 
    type: String,
    required: true, 
    unique: true 
  },
  VehicleType: { 
    type: String, 
    enum: ['2W', '4W'], 
    required: true 
  },
  vehicleNumber: { 
    type: String, 
    required: true 
  },
  EntryDate: { 
    type: String, 
    required: true 
  },
  EntryTime: { 
    type: String, 
    required: true 
    },
  ExitDate: { 
    type: String, 
    required: true 
    },
  ExitTime: { 
    type: String, 
    required: true 
    }
});

module.exports = mongoose.model('Reservation', reservationSchema);
