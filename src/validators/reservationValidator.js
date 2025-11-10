const { body } = require('express-validator');
const Reservation = require('../models/reservationModel');

const isValidVehicleNumber = value => {
  const regex = /^[A-Z]{2}\d{2}[A-Z]{2}\d{4}$/;
  if (!regex.test(value)) {
    throw new Error('Invalid vehicle number format. Use TN01AB5678');
  }
  return true;
};

const isValidDate = value => {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(value)) {
    throw new Error('Date must be in YYYY-MM-DD format');
  }
  return true;
};

const isValidTime = value => {
  const regex = /^([0-1]\d|2[0-3]):([0-5]\d)$/;
  if (!regex.test(value)) {
    throw new Error('Time must be in HH:mm format');
  }
  return true;
};

const validateEntryExitLogic = body().custom(({ req }) => {

  // Use provided values or existing values
  const finalEntryDate = req.body.entryDate 
    const finalEntryTime = req.body.entryTime 
  const finalExitDate = req.body.exitDate 
  const finalExitTime = req.body.exitTime 

  // Create Date objects for comparison
  const entry = new Date(`${finalEntryDate}T${finalEntryTime}`);
  const exit = new Date(`${finalExitDate}T${finalExitTime}`);

  if (exit <= entry) {
    throw new Error('Exit date/time must be after entry date/time');
  }

  return true;
});



exports.reservationValidators = [
  body('slotId')
    .notEmpty().withMessage('slotId is required'),
  body('vehicleNumber')
    .notEmpty().withMessage('vehicleNumber is required')
    .custom(isValidVehicleNumber),

  body('entryDate')
    .notEmpty().withMessage('entryDate is required')
    .custom(isValidDate),

  body('entryTime')
    .notEmpty().withMessage('entryTime is required')
    .custom(isValidTime),

  body('exitDate')
    .notEmpty().withMessage('exitDate is required')
    .custom(isValidDate),

  body('exitTime')
    .notEmpty().withMessage('exitTime is required')
    .custom(isValidTime),

  validateEntryExitLogic
];

const validateUpdateTiming = async (req, res, next) => {
  try {
    const { slotId } = req.params;
    const existingReservation = await Reservation.findOne({ slotId });
    
    if (!existingReservation) {
      return res.status(404).json({ message: "Reservation not found" });
    }

    // Combine existing and new values
    const finalData = {
      entryDate: req.body.entryDate || existingReservation.entryDate,
      entryTime: req.body.entryTime || existingReservation.entryTime,
      exitDate: req.body.exitDate || existingReservation.exitDate,
      exitTime: req.body.exitTime || existingReservation.exitTime
    };

    // Create Date objects for comparison
    const entry = new Date(`${finalData.entryDate}T${finalData.entryTime}`);
    const exit = new Date(`${finalData.exitDate}T${finalData.exitTime}`);
    const now = new Date();

    // Check if entry date is in the past
    if (entry < now) {
      return res.status(400).json({ 
        message: "Cannot update to a past date/time"
      });
    }

    // Check if exit is after entry
    if (exit <= entry) {
      return res.status(400).json({ 
        message: "Exit date/time must be after entry date/time"
      });
    }

    // Add a reasonable maximum duration (e.g., 30 days)
    const maxDuration = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds
    if (exit - entry > maxDuration) {
      return res.status(400).json({
        message: "Reservation duration cannot exceed 30 days"
      });
    }

    // Attach the validated data to the request
    req.validatedData = finalData;
    next();
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.updateReservationValidators = [
  body('entryDate')
    .optional()
    .custom(isValidDate),
  body('entryTime')
    .optional()
    .custom(isValidTime),
  body('exitDate')
    .optional()
    .custom(isValidDate),
  body('exitTime')
    .optional()
    .custom(isValidTime),
  //  validateEntryExitLogic,
  validateUpdateTiming
 
];