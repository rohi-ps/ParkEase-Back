const { validateResult } = require('express-validator');
const { parkingSpotValidationSchema, parkingslotIdValidationSchema } = require('../validators/parking-validations');

const validateAddParkingSpot = [
    ...parkingSpotValidationSchema,
    (req, res, next) => {
        const errors = validateResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

const validateParkingSpotId = [
    ...parkingslotIdValidationSchema,
    (req, res, next) => {
        const errors = validateResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];
module.exports = {
    validateAddParkingSpot,
    validateParkingSpotId
};