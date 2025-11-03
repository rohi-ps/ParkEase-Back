const mongoose = require("mongoose");

const reservationSchema = new mongoose.Schema({
  slotId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ParkingSlot", // Assumes a 'ParkingSlot' model
    required: [true, "Parking slot is required."],
    index: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Assumes a 'User' model
    default: null,
    index: true,
  },
  vehicleNumber: {
    type: String,
    required: true,
  },
  entryDate: {
    type: String,
    required: true,
  },
  exitDate: {
    type: String,
    required: true,
  },
  entryTime: {
    type: String,
    required: true,
  },
  exitTime: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("Reservation", reservationSchema);
