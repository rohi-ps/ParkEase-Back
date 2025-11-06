const { body } = require('express-validator');

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

const validateEntryExitLogic = body().custom((value) => {
  const entry = new Date(`${value.entryDate}T${value.entryTime}`);
  const exit = new Date(`${value.exitDate}T${value.exitTime}`);

  if (exit.getTime() <= entry.getTime()) {
    if (value.exitDate < value.entryDate) {
      throw new Error('Exit date must be after entry date');
    } else if (value.exitDate === value.entryDate && value.exitTime <= value.entryTime) {
      throw new Error('Exit time must be after entry time on the same day');
    }
  }

  return true;
});

exports.reservationValidators = [
  body('slotId')
    .notEmpty().withMessage('slotId is required'),

  body('vehicleType')
    .notEmpty().withMessage('vehicleType is required'),

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

  validateEntryExitLogic
];