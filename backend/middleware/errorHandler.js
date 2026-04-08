// backend/middleware/errorHandler.js

// Central error handling middleware
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message    = err.message    || 'Internal Server Error';

  // MySQL duplicate entry (ER_DUP_ENTRY)
  if (err.code === 'ER_DUP_ENTRY') {
    statusCode = 400;
    message    = 'A user with that email already exists';
  }

  // JWT malformed
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message    = 'Invalid token';
  }

  // JWT expired
  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message    = 'Token has expired';
  }

  // Log in development
  if (process.env.NODE_ENV !== 'production') {
    console.error('[Error]', err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = errorHandler;
