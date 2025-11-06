const VehicleLog = require('../models/vehicleLog.model');
const ParkingSlot = require('../models/parkingModel');
const User = require('../models/Registeruser'); 

// --- GET ALL LOGS (For Admin) ---
const getAllLogs = async (req, res, next) => { 
    try {
        const logs = await VehicleLog.find({})
            // We select which fields to return: 'slotName'
            .populate('slotId', 'slotName') 
            .sort({ entryTime: -1 }); // Show newest first
        
        res.status(200).json(logs);
    } catch (error) {
        next(error); 
    }
};

// --- CREATE NEW LOG (Vehicle Enters) ---
const createLog = async (req, res, next) => {
    
    // Note: 'slotId' here is expected to be the slotName, like "A-01"
    const { vehicleNumber, vehicleType, slotId, userId } = req.body;

    try {
        // 1. Check if vehicle is already parked
        // This query now works because the 'status' field exists
        const existingParked = await VehicleLog.findOne({ vehicleNumber, status: 'Parked' });
        if (existingParked) {
             return res.status(409).json({ message: `Vehicle ${vehicleNumber} is already parked.` });
        }
        
        // 2. Find the slot in the database by its NAME
        const slot = await ParkingSlot.findOne({ _id: slotId });
        if (!slot) {
            return res.status(404).json({ message: `Slot ${slotId} not found.` });
        }
        if (slot.status !== 'available') {
             return res.status(409).json({ message: `Slot ${slot.slotName} is not available.` });
        }
        
        // 3. Check if vehicle type fits the slot
        if (vehicleType === '4W' && slot.vehicleType === '2W') {
            return res.status(400).json({ 
                message: `Cannot park a 4-Wheeler in a 2-Wheeler slot (${slot.slotName}).` 
            });
        }
        
        // 4. Create the new log
        const newLog = await VehicleLog.create({
            vehicleNumber,
            vehicleType,
            slotId: slot._id,  
            userId: userId,     
            // 'entryTime' and 'status' are handled by schema defaults
        });
        
        // 5. Update the slot's status
        slot.status = 'occupied';
        await slot.save();

        res.status(201).json(newLog); 
    } catch (error) {
         if (error.name === 'ValidationError') {
            return res.status(400).json({ message: 'Validation Error', errors: error.errors });
         }
        next(error);
    }
};

// --- COMPLETE LOG (Vehicle Exits) ---
const exitVehicleByNumber = async (req, res, next) => {
    const { vehicleNumber } = req.body;
    if (!vehicleNumber) {
        return res.status(400).json({ message: 'Vehicle number is required.' });
    }

    try {
        // 1. Find the *one* log for this vehicle that is currently 'Parked'
        // This query also works correctly now
        const logToUpdate = await VehicleLog.findOne({vehicleNumber});
        // 2. Check if we found a log
        if (!logToUpdate) {
            return res.status(404).json({ message: `No 'Parked' vehicle found with number ${vehicleNumber}.` });
        }
        
        // 3. Update the log properties
        logToUpdate.status = 'Completed'; // This line now works
        logToUpdate.exitTime = new Date();
        const updatedLog = await logToUpdate.save();
        
        // 4. Update the slot's status back to 'available'
        await ParkingSlot.findByIdAndUpdate(logToUpdate.slotId, {
            status: 'available'
        });

        res.status(200).json(updatedLog); 
    } catch (error) {
        next(error);
    }
};

// --- GET LOGS FOR LOGGED-IN USER ---
const getMyVehicleLogs = async (req, res, next) => {
    try {
        // 1. Get the LOGGED IN *CUSTOMER'S* ID from the token
        const customerUserId = req.user.id; 

        // 2. Find the user in the database
        const user = await User.findById(customerUserId);
        if (!user) {
            return res.status(401).json({ message: 'User not found.' });
        }
        
        // 3. Find logs using the robust $or query
        const logs = await VehicleLog.find({
            $or: [
                { userId: customerUserId }, // A) Find logs linked to their ID
                { vehicleNumber: { $in: user.vehicleNumbers || [] } } // B) Find logs matching their cars
            ]
        })
        .populate('slotId', 'slotName')
        .sort({ entryTime: -1 }); 

        res.status(200).json(logs);

    } catch (error) {
        next(error);
    }
};


module.exports = {
    getAllLogs,
    createLog,
    exitVehicleByNumber,
    getMyVehicleLogs
};