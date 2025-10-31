const parkingSpots = require('../data/parkingData');

// Get all parking spots
const getAllParkingSpots = (req, res) => {
    res.status(200).json({
      status: 'success',
      data: parkingSpots
    });
};

// Add new parking spot
const addParkingSpot = (req, res) => {
    const newSpot = {
      slotId: req.body.slotId,
      vehicleType: req.body.vehicleType,
      status: req.body.status || 'available',
      location: req.body.location || 'Not Specified',
    };
    parkingSpots.push(newSpot);
    res.status(201).json({
      status: 'success',
      data: newSpot
    });
};

// Get parking spot by ID
const getParkingSpotById = (req, res) => {
    const spotId = req.params.id;
    const spot = parkingSpots.find(spot => spot.slotId === spotId);
    if (!spot) {
      return res.status(404).json({
        status: 'fail',
        message: 'Parking spot not found'
      });

    }
    res.status(200).json({
      status: 'success',
      data: spot
    });
  
};

// Update parking spot status
const updateParkingSpotStatus = (req, res) => {
    const spotId = req.params.id;
    const spotIndex = parkingSpots.findIndex(spot => spot.slotId === spotId);
    if (spotIndex === -1) {
      return res.status(404).json({
        status: 'fail',
        message: 'Parking spot not found'
      });
    }
    parkingSpots[spotIndex] = {
      ...parkingSpots[spotIndex],
      status: req.body.status || parkingSpots[spotIndex].status
    };

    res.status(200).json({
      status: 'success',
      data: parkingSpots[spotIndex]
    });
};

const deleteParkingSpot = (req, res) => {
    const spotId = req.params.id;
    const spotIndex = parkingSpots.findIndex(spot => spot.slotId === spotId);
    if (spotIndex === -1) {
      return res.status(404).json({
        status: 'fail',
        message: 'Parking spot not found'
      });
    }
    parkingSpots.splice(spotIndex, 1);
    res.status(204).json({
      status: 'success',
      data: null
    });
  } 


module.exports = {
  getAllParkingSpots,
  addParkingSpot,
  getParkingSpotById,
  updateParkingSpotStatus,
  deleteParkingSpot
};

