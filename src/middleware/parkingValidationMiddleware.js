const { validationResult } = require('express-validator'); // <-- CORRECTED: Changed to validationResult
const { parkingSpotValidationSchema, parkingslotIdValidationSchema } = require('../validators/parking-validations');

const validateAddParkingSpot = [
    ...parkingSpotValidationSchema,
    (req, res, next) => {
        const errors = validationResult(req); 
        if (!errors.isEmpty()) {
            return res.status(400).json({
                status: 'fail',
                message: errors.array()[0].msg
            });
        }
        next();
    }
];

const validateParkingSpotId = [
    ...parkingslotIdValidationSchema,
    (req, res, next) => {
        const errors = validationResult(req); 
        if (!errors.isEmpty()) {
            return res.status(400).json({
                status: 'fail',
                message: errors.array()[0].msg
            });
        }
        next();
    }
];
module.exports = {
    validateAddParkingSpot,
    validateParkingSpotId
};


