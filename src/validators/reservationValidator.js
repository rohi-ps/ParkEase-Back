const Joi = require('joi');

const reservationSchema = Joi.object({
  slotID: Joi.string().required(),

  VehicleType: Joi.string()
    .valid('2W', '4W')
    .required(),

  vehicleNumber: Joi.string()
    .pattern(/^[A-Z]{2}\d{2}[A-Z]{2}\d{4}$/)
    .required()
    .messages({
      'string.pattern.base': 'Invalid vehicle number format. Use TN01AB5678'
    }),

  EntryDate: Joi.string()
    .pattern(/^\d{4}-\d{2}-\d{2}$/)
    .required()
    .messages({
      'string.pattern.base': 'EntryDate must be in YYYY-MM-DD format'
    }),

  EntryTime: Joi.string()
    .pattern(/^([0-1]\d|2[0-3]):([0-5]\d)$/)
    .required()
    .messages({
      'string.pattern.base': 'EntryTime must be in HH:mm format'
    }),

  ExitDate: Joi.string()
    .pattern(/^\d{4}-\d{2}-\d{2}$/)
    .required()
    .messages({
      'string.pattern.base': 'ExitDate must be in YYYY-MM-DD format'
    }),

  ExitTime: Joi.string()
    .pattern(/^([0-1]\d|2[0-3]):([0-5]\d)$/)
    .required()
    .messages({
      'string.pattern.base': 'ExitTime must be in HH:mm format'
    })
});

const validateReservation = (data) => {
  const { error } = reservationSchema.validate(data);
  if (error) return error.details[0].message;

  const entry = new Date(`${data.EntryDate}T${data.EntryTime}`);
  const exit = new Date(`${data.ExitDate}T${data.ExitTime}`);

  if (exit.getTime() <= entry.getTime()) {
    if (data.ExitDate < data.EntryDate) {
      return 'Exit date must be after entry date';
    } else if (data.ExitDate === data.EntryDate && data.ExitTime <= data.EntryTime) {
      return 'Exit time must be after entry time on the same day';
    }
  }

  return null;
};

module.exports = { validateReservation };
