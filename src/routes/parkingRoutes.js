const express = require('express');
const router = express.Router();

const passport = require('../config/passportconfig');
const { requireRole } = require('../middleware/jwt');

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
// router.get('/',
//   passport.authenticate('jwt', { session: false }),
//   getAllParkingSpots
// );

// // Get available parking spots


// // Add new parking spot
// router.post('/', 
//   passport.authenticate('jwt', { session: false }),
//   requireRole('admin'),
//   validateAddParkingSpot,
//   addParkingSpot
// );

// // Get specific parking spot
// router.get('/:id',
//   passport.authenticate('jwt', { session: false }),
//   validateParkingSpotId, 
//   getParkingSpotById
// );

// // Update parking spot status
// router.put('/:id/status', 
//   passport.authenticate('jwt', { session: false }),
//   requireRole('admin'),
//   validateParkingSpotId, 
//   updateParkingSpotStatus
// );

// // remove parking spot
// router.delete('/:id', 
//   passport.authenticate('jwt', { session: false }),
//   requireRole('admin'),
//   validateParkingSpotId, 
//   deleteParkingSpot
// );


router.get('/',
  getAllParkingSpots
);

// Get available parking spots
router.get('/available-slots',
  getAvailableSlots
);

// Add new parking spot
router.post('/', 
  validateAddParkingSpot,
  addParkingSpot
);

// Get specific parking spot
router.get('/:id',
  validateParkingSpotId, 
  getParkingSpotById
);

// Update parking spot status
router.put('/:id/status',
  validateParkingSpotId, 
  updateParkingSpotStatus
);

// remove parking spot
router.delete('/:id', 
  validateParkingSpotId, 
  deleteParkingSpot
);




module.exports = router;