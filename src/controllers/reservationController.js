const fs = require('fs');
const path = require('path');
const { validateReservation } = require('../validators/reservationValidator');

const filePath = path.join(__dirname, '../data/slots.json');

exports.createReservation = (req, res) => {
  const error = validateReservation(req.body);
  if (error) return res.status(400).json({ message: error });

  let slots = [];
  if (fs.existsSync(filePath)) {
    slots = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  }

  slots.push(req.body);
  fs.writeFileSync(filePath, JSON.stringify(slots, null, 2));
  res.status(200).json({ message: "Slot created successfully" });
};

exports.updateReservation = (req, res) => {
  const error = validateReservation(req.body);
  if (error) return res.status(400).json({ message: error });

  let slots = [];
  if (fs.existsSync(filePath)) {
    slots = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  }

  const index = slots.findIndex(slot => slot.slotID === req.body.slotID);
  if (index === -1) {
    return res.status(404).json({ message: "Slot not found" });
  }

  slots[index] = req.body;
  fs.writeFileSync(filePath, JSON.stringify(slots, null, 2));
  res.status(200).json({ message: "Slot updated successfully" });
};

exports.deleteReservation = (req, res) => {
  const { slotID } = req.params;

  let slots = [];
  if (fs.existsSync(filePath)) {
    slots = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  }

  const index = slots.findIndex(slot => slot.slotID === slotID);
  if (index === -1) {
    return res.status(404).json({ message: "Slot not found" });
  }

  slots.splice(index, 1);
  fs.writeFileSync(filePath, JSON.stringify(slots, null, 2));
  res.status(200).json({ message: "Slot deleted successfully" });
};

exports.allusers = (req, res) => {
  let slots = [];
  if (fs.existsSync(filePath)) {
    slots = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  }

  res.status(200).json(slots);
};
