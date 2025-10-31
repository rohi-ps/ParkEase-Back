// MongoDB connection code (commented out for now)

const mongoose = require('mongoose');

const connectDatabase = async () => {
  try {
    const connection = await mongoose.connect(process.env.MONGODB_URI, {
    });
    console.log(`MongoDB Connected: ${connection.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDatabase;


