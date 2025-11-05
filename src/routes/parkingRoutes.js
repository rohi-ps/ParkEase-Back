const express = require('express');
const router = express.Router();



const {
  getAllParkingSpots,
  getAvailableSlots,
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
router.get('/', getAllParkingSpots);

// Get available parking spots
router.get('/available-slots',getAvailableSlots);

// Add new parking spot
router.post('/', validateAddParkingSpot, addParkingSpot);

// Get specific parking spot
router.get('/:id', validateParkingSpotId, getParkingSpotById);

// Update parking spot status
router.put('/:id/status', validateParkingSpotId, updateParkingSpotStatus);

// remove parking spot
router.delete('/:id', validateParkingSpotId, deleteParkingSpot);


module.exports = router;