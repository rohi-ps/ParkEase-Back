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
    ref: "user"
  },
  vehicleNumber: {
    type: String,
    required: [true, "Vehicle Number is required."],
    match: /^[A-Z]{2}\d{2}[A-Z]{2}\d{4}$/
  },
  entryDate: {
    type: String,
    required: [true, "Entry date is required."]
  },
  entryTime: {
    type: String,
    required: [true, "Entry time is required."]
  },
  exitDate: {
    type: String,
    required: [true, "Exit date is required."]
  },
  exitTime: {
    type: String,
    required: [true, "Exit time is required."]
  },
  status: {
    type: String,
    enum: ["Active", "Completed", "Cancelled", "Upcoming"],
    default: "Upcoming"
  }
});

reservationSchema.pre("validate", function (next) {
  const now = new Date();
  const entryDateTime = new Date(`${this.entryDate}T${this.entryTime}`);
  const exitDateTime = new Date(`${this.exitDate}T${this.exitTime}`);

  // Check if entry date is before today
  const today = now.toISOString().split("T")[0];
  if (this.entryDate < today) {
    return next(new Error("Entry date cannot be in the past."));
  }

  // Check if entry time is before now (only if entry date is today)
  const currentTime = now.toTimeString().slice(0, 5); // HH:mm
  if (this.entryDate === today && this.entryTime < currentTime) {
    return next(new Error("Entry time cannot be in the past."));
  }

  // Check if exit is before or equal to entry
  if (exitDateTime <= entryDateTime) {
    return next(new Error("Exit time must be after entry time."));
  }

  next();
});


module.exports = mongoose.model("Reservation", reservationSchema);