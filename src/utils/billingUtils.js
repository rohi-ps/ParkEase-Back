const fs = require('fs').promises;
const path = require('path');

const BILLING_JSON_PATH = path.join(__dirname, '../data/billing.json');

// Read JSON file
async function readJsonFile() {
  try {
    const data = await fs.readFile(BILLING_JSON_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      // If file doesn't exist, create it with initial data
      const initialData = {
        invoices: [],
        rateCard: {
          "4W": {
            baseRate: 60,
            additionalHourRate: 40
          },
          "2W": {
            baseRate: 30,
            additionalHourRate: 20
          }
        },
        paymentMethods: [
          "credit_card",
          "debit_card",
          "upi",
          "net_banking",
          "wallet"
        ]
      };
      await writeJsonFile(initialData);
      return initialData;
    }
    console.error('Error reading JSON file:', error);
    throw new Error('Error reading data');
  }
}

// Write to JSON file
async function writeJsonFile(data) {
  try {
    await fs.writeFile(BILLING_JSON_PATH, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error('Error writing JSON file:', error);
    throw new Error('Error writing data');
  }
}

// Calculate parking duration in hours
function calculateParkingDuration(checkInTime, checkOutTime) {
  const startTime = new Date(checkInTime);
  const endTime = new Date(checkOutTime);
  const durationMs = endTime - startTime;
  const durationHours = Math.ceil(durationMs / (1000 * 60 * 60)); // Round up to nearest hour
  return durationHours;
}

// Calculate parking charges based on duration and vehicle type
async function calculateParkingCharges(vehicleType, checkInTime, checkOutTime) {
  const duration = calculateParkingDuration(checkInTime, checkOutTime);
  const data = await readJsonFile();
  const rates = data.rateCard[vehicleType];

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
}

// Generate invoice number
function generateInvoiceId() {
  return `INV${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 1000)}`;
}

module.exports = {
  readJsonFile,
  writeJsonFile,
  calculateParkingCharges,
  generateInvoiceId
};
