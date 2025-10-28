const express = require('express');
const router = express.Router();
const {
  getAllParkingSpots,
  addParkingSpot,
  getParkingSpotById,
  updateParkingSpotStatus,
  deleteParkingSpot
} = require('../controllers/parkingController');

// Get all parking spots
router.get('/', getAllParkingSpots);

// Add new parking spot
router.post('/', addParkingSpot);

// Get specific parking spot
router.get('/:id', getParkingSpotById);

// Update parking spot status
router.put('/:id/status', updateParkingSpotStatus);

// remove parking spot
router.delete('/:id', deleteParkingSpot);


module.exports = router;