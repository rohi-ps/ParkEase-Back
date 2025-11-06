
function validateCreateLogData(data) {
    const errors = [];
    const { vehicleNumber, customerName, vehicleType, slotId } = data;

    if (!vehicleNumber) errors.push('Vehicle number is required.');
    if (!customerName) errors.push('Customer name is required.');
    if (!vehicleType) errors.push('Vehicle type is required.');
    if (!slotId) errors.push('Slot ID is required.');

    // ---  Vehicle Number Format (e.g., MH12GH3456) ---
    // This regex matches 2 uppercase letters, 2 digits, 2 uppercase letters, 4 digits.
    const vehicleNumberRegex = /^[A-Z]{2}[0-9]{2}[A-Z]{2}[0-9]{4}$/;
    if (vehicleNumber && !vehicleNumberRegex.test(vehicleNumber)) {
        errors.push('Vehicle number must be in the format MH12GH3456.');
    }

    if (vehicleType && !['2W', '4W'].includes(vehicleType)) {
        errors.push('Vehicle type must be either "2W" or "4W".');
    }


    return errors;
}

module.exports = {
    validateCreateLogData,
};