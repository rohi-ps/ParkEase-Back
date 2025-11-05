const parkingSpots = require('../data/parkingData');
const ParkingSlot = require('../models/parkingModel');

// Get all parking spots
const getAllParkingSpots = async (req, res) => {
    const data1 = await ParkingSlot.find();
    res.status(200).json({
      status: 'success',
      // data: parkingSpots
      data: data1
    });
};

// Add new parking spot
const addParkingSpot = async (req, res) => {
    const newSpot1 = await ParkingSlot.create({
        slotName: req.body.slotName,
        vehicleType: req.body.vehicleType,
        status: req.body.status || 'available',
        // location: req.body.location || 'Not Specified',
    });
    

    // parkingSpots.push(newSpot1);
    res.status(201).json({
      status: 'success',
      // data: newSpot
      data: newSpot1
    });
};

// Get parking spot by ID
const getParkingSpotById = async (req, res) => {
    const spotId = req.params.id;
    // const spot = await parkingSpots.find(spot => spot.slotName === spotId);
    const spot1 = await ParkingSlot.findOne({ slotName: spotId });
    if (!spot1) {
      return res.status(404).json({
        status: 'fail',
        message: 'Parking spot not found'
      });

    }
    res.status(200).json({
      status: 'success',
      // data: spot
      data: spot1
    });
  
};

// Update parking spot status
const updateParkingSpotStatus = async (req, res) => {
    const spotId = req.params.id;
    const updatedSpot = await ParkingSlot.findOneAndUpdate({ slotName: spotId },{ status: req.body.status }, { new: true });
    if (!updatedSpot) {
      return res.status(404).json({
        status: 'fail',
        message: 'Parking spot not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: await ParkingSlot.findOne({ slotName : spotId })
    });
};

const deleteParkingSpot = async (req, res) => {
    const spotId = req.params.id;
    const deletedSpot = await ParkingSlot.findOneAndDelete({ slotName: spotId });
    if (!deletedSpot) {
      return res.status(404).json({
        status: 'fail',
        message: 'Parking spot not found'
      });
    }
    res.status(204).json({
      status: 'success',
      data: "Parking spot deleted successfully"
    });
  } 


module.exports = {
  getAllParkingSpots,
  addParkingSpot,
  getParkingSpotById,
  updateParkingSpotStatus,
  deleteParkingSpot
};

