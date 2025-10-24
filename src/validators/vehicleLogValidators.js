function validateCreateLogData(data) {
    const errors = [];
    const { vehicleNumber, customerName, vehicleType, slotId } = data;

    // Rule 1: All fields are required
    if (!vehicleNumber) errors.push('Vehicle number is required.');
    if (!customerName) errors.push('Customer name is required.');
    if (!vehicleType) errors.push('Vehicle type is required.');
    if (!slotId) errors.push('Slot ID is required.');

    // Rule 2: Vehicle Number Format (Example: MH12GH3456)
    const vehicleNumberRegex = /^[A-Z]{2}[0-9]{2}[A-Z]{2}[0-9]{4}$/;
    if (vehicleNumber && !vehicleNumberRegex.test(vehicleNumber)) {
        errors.push('Vehicle number must be in the format MH12GH3456.');
    }

    // Rule 3: Customer Name Length
    if (customerName && customerName.length < 3) {
        errors.push('Customer name must be at least 3 characters long.');
    }

    // Rule 4: Vehicle Type Allowed Values
    if (vehicleType && !['2W', '4W'].includes(vehicleType)) {
        errors.push('Vehicle type must be either "2W" or "4W".');
    }

    // Rule 5: Slot ID Format (Example: A-1 or C-15)
    const slotIdRegex = /^[A-Z]-\d{1,2}$/;
     if (slotId && !slotIdRegex.test(slotId)) {
         errors.push('Slot ID must be in the format like A-1 or C-15.');
     }

    return errors;
}

/**
 * Validates if an ID parameter is a positive integer.
 * Returns an error message string, or null if valid.
 */
function validateIdParam(id) {
    const numId = parseInt(id, 10); // Use radix 10
    if (isNaN(numId)) {
        return 'Log ID must be a number.';
    }
    if (numId <= 0) {
        return 'Log ID must be a positive number.';
    }
    if (!Number.isInteger(numId)) {
        return 'Log ID must be an integer.';
    }
    return null; 
}

module.exports = {
    validateCreateLogData,
    validateIdParam
};
