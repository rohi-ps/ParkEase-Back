const mongoose = require('mongoose');
 
const parkingSlotSchema = new mongoose.Schema({
    slotName: {
        type: String,
        required: [true, 'Slot ID is required'],
        unique: true,
        uppercase: true, // Optional: Force ID to be uppercase
        trim: true,
        match: [
            /^[A-Z]\d{1,2}$/,
            'Slot ID must be one letter followed by two digits (e.g., A01)'
        ]
    },
    vehicleType: {
        type: String,
        required: [true, 'Vehicle type is required'],
        enum: {
            values: ["2W", "4W"],
            message: '{VALUE} is not a valid vehicle type. Must be 2W or 4W.'
        }
    },
    status: {
        type: String,
        required: [true, 'Status is required'],
        enum: {
            values: ["available", "occupied", "reserved"],
            message: '{VALUE} is not a valid status.'
        },
        default: 'available'
    }
});
 
module.exports = mongoose.model('ParkingSlot', parkingSlotSchema);