const express = require('express');
const router = express.Router();

const { verifyToken } = require('../middleware/jwt');


const {
  getAllParkingSpots,
  addParkingSpot,
  getParkingSpotById,
  updateParkingSpotStatus,
  deleteParkingSpot
} = require('../controllers/parkingController');

const {
    validateAddParkingSpot,
    validateParkingSpotId
} =  require('../middleware/parkingValidationMiddleware');

// Get all parking spots
router.get('/', verifyToken, getAllParkingSpots);

// Add new parking spot
router.post('/', verifyToken, validateAddParkingSpot, addParkingSpot);

// Get specific parking spot
router.get('/:id', verifyToken, validateParkingSpotId, getParkingSpotById);

// Update parking spot status
router.put('/:id/status', verifyToken, validateParkingSpotId, updateParkingSpotStatus);

// remove parking spot
router.delete('/:id', verifyToken, validateParkingSpotId, deleteParkingSpot);


module.exports = router;