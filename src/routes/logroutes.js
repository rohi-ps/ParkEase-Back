const { protectRoute } = require('../middleware/authMiddleware.js');
const express = require('express');
const { getAllLogs,createLog,getLogById,exitVehicle } = require('../controllers/logcontroller.js');

const router = express.Router();

// This middleware will be applied to all routes in this file,
// simulating that a user must be authenticated.
router.use(protectRoute);

// Route to get all logs and create a new one
router.route('/')
    .get(getAllLogs)
    .post(createLog);

// Route to get a single log by its ID
router.route('/:id')
    .get(getLogById);

// Route to mark a vehicle as exited
router.route('/:id/exit')
    .patch(exitVehicle);

module.exports=router;