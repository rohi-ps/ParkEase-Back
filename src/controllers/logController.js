const parkingLogs  = require('../data/parkingData');

let nextId = parkingLogs.length + 1;

// @desc    Get all parking logs
// @route   GET /api/logs
const getAllLogs = (req, res) => {
    res.status(200).json(parkingLogs);
};

// @desc    Create a new vehicle entry
// @route   POST /api/logs
const createLog = (req, res) => {
    const { vehicleNumber, customerName, vehicleType, slotId } = req.body;

    // Basic validation
    if (!vehicleNumber || !customerName || !vehicleType || !slotId) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    const newLog = {
        id: nextId++,
        vehicleNumber,
        customerName,
        vehicleType,
        slotId,
        entryTime: new Date(),
        exitTime: null,
        status: 'Parked'
    };

    parkingLogs.push(newLog);
    res.status(201).json(newLog);
};

// @desc    Get a single log by ID
// @route   GET /api/logs/:id
const getLogById = (req, res) => {
    const log = parkingLogs.find(l => l.id === parseInt(req.params.id));

    if (!log) {
        return res.status(404).json({ message: 'Parking log not found.' });
    }

    res.status(200).json(log);
};

// @desc    Mark a vehicle as exited
// @route   PATCH /api/logs/:id/exit
const exitVehicle = (req, res) => {
    const logIndex = parkingLogs.findIndex(l => l.id === parseInt(req.params.id));

    if (logIndex === -1) {
        return res.status(404).json({ message: 'Parking log not found.' });
    }

    if (parkingLogs[logIndex].status === 'Completed') {
        return res.status(400).json({ message: 'Vehicle has already exited.' });
    }

    // Update the log
    parkingLogs[logIndex].status = 'Completed';
    parkingLogs[logIndex].exitTime = new Date();
    res.status(200).json(parkingLogs[logIndex]);
};

module.exports={createLog,getAllLogs,getLogById,exitVehicle};

//push