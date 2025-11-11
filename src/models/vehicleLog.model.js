const mongoose = require('mongoose');
const { Schema } = mongoose;

const vehicleLogSchema = new Schema(
  {
    vehicleNumber: {
      type: String,
      required: [true, "Vehicle number is required."],
      trim: true,
      index: true
    },
    vehicleType: {
      type: String,
      required: [true, "Vehicle type is required."],
      enum: ['2W', '4W']
    },
    entryTime: {
      type: Date,
      required: [true, "Entry time is required."],
      default: Date.now
    },
    exitTime: {
      type: Date,
      default: null
    },
    
    slotId: {
      type: Schema.Types.ObjectId,
      ref: 'ParkingSlot', 
      required: [true, "Parking slot is required."],
      index: true
    },
    status: {
      type: String,
      required: true,
      enum: ['Parked', 'Completed'],
      default: 'Parked' // This will fix your createLog logic!
    },
   
    userId: {
      type: Schema.Types.Mixed,
      ref: 'User', 
      default: null,
      index: true
    }
  },
  {
    
    timestamps: false,
    collection: 'vehiclelogs'
  }
);

vehicleLogSchema.index({ exitTime: 1 });

const VehicleLog = mongoose.model('VehicleLog', vehicleLogSchema);
module.exports = VehicleLog;

