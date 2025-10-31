const { checkSchema } = require('express-validator');

const parkingSpotValidationSchema = checkSchema({
    slotId: {
        in: ['body'],
        isString: {
            errorMessage: 'Slot ID must be a string'
        },
        notEmpty: {
            errorMessage: 'Slot ID is required'
        }
    },
    vehicleType: {
        in: ['body'],
        isIn: {
            options: [['2W', '4W']],
            errorMessage: 'Vehicle type must be either "2W" or "4W"'
        },
        notEmpty: {
            errorMessage: 'Vehicle type is required'
        }
    },
    status: {
        in: ['body'],
        optional: true,
        isIn: {
            options: [['available', 'occupied', 'reserved']],
            errorMessage: 'Status must be one of "available", "occupied", "reserved"'
        }
    },
    location: {
        in: ['body'],
        optional: true,
        isString: {
            errorMessage: 'Location must be a string'
        }
    }
});

const parkingslotIdValidationSchema = checkSchema({
    slotId: {
        in: ['params'],
        isString: {
            errorMessage: 'Slot ID must be a string'
        },
        notEmpty: {
            errorMessage: 'Slot ID is required'
        }
    }  
}); 



module.exports = {
    parkingSpotValidationSchema,
    parkingslotIdValidationSchema
};
