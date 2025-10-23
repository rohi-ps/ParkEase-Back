const { body, param } = require('express-validator');

// Validate date format and ensure it's not in the past
const isValidDate = (value) => {
  const date = new Date(value);
  if (isNaN(date.getTime())) {
    throw new Error('Invalid date format');
  }
  return true;
};

// Validate check-in and check-out time relationship
const isValidCheckOutTime = (value, { req }) => {
  const checkInTime = new Date(req.body.checkInTime);
  const checkOutTime = new Date(value);
  
  if (checkOutTime <= checkInTime) {
    throw new Error('Check-out time must be after check-in time');
  }
  return true;
};

// Validators for generating a new invoice
exports.generateInvoiceValidators = [
  body('parkingSpotId')
    .notEmpty().withMessage('Parking spot ID is required')
    .isString().withMessage('Parking spot ID must be a string'),

  body('vehicleType')
    .notEmpty().withMessage('Vehicle type is required')
    .isIn(['2W', '4W']).withMessage('Vehicle type must be either "2W" or "4W"'),

  body('checkInTime')
    .notEmpty().withMessage('Check-in time is required')
    .custom(isValidDate).withMessage('Invalid check-in time format'),

  body('checkOutTime')
    .notEmpty().withMessage('Check-out time is required')
    .custom(isValidDate).withMessage('Invalid check-out time format')
    .custom(isValidCheckOutTime).withMessage('Check-out time must be after check-in time')
];

// Validators for processing payment
exports.processPaymentValidators = [
  param('id')
    .notEmpty().withMessage('Invoice ID is required')
    .isString().withMessage('Invoice ID must be a string'),

  body('paymentMethod')
    .notEmpty().withMessage('Payment method is required')
    .isIn(['credit_card', 'debit_card', 'upi', 'net_banking', 'wallet'])
    .withMessage('Invalid payment method')
];

// Validators for getting invoice by ID
exports.getInvoiceValidators = [
  param('id')
    .notEmpty().withMessage('Invoice ID is required')
    .isString().withMessage('Invoice ID must be a string')
];
