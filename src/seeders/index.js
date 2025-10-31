require('dotenv').config();
const mongoose = require('mongoose');
const seedRates = require('./rateSeeder');

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {

    });
    console.log('✓ Connected to MongoDB');

    // Run seeders
    await seedRates();

    console.log('✓ All data seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('✗ Error seeding data:', error);
    process.exit(1);
  }
}

seedDatabase();
