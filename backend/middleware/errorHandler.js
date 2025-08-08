const errorHandler = (err, req, res, next) => {
  // Log the error for debugging purposes
  console.error('UNHANDLED ERROR:', err.stack || err);

  // If the error is one we threw on purpose (like a validation error),
  // it might already have a status code. Otherwise, default to 500.
  const statusCode = res.statusCode ? res.statusCode : 500;

  // Ensure we always send a JSON response
  res.status(statusCode).json({
    error: err.message || 'An unexpected server error occurred.',
    // In a development environment, you might want to send the stack trace
    // stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};

module.exports = errorHandler;