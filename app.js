const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const { errorHandler } = require('./src/middleware/errorHandler');
const app = express();

// Middleware
app.use(helmet()); // Security headers
app.use(morgan('dev')); // Logging
app.use(cors()); // Enable CORS
app.use(express.json()); // Body parser
app.use(express.urlencoded({ extended: true }));

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

app.get('/', (req, res) => {
    res.send('Vehicle Logs API is running!');
});

// Import routes
const parkingRoutes = require('./src/routes/parkingRoutes');
const billingRoutes = require('./src/routes/billingRoutes');
const logRoutes=require("./src/routes/logroutes");


// Routes
app.use('/api/v1/parking-spots', parkingRoutes);
app.use('/api/v1/billing', billingRoutes);
app.use('/api/logs', logRoutes);

// Error handling
app.use((req, res, next) => {
  const error = new Error('Not Found');
  error.status = 404;
  next(error);
});

app.use(errorHandler);

module.exports = app;
