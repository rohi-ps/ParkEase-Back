const Reservation = require("../models/reservationModel");
const ParkingSlot = require("../models/parkingModel");
const User = require("../models/Registeruser");
const Invoice = require("../models/invoice");
const Rate = require("../models/rate");

exports.createReservation = async (req, res) => {
  try {
    const {
      slotId: receivedSlotName, // <--- Rename the incoming field
      vehicleNumber,
      vehicleType,
      entryDate,
      entryTime,
      exitDate,
      exitTime,
      Duration,
      Amount,
      status,
    } = req.body;
    // console.log("Creating reservation for slot:", slotId, "and vehicle:", vehicleNumber);
    // Resolve slot by slotName
    const slot = await ParkingSlot.findOne({ slotName: receivedSlotName });
    if (!slot) {
      return res.status(404).json({ message: "Slot not found." });
    }

    const slotId = slot._id; // Use the resolved ObjectId
    // Check for existing reservations
    const slotExists = await Reservation.findOne({
      slotId: slotId,
      status: { $in: ["Active", "Upcoming"] },
    });
    if (slotExists) {
      return res.status(409).json({ message: "Slot already reserved." });
    }

    const vehicleExists = await Reservation.findOne({
      vehicleNumber,
      status: { $in: ["Active", "Upcoming"] },
    });
    if (vehicleExists) {
      return res
        .status(409)
        .json({ message: "Vehicle already has a reservation." });
    }

    // Create reservation with resolved ObjectIds
    const newReservation = new Reservation({
      slotId,
      vehicleNumber,
      vehicleType,
      userId: req.body.userId,
      entryDate: entryDate,
      entryTime: entryTime,
      exitDate: exitDate,
      exitTime: exitTime,
      Duration,
      Amount,
    });
    const savedReservation = await newReservation.save();
    console.log("Saved reservation:", savedReservation);

    // Update user reservations
    await User.findByIdAndUpdate(req.userId, {
      $push: { reservations: newReservation._id },
    });

    // Update slot status
    await ParkingSlot.findOneAndUpdate(slot._id, { status: "occupied" });

    res.status(201).json({
      message: "Reservation created successfully.",
      data: newReservation,
    });
  } catch (err) {
    console.error("Reservation error:", err.message);
    if (err.code === 11000) {
      return res
        .status(409)
        .json({ message: "Duplicate reservation detected." });
    }
    res.status(500).json({ error: err.message });
  }
};

// Update reservation
exports.updateReservation = async (req, res) => {
  try {
    const { id } = req.params;
    // First fetch the existing reservation
    const existingReservation = await Reservation.findById(req.body._id);

    // if (!existingReservation) {
    //   return res.status(404).json({ message: "Reservation not found" });
    // }

    // Merge existing and new data
    const updateData = {
      entryDate: req.body.entryDate || existingReservation.entryDate,
      entryTime: req.body.entryTime || existingReservation.entryTime,
      exitDate: req.body.exitDate || existingReservation.exitDate,
      exitTime: req.body.exitTime || existingReservation.exitTime,
      Amount: req.body.Amount || existingReservation.Amount,
      Duration: req.body.Duration || existingReservation.Duration,
      status: req.body.status || existingReservation.status,
      vehicleType: req.body.vehicleType || existingReservation.vehicleType, // ✅ Add this
    };
    const updated = await Reservation.findByIdAndUpdate(
      req.body._id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    // If reservation has an associated invoice, update its amounts/dates

    const rate = await Rate.findOne({ vehicleType: updated.vehicleType });
    if (rate) {
      // Recalculate hours and amount if entry/exit changed
      const checkIn = new Date(`${updated.entryDate}T${updated.entryTime}`);
      const checkOut = new Date(`${updated.exitDate}T${updated.exitTime}`);
      const durationHours = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60));
      const additionalHours = Math.max(0, durationHours - 1);
      const totalAmount =
        rate.baseRate + additionalHours * rate.additionalHourRate;
      console.log("Updated invoice amounts:", {
        totalAmount,
        checkInTime: checkIn,
        checkOutTime: checkOut,
        "totalAmount.hours": durationHours,
        "totalAmount.baseRate": rate.baseRate,
        "totalAmount.additionalHourRate": rate.additionalHourRate,
      });

      await Invoice.findOneAndUpdate(
        { reservationId: updated._id },
        {
          $set: {
            checkInTime: checkIn,
            checkOutTime: checkOut,
            "totalAmount.hours": durationHours,
            "totalAmount.baseRate": rate.baseRate,
            "totalAmount.additionalHourRate": rate.additionalHourRate,
          },
        }
      );
    }

    res.json({
      message: "Reservation updated successfully",
      data: updated,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete reservation
exports.deleteReservation = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Find reservation first to get slotId
    const reservation = await Reservation.findById(id);
    if (!reservation) {
      return res.status(404).json({ message: "Reservation not found" });
    }

    const slotId = reservation.slotId; // or reservation.parkingSlotId based on your schema

    // 2. Delete the reservation
    await Reservation.findByIdAndDelete(id);

    // 3. If there is a linked invoice, cancel it
    // if (reservation.invoiceId) {
    //   await Invoice.findOneAndUpdate({ reservationId: reservation._id }, { $set: { status: 'cancelled' } });
    // }
    await Invoice.findOneAndUpdate(
      { reservationId: reservation._id },
      { $set: { status: "cancelled" } }
    );
    // 4. Update the parking slot status
    const updatedSlot = await ParkingSlot.findByIdAndUpdate(
      slotId,
      { $set: { status: "available" } },
      { new: true, runValidators: true }
    );

    res.json({
      message: "Reservation deleted successfully",
      updatedSlot,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getReservationByUser = async (req, res) => {
  try {
    const userId = req.params.userId;
    const reservations = await Reservation.find({ userId }).populate(
      "slotId",
      "slotName vehicleType"
    );

    if (!reservations || reservations.length === 0) {
      return res
        .status(404)
        .json({ message: "No reservations found for this user" });
    }

    res.status(200).json(reservations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.allusers = async (req, res) => {
  try {
    const reservations = await Reservation.find().populate({
      path: "slotId",
      model: "ParkingSlot",
      select: "slotName vehicleType",
    });

    res.status(200).json(reservations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
