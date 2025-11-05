const mongoose = require('mongoose');
const Rate = require('../models/rate');
const defaultRates = [
  {
    vehicleType: '2W',
    baseRate: 30,
    additionalHourRate: 20
  },
  {
    vehicleType: '4W',
    baseRate: 60,
    additionalHourRate: 40
  }
];

async function seedRates() {
  try {
    // Clean existing rates
    await Rate.deleteMany({});
    
    // Insert default rates
    await Rate.insertMany(defaultRates);
    
    console.log('✓ Rates seeded successfully');
  } catch (error) {
    console.error('✗ Error seeding rates:', error);
    throw error;
  }
}

module.exports = seedRates;
