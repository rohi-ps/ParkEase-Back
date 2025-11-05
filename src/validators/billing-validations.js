const { body, param } = require('express-validator');

const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z$/;

const isValidDate = (value) => {
  if (!ISO_DATE_REGEX.test(value)) {
    return false;
  }
  const date = new Date(value);
  if (isNaN(date.getTime())) {
    return false;
  }
  return true;
};

const isValidCheckOutTime = (value, { req }) => {
  if (!isValidDate(value) || !isValidDate(req.body.checkInTime)) {
    return false;
  }
  const checkInTime = new Date(req.body.checkInTime);
  const checkOutTime = new Date(value);
  
  if (checkOutTime <= checkInTime) {
    return false;
  }
  return true;
};

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

exports.processPaymentValidators = [
  param('id')
    .notEmpty().withMessage('Invoice ID is required')
    .isString().withMessage('Invoice ID must be a string'),

  body('paymentMethod')
    .custom(value => {
      const allowedMethods = ['credit_card', 'debit_card', 'upi', 'net_banking', 'wallet'];
      return value === null || allowedMethods.includes(value);
    })
    .withMessage('Invalid payment method')
];
exports.getInvoiceValidators = [
  param('id')
    .notEmpty().withMessage('Invoice ID is required')
    .isString().withMessage('Invoice ID must be a string')
];
