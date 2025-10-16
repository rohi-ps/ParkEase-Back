const cspmiddleware=require('./src/middleware/cspmiddleware')
const csrfmiddleware=require('./src/middleware/csrfmiddleware')
const errorHandler = require('./src/middleware/errorHandler');
const logger = require('./src/middleware/logger');
const routes = require('./src/routes/userRoutes'); 
const express = require('express');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(logger)
app.use(cspmiddleware);
app.use(csrfmiddleware);
app.use(errorHandler);
app.use('/api', routes);

module.exports = app;
