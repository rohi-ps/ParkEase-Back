const errorHandler = (err, req, res, next) => {
  // Default error response
  const errorResponse = {
    status: 'error',
    message: 'Something went wrong',
    errors: []
  };

  // Handle express-validator errors
  if (typeof err.array === 'function') {
    return res.status(400).json({
      status: 'fail',
      message: 'Validation failed',
      errors: err.array()
    });
  }

  // Handle custom validation errors
  if (err.type === 'validation') {
    return res.status(400).json({
      status: 'fail',
      message: err.message,
      errors: err.errors || []
    });
  }

  // Handle known application errors
  if (err.statusCode && err.message) {
    return res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
      errors: err.errors || []
    });
  }

  // Log and respond to unknown errors
  console.error('Unhandled Error:', err);
  return res.status(500).json(errorResponse);
};

module.exports = errorHandler;