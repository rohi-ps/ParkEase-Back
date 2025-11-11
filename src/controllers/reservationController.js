const Reservation = require('../models/reservationModel');
const ParkingSlot = require('../models/parkingModel');
const User = require('../models/Registeruser');
const { object } = require('joi');
 
exports.createReservation = async (req, res) => {
  try {
    const { slotId: receivedSlotName, // <--- Rename the incoming field
            vehicleNumber, 
            vehicleType, 
            entryDate, 
            entryTime, 
            exitDate, 
            exitTime, 
            Duration, 
            Amount, 
            status } = req.body;
    // console.log("Creating reservation for slot:", slotId, "and vehicle:", vehicleNumber);
    // Resolve slot by slotName
    const slot = await ParkingSlot.findOne({slotName:receivedSlotName });
    console.log("Resolved slot:", slot);
    if (!slot) {
      return res.status(404).json({ message: "Slot not found." });
    }

    const slotId = slot._id; // Use the resolved ObjectId
    // Check for existing reservations
    const slotExists = await Reservation.findOne({
      slotId: slot._id,
      status: { $in: ["Active", "Upcoming"] }
    });
    if (slotExists) {
      return res.status(409).json({ message: "Slot already reserved." });
    }
 
    const vehicleExists = await Reservation.findOne({
      vehicleNumber,
      status: { $in: ["Active", "Upcoming"] }
    });
    if (vehicleExists) {
      return res.status(409).json({ message: "Vehicle already has a reservation." });
    }
 
    // Create reservation with resolved ObjectIds
    const newReservation = new Reservation({
      slotId,
      vehicleType,
      vehicleNumber,
      userId: req.body.userId,
      entryDate: req.body.entryDate,
      entryTime: req.body.entryTime,
      exitDate: req.body.exitDate,
      exitTime: req.body.exitTime,
      Duration, 
      Amount
    });
 
    await newReservation.save();
 
    // Update user reservations
    await User.findByIdAndUpdate(req.userId, {
      $push: { reservations: newReservation._id }
    });
 
    // Update slot status
    await ParkingSlot.findByIdAndUpdate(slot._id, { status: "occupied" });
 
    res.status(201).json({
      message: "Reservation created successfully.",
      data: newReservation
    });
  } catch (err) {
    console.error("Reservation error:", err);
    if (err.code === 11000) {
      return res.status(409).json({ message: "Duplicate reservation detected." });
    }
    res.status(500).json({ error: err.message });
  }
};
 
// Update reservation
exports.updateReservation = async (req, res) => {
  try {
    const { slotId } = req.params;
   
    // First fetch the existing reservation
    const existingReservation = await Reservation.findOne({ slotId });
   
    if (!existingReservation) {
      return res.status(404).json({ message: "Reservation not found" });
    }
 
    // Merge existing and new data
    const updateData = {
      entryDate: req.body.entryDate || existingReservation.entryDate,
      entryTime: req.body.entryTime || existingReservation.entryTime,
      exitDate: req.body.exitDate || existingReservation.exitDate,
      exitTime: req.body.exitTime || existingReservation.exitTime
    };
 
    const updated = await Reservation.findOneAndUpdate(
      { slotId },
      { $set: updateData },
      { new: true, runValidators: true }
    );
 
    res.json({
      message: "Reservation updated successfully",
      data: updated
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
 
// Delete reservation
exports.deleteReservation = async (req, res) => {
  try {
    const slotId  = req.params.id;
    console.log("Deleting reservation with id:", slotId);
    const deletedReservation = await Reservation.findOneAndDelete({ slotId });
    console.log("Deleted reservation:", deletedReservation);
    if (!deletedReservation) {
      return res.status(404).json({ message: "Reservation not found" });
    }
    res.json({ message: "Reservation deleted successfully" });
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ error: err.message });
  }
};
 
exports.getReservationByUser = async (req, res) => {
  try {
    const userId = req.params.userId;  
    const reservations = await Reservation.find({ userId })
      .populate("slotId", "slotName vehicleType")
 
    if (!reservations || reservations.length === 0) {
      return res.status(404).json({ message: "No reservations found for this user" });
    }
 
    res.status(200).json(reservations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
 
 
exports.allusers = async (req, res) => {
  try {
    const reservations = await Reservation.find().populate(
      {
        path:'slotId',
        model:'ParkingSlot',
        select:'slotName vehicleType',
      }
    )
    console.log("All reservation IDs:", reservations.map(r => r._id.toString()));
    res.status(200).json(reservations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

