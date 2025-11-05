
const mongoose = require("mongoose");

const reservationSchema = new mongoose.Schema({
  slotId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ParkingSlot",
    required: [true, "Slot Id is required."]
  },
  vehicleType: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ParkingSlot",
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null
  },
  vehicleNumber: {
    type: String,
    required: [true, "Vehicle Number is required."],
    match: /^[A-Z]{2}\d{2}[A-Z]{2}\d{4}$/
  },
  entryDate: {
    type: String,
    required: true
  },
  exitDate: {
    type: String,
    required: true
  },
  entryTime: {
    type: String,
    required: true
  },
  exitTime: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ["Active", "Completed", "Cancelled", "Upcoming"],
    default: "Upcoming"
  }
});

module.exports = mongoose.model("Reservation", reservationSchema);
