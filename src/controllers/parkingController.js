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
    const spot = parkingSpots.find(spot => spot.id === req.params.id);
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
    const spotIndex = parkingSpots.findIndex(spot => spot.id === req.params.id);
    if (spotIndex === -1) {
      return res.status(404).json({
        status: 'fail',
        message: 'Parking spot not found'
      });
    }

    parkingSpots[spotIndex] = {
      ...parkingSpots[spotIndex],
      isOccupied: req.body.isOccupied
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

module.exports = {
  getAllParkingSpots,
  getParkingSpotById,
  updateParkingSpotStatus
};
