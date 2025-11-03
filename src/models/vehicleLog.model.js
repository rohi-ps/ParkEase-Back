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
      ref: 'ParkingSlot', // Assumes a 'ParkingSlot' model
      required: [true, "Parking slot is required."],
      index: true
    },
   
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User', // Assumes a 'User' model
      default: null,
      index: true
    }
  },
  {
    
    timestamps: false,
    collection: 'vehiclelogs'
  }
);

/**
 * Add a compound index to quickly find currently parked vehicles
 */
vehicleLogSchema.index({ exitTime: 1 });

const VehicleLog = mongoose.model('VehicleLog', vehicleLogSchema);
module.exports = VehicleLog;

