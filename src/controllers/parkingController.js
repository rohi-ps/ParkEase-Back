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
      id: parkingSpots.length + 1,
      vehicleNumber: req.body.vehicleNumber,
      customerName: req.body.customerName,
      vehicleType: req.body.vehicleType,
      slotId: req.body.slotId,
      entryTime: new Date(), // 2 hours ago
      exitTime: null,
      status: req.body.status || 'available'
    };
    parkingSpots.push(newSpot);
    res.status(201).json({
      status: 'success',
      data: newSpot
    });
};

// Get parking spot by ID
const getParkingSpotById = (req, res,next) => {
    const spotId = parseInt(req.params.id, 10)
    const spot = parkingSpots.find(spot => spot.id === spotId);
    if (!spot) {
      return res.status(404).json({
        status: 'fail',
        message: 'Parking spot not found'
      });
      // const error = new Error('Parking spot not found');
      // error.statusCode = 500;
      // return next(error);
    }
    res.status(200).json({
      status: 'success',
      data: spots
    });
  
};

// Update parking spot status
const updateParkingSpotStatus = (req, res) => {
    const spotId = parseInt(req.params.id, 10)
    const spotIndex = parkingSpots.findIndex(spot => spot.id === spotId);
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
    const spotId = parseInt(req.params.id, 10)
    const spotIndex = parkingSpots.findIndex(spot => spot.id === spotId);
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

