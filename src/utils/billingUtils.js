const { rateCard } = require('../data/billingData');

// Calculate parking duration in hours
const calculateParkingDuration = (checkInTime, checkOutTime) => {
  const startTime = new Date(checkInTime);
  const endTime = new Date(checkOutTime);
  const durationMs = endTime - startTime;
  const durationHours = Math.ceil(durationMs / (1000 * 60 * 60)); // Round up to nearest hour
  return durationHours;
};

// Calculate parking charges based on duration and vehicle type
const calculateParkingCharges = (vehicleType, checkInTime, checkOutTime) => {
  const duration = calculateParkingDuration(checkInTime, checkOutTime);
  const rates = rateCard[vehicleType];

  if (!rates) {
    throw new Error('Invalid vehicle type');
  }

  // First hour is charged at base rate
  let totalAmount = rates.baseRate;
  
  // Additional hours are charged at additional hour rate
  if (duration > 1) {
    totalAmount += (duration - 1) * rates.additionalHourRate;
  }

  return {
    duration,
    baseRate: rates.baseRate,
    additionalHourRate: rates.additionalHourRate,
    totalAmount
  };
};

// Generate invoice number
const generateInvoiceId = () => {
  return `INV${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 1000)}`;
};

module.exports = {
  calculateParkingDuration,
  calculateParkingCharges,
  generateInvoiceId
};
