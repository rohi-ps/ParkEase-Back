
const { validateCreateLogData, validateIdParam } = require('../validators/vehicleLogValidators');

const validateCreateLogRequest = (req, res, next) => {

    const errors = validateCreateLogData(req.body);

    if (errors.length > 0) {
        return res.status(400).json({ message: errors[0] }); 
    }
    next();
};

const validateIdParameter = (req, res, next) => {
    const error = validateIdParam(req.params.id);
    if (error) {
        return res.status(400).json({ message: error });
    }
    next();
};

module.exports = {
    validateCreateLogRequest,
    validateIdParameter
};

