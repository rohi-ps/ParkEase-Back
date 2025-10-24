const fs = require('fs').promises;
const path = require('path');

// Construct the absolute path to your data file relative to the current file
const dataPath = path.join(__dirname, '../data/parkingData.json');

// --- Helper Functions to Read/Write JSON Data ---

const readData = async () => {
    try {
        // Check if the file exists before trying to read
        await fs.access(dataPath); // Throws error if file doesn't exist
        const jsonData = await fs.readFile(dataPath, 'utf8');
        if (!jsonData.trim()) {
            return [];
        }
        // Parse JSON and revive Date objects
        return JSON.parse(jsonData, (key, value) => {
            // Check if the key corresponds to a date field and the value is not null
            if ((key === 'entryTime' || key === 'exitTime') && value) {
                return new Date(value); // Convert string back to Date object
            }
            return value;
        });
    } catch (error) {
            if (error.code === 'ENOENT') {
            console.log('Data file not found');
            return [];
        }
        console.error("Error reading data file:", error);
    }
};

const writeData = async (data) => {
    try {
        const jsonString = JSON.stringify(data, null, 2); // Use 2 spaces for pretty-printing
        await fs.writeFile(dataPath, jsonString, 'utf8');
    } catch (error) {
        console.error("Error writing data file:", error);
    }
};

// --- Controller Methods ---

const getAllLogs = async (req, res, next) => { 
    try {
        const logs = await readData();
        res.status(200).json(logs);
    } catch (error) {
        res.status(500).json({ message: error.message || "Error while fetching parking logs." });
    }
};

const getLogById = async (req, res, next) => {
    try {
        const logs = await readData();
        const logId = parseInt(req.params.id);
        const log = logs.find(l => l.id === logId);

        if (!log) {
            // Use 404 for resource not found
            return res.status(404).json({ message: 'Parking log not found.' });
        }
        res.status(200).json(log);
    } catch (error) {
        
        res.status(500).json({ message: error.message || "Error while fetching parking log." });
    }
};

const createLog = async (req, res, next) => {
    const { vehicleNumber, customerName, vehicleType, slotId } = req.body;

    try {
        const logs = await readData();
        
        // --- Check for existing parked vehicle 
        const existingParked = logs.find(log => log.vehicleNumber === vehicleNumber && log.status === 'Parked');
        if (existingParked) {
             return res.status(409).json({ message: `Vehicle ${vehicleNumber} is already parked in slot ${existingParked.slotId}.` });
        }
        // Simple auto-incrementing ID based on the current highest ID
        const nextId = logs.length > 0 ? Math.max(0, ...logs.map(l => l.id)) + 1 : 1;

        const newLog = {
            id: nextId,
            vehicleNumber,
            customerName,
            vehicleType,
            slotId,
            entryTime: new Date(), // Use current server time
            exitTime: null,
            status: 'Parked'
        };

        logs.push(newLog);
        await writeData(logs); 
        
        res.status(201).json(newLog); 
    } catch (error) {
        res.status(500).json({ message: error.message || "Error while creating parking log." });
    }
};

const exitVehicle = async (req, res, next) => {
    try {
        const logs = await readData();
        const logId = parseInt(req.params.id); 
        const logIndex = logs.findIndex(l => l.id === logId);

        if (logIndex === -1) {
            return res.status(404).json({ message: 'Parking log not found.' });
        }
        
        const logToUpdate = logs[logIndex]; // Get a reference to the log

        if (logToUpdate.status === 'Completed') {
            return res.status(400).json({ message: 'Vehicle has already exited.' });
        }

        // Update the log properties
        logToUpdate.status = 'Completed';
        logToUpdate.exitTime = new Date(); // Set current server time as exit time
        
        // Save the entire updated log array back to the file
        await writeData(logs);
        res.status(200).json(logToUpdate); // Respond with the updated log
    } catch (error) {
        res.status(500).json({ message: error.message || "Error while processing vehicle exit." });
    }
};

module.exports = {
    getAllLogs,
    getLogById,
    createLog,
    exitVehicle
};

