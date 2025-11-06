const Reservation = require('../models/reservationModel');
const ParkingSlot = require('../models/parkingModel');

exports.createReservation = async (req, res) => {
  try {
    const { slotId } = req.body;

    // Check if slot is already reserved
    const exists = await Reservation.findOne({ slotId });
    if (exists) {
      return res.status(409).json({ message: "Slot already reserved" });
    }

    // Create reservation
    const newReservation = new Reservation(req.body);
    await newReservation.save();

    const updatedSlot = await ParkingSlot.findByIdAndUpdate(
      slotId,
      { $set: { status: "occupied" } },
      { new: true }
    );

    if (!updatedSlot) {
      console.warn(`Slot ${slotId} not found for status update`);
    }

    res.status(201).json({
      message: "Reservation created successfully",
      data: newReservation
    });
  } catch (err) {
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
      slotId,
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

exports.allusers = async (req, res) => {
  try {
    const reservations = await Reservation.find()

    res.status(200).json(reservations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};