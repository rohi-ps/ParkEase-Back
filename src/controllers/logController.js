const fs = require('fs').promises; 
const path = require('path');

// Construct the absolute path to your data file
const dataPath = path.join(__dirname, '../data/parkingData.json');

// --- Helper Functions to Read/Write JSON Data ---

const readData = async () => {
    try {
        const jsonData = await fs.readFile(dataPath, 'utf8');
        // Handle empty file case
        if (!jsonData) {
            return [];
        }
        return JSON.parse(jsonData, (key, value) => {
            if (key === 'entryTime' || key === 'exitTime') {
                return value ? new Date(value) : null;
            }
            return value;
        });
    } catch (error) {
        // If file doesn't exist, return empty array
        if (error.code === 'ENOENT') {
            return [];
        }
        // Rethrow other errors
        console.error("Error reading data file:", error);
        throw error;
    }
};

const writeData = async (data) => {
    try {
        const jsonString = JSON.stringify(data, null, 2); // Use 2 spaces for indentation
        await fs.writeFile(dataPath, jsonString, 'utf8');
    } catch (error) {
        console.error("Error writing data file:", error);
        throw error;
    }
};

const getAllLogs = async (req, res) => {
    try {
        const logs = await readData();
        res.status(200).json(logs);
    } catch (error) {
        res.status(500).json({ message: "Error reading data file." });
    }
};

const getLogById = async (req, res) => {
    try {
        const logs = await readData();
        const log = logs.find(l => l.id === parseInt(req.params.id));

        if (!log) {
            return res.status(404).json({ message: 'Parking log not found.' });
        }
        res.status(200).json(log);
    } catch (error) {
        res.status(500).json({ message: "Error reading data file." });
    }
};

const createLog = async (req, res) => {
    const { vehicleNumber, customerName, vehicleType, slotId } = req.body;

    if (!vehicleNumber || !customerName || !vehicleType || !slotId) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    try {
        const logs = await readData();
        
        // Find the highest current ID to auto-increment
        const nextId = logs.length > 0 ? Math.max(...logs.map(l => l.id)) + 1 : 1;

        const newLog = {
            id: nextId,
            vehicleNumber,
            customerName,
            vehicleType,
            slotId,
            entryTime: new Date(), 
            exitTime: null,
            status: 'Parked'
        };

        logs.push(newLog); // Add the new log to the array
        await writeData(logs); // Write the entire updated array back to the file
        
        res.status(201).json(newLog); // Respond with the newly created log
    } catch (error) {
        res.status(500).json({ message: "Error writing data file." });
    }
};

const exitVehicle = async (req, res) => {
    try {
        const logs = await readData();
        const logIndex = logs.findIndex(l => l.id === parseInt(req.params.id));

        if (logIndex === -1) {
            return res.status(404).json({ message: 'Parking log not found.' });
        }

        if (logs[logIndex].status === 'Completed') {
            return res.status(400).json({ message: 'Vehicle has already exited.' });
        }

        // Update the log in the array
        logs[logIndex].status = 'Completed';
        logs[logIndex].exitTime = new Date(); // Set current time as Date object
        
        // Write the updated array back to the file
        await writeData(logs);
        
        // Trigger the invoice generation (assuming this function is imported correctly)
        // Ensure generateInvoice can handle the log object with Date objects
        try {
            generateInvoice(logs[logIndex]); 
            console.log(`Invoice generation triggered for log ID: ${logs[logIndex].id}`);
        } catch(invoiceError) {
             console.error("Error during invoice generation:", invoiceError);
             // Decide if the main operation should still be considered successful
        }
        
        res.status(200).json(logs[logIndex]); // Respond with the updated log
    } catch (error) {
        res.status(500).json({ message: "Error reading or writing data file." });
    }
};

// --- Export the controller methods ---
module.exports = {
    getAllLogs,
    getLogById,
    createLog,
    exitVehicle
    // If you need update/delete, add them here
};

