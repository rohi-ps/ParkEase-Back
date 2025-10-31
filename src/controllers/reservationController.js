const fs = require('fs');
const path = require('path');
const Reservation = require('../models/reservationModel');
const { validateReservation } = require('../validators/reservationValidator');

const filePath = path.join(__dirname, '../data/slots.json');

// Helper: Load slots.json
const loadSlots = () => {
  if (fs.existsSync(filePath)) {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  }
  return [];
};

// Helper: Save slots.json
const saveSlots = (slots) => {
  fs.writeFileSync(filePath, JSON.stringify(slots, null, 2));
};

// Create reservation
exports.createReservation = async (req, res) => {
  const error = validateReservation(req.body);
  if (error) return res.status(400).json({ message: error });

  try {
    const exists = await Reservation.findOne({ slotID: req.body.slotID });
    if (exists) return res.status(409).json({ message: "Slot already exists" });

    const newReservation = new Reservation(req.body);
    await newReservation.save();

    const slots = loadSlots();
    slots.push(req.body);
    saveSlots(slots);

    res.status(201).json({ message: "Slot created successfully", data: newReservation });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update reservation
exports.updateReservation = async (req, res) => {
  const error = validateReservation(req.body);
  if (error) return res.status(400).json({ message: error });

  try {
    const updated = await Reservation.findOneAndUpdate(
      { slotID: req.body.slotID },
      req.body,
      { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ message: "Slot not found" });

    const slots = loadSlots();
    const index = slots.findIndex(slot => slot.slotID === req.body.slotID);
    if (index !== -1) {
      slots[index] = req.body;
      saveSlots(slots);
    }

    res.json({ message: "Slot updated successfully", data: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete reservation
exports.deleteReservation = async (req, res) => {
  const { slotID } = req.params;

  try {
    const deleted = await Reservation.findOneAndDelete({ slotID });
    if (!deleted) return res.status(404).json({ message: "Slot not found" });

    const slots = loadSlots();
    const index = slots.findIndex(slot => slot.slotID === slotID);
    if (index !== -1) {
      slots.splice(index, 1);
      saveSlots(slots);
    }

    res.json({ message: "Slot deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all reservations
exports.allusers = async (req, res) => {
  try {
    const slots = loadSlots();
    res.status(200).json(slots);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};














// exports.createReservation = (req, res) => {
//   const error = validateReservation(req.body);
//   if (error) return res.status(400).json({ message: error });

//   let slots = [];
//   if (fs.existsSync(filePath)) {
//     slots = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
//   }

//   slots.push(req.body);
//   fs.writeFileSync(filePath, JSON.stringify(slots, null, 2));
//   res.status(200).json({ message: "Slot created successfully" });
// };

// exports.updateReservation = (req, res) => {
//   const error = validateReservation(req.body);
//   if (error) return res.status(400).json({ message: error });

//   let slots = [];
//   if (fs.existsSync(filePath)) {
//     slots = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
//   }

//   const index = slots.findIndex(slot => slot.slotID === req.body.slotID);
//   if (index === -1) {
//     return res.status(404).json({ message: "Slot not found" });
//   }

//   slots[index] = req.body;
//   fs.writeFileSync(filePath, JSON.stringify(slots, null, 2));
//   res.status(200).json({ message: "Slot updated successfully" });
// };

// exports.deleteReservation = (req, res) => {
//   const { slotID } = req.params;

//   let slots = [];
//   if (fs.existsSync(filePath)) {
//     slots = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
//   }

//   const index = slots.findIndex(slot => slot.slotID === slotID);
//   if (index === -1) {
//     return res.status(404).json({ message: "Slot not found" });
//   }

//   slots.splice(index, 1);
//   fs.writeFileSync(filePath, JSON.stringify(slots, null, 2));
//   res.status(200).json({ message: "Slot deleted successfully" });
// };

// exports.allusers = (req, res) => {
//   let slots = [];
//   if (fs.existsSync(filePath)) {
//     slots = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
//   }

//   res.status(200).json(slots);
// };
