const parkingSpots = require('../data/parkingData');

// Get all parking spots
const getAllParkingSpots = (req, res) => {
  try {
    res.status(200).json({
      status: 'success',
      data: parkingSpots
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error fetching parking spots'
    });
  }
};

// Get parking spot by ID
const getParkingSpotById = (req, res) => {
  try {
    const spotId = parseInt(req.params.id, 10)
    const spot = parkingSpots.find(spot => spot.id === spotId);
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
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error fetching parking spot'
    });
  }
};

// Update parking spot status
const updateParkingSpotStatus = (req, res) => {
  try {
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
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error updating parking spot'
    });
  }
};

const deleteParkingSpot = (req, res) => {
  try {
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
  } catch (error) {
    res.status(500).json({
      status: 'error',  
      message: 'Error deleting parking spot'
    });
  } 
};


module.exports = {
  getAllParkingSpots,
  getParkingSpotById,
  updateParkingSpotStatus,
  deleteParkingSpot
};
