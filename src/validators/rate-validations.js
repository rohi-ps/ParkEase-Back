const { body, param } = require('express-validator');

// Validators for creating a new rate
const createRateValidators = [
  body('vehicleType')
    .isIn(['2W', '4W'])
    .withMessage('Vehicle type must be either 2W or 4W'),
  body('baseRate')
    .isNumeric()
    .withMessage('Base rate must be a number')
    .isFloat({ min: 0 })
    .withMessage('Base rate must be greater than 0'),
  body('additionalHourRate')
    .isNumeric()
    .withMessage('Additional hour rate must be a number')
    .isFloat({ min: 0 })
    .withMessage('Additional hour rate must be greater than 0')
];

// Validators for updating an existing rate
const updateRateValidators = [
  param('vehicleType')
    .isIn(['2W', '4W'])
    .withMessage('Vehicle type must be either 2W or 4W'),
  body('baseRate')
    .isNumeric()
    .withMessage('Base rate must be a number')
    .isFloat({ min: 0 })
    .withMessage('Base rate must be greater than 0'),
  body('additionalHourRate')
    .isNumeric()
    .withMessage('Additional hour rate must be a number')
    .isFloat({ min: 0 })
    .withMessage('Additional hour rate must be greater than 0')
];

module.exports = {
  createRateValidators,
  updateRateValidators
};
