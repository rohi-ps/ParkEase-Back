const Reservation = require('../models/reservationModel');
const ParkingSlot = require('../models/parkingModel');

exports.createReservation = async (req, res) => {
  try {
    const { slotId, vehicleNumber } = req.body;

    // Check if slot is already reserved
    const slotExists = await Reservation.findOne({
      slotId,
      status: { $in: ["Active", "Upcoming"] }
    });

    if (slotExists) {
      return res.status(409).json({
        message: "This slot is already reserved for the selected time."
      });
    }

    // Check if vehicle already has an active/upcoming reservation
    const vehicleExists = await Reservation.findOne({
      vehicleNumber,
      status: { $in: ["Active", "Upcoming"] }
    });

    if (vehicleExists) {
      return res.status(409).json({
        message: "This vehicle already has an active or upcoming reservation."
      });
    }

    // Create reservation
    const newReservation = new Reservation({...req.body,userId: req.user._id });
    await newReservation.save();

    // Update slot status to occupied
    const updatedSlot = await ParkingSlot.findByIdAndUpdate(
      { slotName: slotId },
      { $set: { status: "occupied" } },
      { new: true }
    );

    if (!updatedSlot) {
      console.warn(`Slot ${slotId} not found for status update`);
    }

    res.status(201).json({
      message: "Reservation created successfully.",
      data: newReservation
    });
  } catch (err) {
    // Handle MongoDB duplicate key error
    if (err.code === 11000) {
      return res.status(409).json({
        message: "Duplicate reservation detected. Vehicle already reserved."
      });
    }

    res.status(500).json({ error: err.message });
  }
};
// Update reservation 
exports.updateReservation = async (req, res) => {
  try {
    const { slotId } = req.params;
    const { entryDate, entryTime, exitDate, exitTime } = req.body;

    const updated = await Reservation.findOneAndUpdate(
      { slotId },
      {
        $set: {
          entryDate,
          entryTime,
          exitDate,
          exitTime
        }
      },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Reservation not found" });
    }

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
    const { slotId } = req.params;

    const deleted = await Reservation.findOneAndDelete({ slotId });

    if (!deleted) {
      return res.status(404).json({ message: "Reservation not found" });
    }

    const updatedSlot = await ParkingSlot.findByIdAndUpdate(
      { slotName: slotId },
      { $set: { status: "available" } },
      { new: true }
    );

    if (!updatedSlot) {
      console.warn(`Slot ${slotId} not found for status revert`);
    }

    res.json({ message: "Reservation deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getReservationByUser = async (req, res) => {
  try {
    const userId = req.user._id;

    const reservations = await Reservation.find({ userId });

    if (!reservations || reservations.length === 0) {
      return res.status(404).json({ message: 'No reservations found for this user' });
    }

    res.status(200).json({ data: reservations });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


exports.allusers = async (req, res) => {
  try {
    const reservations = await Reservation.find()

    res.status(200).json(reservations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};