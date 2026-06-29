const errorHandler = (err, req, res, next) => {
  console.error(err);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const details = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    return res.status(400).json({
      error: { code: 'VALIDATION_ERROR', message: 'Validation failed', details },
    });
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({
      error: {
        code: 'DUPLICATE_ERROR',
        message: `${field.charAt(0).toUpperCase() + field.slice(1)} already in use`,
      },
    });
  }

  // Mongoose cast error (invalid ObjectId)
  if (err.name === 'CastError') {
    return res.status(404).json({
      error: { code: 'NOT_FOUND', message: 'Resource not found' },
    });
  }

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    error: {
      code: err.code || 'INTERNAL_SERVER_ERROR',
      message: statusCode === 500 ? 'Internal server error' : err.message,
    },
  });
};

module.exports = errorHandler;
