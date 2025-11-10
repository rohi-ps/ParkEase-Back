require('dotenv').config();
const errorHandler = require('./src/middleware/errorHandler');
const express = require('express');
const helmet = require('helmet');
const passport=require('./src/config/passportconfig.js')
const morgan = require('morgan');
const cors=require('cors');
const app = express();
const connectDatabase = require('./src/config/database');

// Connect to database
connectDatabase();
app.use(passport.initialize());
// Middleware
app.use(helmet()); // Security headers
app.use(morgan('dev')); // Logging
app.use(cors({
  origin: 'http://localhost:4200' 
})); // Enable CORS
app.use(express.json()); // Body parser
app.use(express.urlencoded({ extended: true }));

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});
 
// Import routes  
const routes = require('./src/routes/userRoutes'); 
const parkingRoutes = require('./src/routes/parkingRoutes');
const billingRoutes = require('./src/routes/billingRoutes');
const reservationRoutes = require('./src/routes/reservationRoutes');
const vehicleLogRoutes=require('./src/routes/vehicleLogRoutes');

// Routes
app.use('/api', routes);//User Module
app.use('/api/parking-spots', parkingRoutes);//Parking slot Module
app.use('/api/billing', billingRoutes);//Billing Module
app.use('/api/reservations', reservationRoutes);//Reservation Module
app.use('/api/logs', vehicleLogRoutes);//Vehicle Log Module
// Error handling
app.use((req, res, next) => {
  const error = new Error('Not Found');
  error.status = 404;
  next(error);
});
app.use(errorHandler);



module.exports = app;
 

//This is some change guys