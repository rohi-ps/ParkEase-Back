const express = require('express');
const router = express.Router();
const {
  getAllParkingSpots,
  getParkingSpotById,
  updateParkingSpotStatus,
  deleteParkingSpot
} = require('../controllers/parkingController');

// Get all parking spots
router.get('/', getAllParkingSpots);

// Get specific parking spot
router.get('/:id', getParkingSpotById);

// Update parking spot status
router.patch('/:id/status', updateParkingSpotStatus);

// remove parking spot
router.delete('/:id', deleteParkingSpot);


module.exports = router;