const Rate = require('../models/rate');

function calculateDuration(checkInTime, checkOutTime) {
  const startTime = new Date(checkInTime);
  const endTime = new Date(checkOutTime);
  const durationMs = endTime - startTime;
  return Math.ceil(durationMs / (1000 * 60 * 60)); // Round up to nearest hour
}

async function calculateParkingCharges(vehicleType, checkInTime, checkOutTime) {
  // Get rate from database
  const rate = await Rate.findOne({ vehicleType });
  if (!rate) {
    throw new Error('Invalid vehicle type');
  }

  const duration = calculateDuration(checkInTime, checkOutTime);
  const additionalHours = Math.max(0, duration - 1);
  const totalAmount = rate.baseRate + (additionalHours * rate.additionalHourRate);

  return {
    duration,
    baseRate: rate.baseRate,
    additionalHourRate: rate.additionalHourRate,
    totalAmount
  };
}

const PAYMENT_METHODS = [
  'credit_card',
  'debit_card',
  'upi',
  'net_banking',
  'wallet'
];

module.exports = {
  calculateParkingCharges,
  calculateDuration,
  PAYMENT_METHODS
};
