const errorHandler = (err, req, res, next) => {
  // Default error
  let error = {
    status: 'error',
    message: 'Something went wrong',
    errors: []
  };

  // Validation errors
  if (err.array) {
    error.status = 'fail';
    error.message = 'Validation failed';
    error.errors = err.array();
    return res.status(400).json(error);
  }

  // Other known errors
  if (err.type === 'validation') {
    error.status = 'fail';
    error.message = err.message;
    return res.status(400).json(error);
  }

  // Log unknown errors
  console.error('Error:', err);
  res.status(err.statusCode || 500).json(error);
};

module.exports = errorHandler;

