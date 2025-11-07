
const {validateCreateLogData} = require('../validators/vehicleLogValidators')


const validateCreateLogRequest = (req, res, next) => {

    const errors = validateCreateLogData(req.body);

    if (errors.length > 0) {
        return res.status(400).json({ message: errors[0] });
    }
    next();
};

module.exports = {
    validateCreateLogRequest
};