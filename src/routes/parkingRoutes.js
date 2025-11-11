const express = require('express');
const router = express.Router();

const passport = require('../config/passportconfig');
const { requireRole } = require('../middleware/jwt');

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
router.get('/',
  passport.authenticate('jwt', { session: false }),
  getAllParkingSpots
);


// Add new parking spot
router.post('/', 
  passport.authenticate('jwt', { session: false }),
  requireRole('admin'),
  validateAddParkingSpot,
  addParkingSpot
);



// Get specific parking spot
router.get('/:id',
  passport.authenticate('jwt', { session: false }),
  validateParkingSpotId, 
  getParkingSpotById
);

// Update parking spot status
router.put('/:id', 
  passport.authenticate('jwt', { session: false }),
  requireRole('admin'),
  validateParkingSpotId, 
  updateParkingSpotStatus
);

// remove parking spot
router.delete('/:id', 
  passport.authenticate('jwt', { session: false }),
  requireRole('admin'),
  validateParkingSpotId, 
  deleteParkingSpot
);


module.exports = router;