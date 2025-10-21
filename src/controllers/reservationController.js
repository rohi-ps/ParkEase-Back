const fs = require('fs');
const path = require('path');

// File path to slots.json
const filePath = path.join(__dirname, '../data/slots.json');

// Validation helpers
const vehicleRegex = /^[A-Z]{2}\d{2}[A-Z]{2}\d{4}$/;
const isValidVehicleType = (type) => ['2W', '4W'].includes(type);

// Real date validation
const isValidDate = (dateString) => {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dateString)) return false;

  const date = new Date(dateString);
  const [year, month, day] = dateString.split('-').map(Number);

  return (
    date.getFullYear() === year &&
    date.getMonth() + 1 === month &&
    date.getDate() === day
  );
};

// Create Reservation
exports.createReservation = (req, res) => {
  const { slotID, VehicleType, vehicleNumber, EntryDate, EntryTime, ExitDate, ExitTime } = req.body;

  if (!slotID || !VehicleType || !vehicleNumber || !EntryDate || !EntryTime || !ExitDate || !ExitTime) {
    return res.status(400).json({ message: "All fields are required" });
  }

  if (!vehicleRegex.test(vehicleNumber)) {
    return res.status(400).json({ message: "Invalid vehicle number format. Use TN01AB5678" });
  }

  if (!isValidDate(EntryDate) || !isValidDate(ExitDate)) {
    return res.status(400).json({ message: "Date must be valid and in YYYY-MM-DD format" });
  }

  if (!isValidVehicleType(VehicleType)) {
    return res.status(400).json({ message: "Vehicle type must be '2W' or '4W'" });
  }

  let slots = [];
  if (fs.existsSync(filePath)) {
    const fileData = fs.readFileSync(filePath, 'utf-8');
    slots = JSON.parse(fileData);
  }

  slots.push({ slotID, VehicleType, vehicleNumber, EntryDate, EntryTime, ExitDate, ExitTime });
  fs.writeFileSync(filePath, JSON.stringify(slots, null, 2));

  res.status(200).json({ message: "Slot created successfully" });
};

// Update Reservation
exports.updateReservation = (req, res) => {
  const { slotID, VehicleType, vehicleNumber, EntryDate, EntryTime, ExitDate, ExitTime } = req.body;

  if (!slotID || !VehicleType || !vehicleNumber || !EntryDate || !EntryTime || !ExitDate || !ExitTime) {
    return res.status(400).json({ message: "All fields are required" });
  }

  if (!vehicleRegex.test(vehicleNumber)) {
    return res.status(400).json({ message: "Invalid vehicle number format. Use TN01AB5678" });
  }

  if (!isValidDate(EntryDate) || !isValidDate(ExitDate)) {
    return res.status(400).json({ message: "Date must be valid and in YYYY-MM-DD format" });
  }

  if (!isValidVehicleType(VehicleType)) {
    return res.status(400).json({ message: "Vehicle type must be '2W' or '4W'" });
  }

  let slots = [];
  if (fs.existsSync(filePath)) {
    const fileData = fs.readFileSync(filePath, 'utf-8');
    slots = JSON.parse(fileData);
  }

  const index = slots.findIndex(slot => slot.slotID === slotID);
  if (index === -1) {
    return res.status(404).json({ message: "Slot not found" });
  }

  slots[index] = { slotID, VehicleType, vehicleNumber, EntryDate, EntryTime, ExitDate, ExitTime };
  fs.writeFileSync(filePath, JSON.stringify(slots, null, 2));

  res.status(200).json({ message: "Slot updated successfully" });
};

// Delete Reservation
exports.deleteReservation = (req, res) => {
  const { slotID } = req.params;

  let slots = [];
  if (fs.existsSync(filePath)) {
    const fileData = fs.readFileSync(filePath, 'utf-8');
    slots = JSON.parse(fileData);
  }

  const index = slots.findIndex(slot => slot.slotID === slotID);
  if (index === -1) {
    return res.status(404).json({ message: "Slot not found" });
  }

  slots.splice(index, 1);
  fs.writeFileSync(filePath, JSON.stringify(slots, null, 2));

  res.status(200).json({ message: "Slot deleted successfully" });
};

// Get All Reservations
exports.allusers = (req, res) => {
  let slots = [];
  if (fs.existsSync(filePath)) {
    const fileData = fs.readFileSync(filePath, 'utf-8');
    slots = JSON.parse(fileData);
  }

  res.status(200).json(slots);
};
