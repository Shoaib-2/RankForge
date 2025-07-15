const mongoose = require('mongoose');

// Custom error classes
class AppError extends Error {
  constructor(message, statusCode, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.timestamp = new Date().toISOString();
    
    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends AppError {
  constructor(message, errors = []) {
    super(message, 400);
    this.errors = errors;
    this.type = 'ValidationError';
  }
}

class AuthenticationError extends AppError {
  constructor(message = 'Authentication failed') {
    super(message, 401);
    this.type = 'AuthenticationError';
  }
}

class AuthorizationError extends AppError {
  constructor(message = 'Access denied') {
    super(message, 403);
    this.type = 'AuthorizationError';
  }
}

class RateLimitError extends AppError {
  constructor(message = 'Rate limit exceeded', retryAfter = null) {
    super(message, 429);
    this.type = 'RateLimitError';
    this.retryAfter = retryAfter;
  }
}

class ExternalAPIError extends AppError {
  constructor(message, service, originalError = null) {
    super(message, 503);
    this.type = 'ExternalAPIError';
    this.service = service;
    this.originalError = originalError;
  }
}

// Error handling middleware
const errorHandler = (err, req, res, next) => {
  // Default error response
  let error = {
    success: false,
    message: err.message || 'Internal Server Error',
    timestamp: new Date().toISOString(),
    path: req.path,
    method: req.method
  };

  // Log error for monitoring
  console.error('Error occurred:', {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString(),
    userId: req.userId || 'anonymous'
  });

  // Handle different error types
  if (err instanceof ValidationError) {
    error.statusCode = 400;
    error.type = 'ValidationError';
    error.errors = err.errors;
  } 
  else if (err instanceof AuthenticationError) {
    error.statusCode = 401;
    error.type = 'AuthenticationError';
  }
  else if (err instanceof AuthorizationError) {
    error.statusCode = 403;
    error.type = 'AuthorizationError';
  }
  else if (err instanceof RateLimitError) {
    error.statusCode = 429;
    error.type = 'RateLimitError';
    if (err.retryAfter) {
      res.setHeader('Retry-After', err.retryAfter);
    }
  }
  else if (err instanceof ExternalAPIError) {
    error.statusCode = 503;
    error.type = 'ExternalAPIError';
    error.service = err.service;
    // Don't expose internal API details in production
    if (process.env.NODE_ENV !== 'production') {
      error.originalError = err.originalError;
    }
  }
  // Handle Mongoose validation errors
  else if (err instanceof mongoose.Error.ValidationError) {
    error.statusCode = 400;
    error.type = 'ValidationError';
    error.errors = Object.values(err.errors).map(e => ({
      field: e.path,
      message: e.message,
      value: e.value
    }));
  }
  // Handle Mongoose cast errors
  else if (err instanceof mongoose.Error.CastError) {
    error.statusCode = 400;
    error.type = 'CastError';
    error.message = `Invalid ${err.path}: ${err.value}`;
  }
  // Handle duplicate key errors
  else if (err.code === 11000) {
    error.statusCode = 409;
    error.type = 'DuplicateError';
    const field = Object.keys(err.keyPattern)[0];
    error.message = `${field} already exists`;
  }
  // Handle JWT errors
  else if (err.name === 'JsonWebTokenError') {
    error.statusCode = 401;
    error.type = 'AuthenticationError';
    error.message = 'Invalid token';
  }
  else if (err.name === 'TokenExpiredError') {
    error.statusCode = 401;
    error.type = 'AuthenticationError';
    error.message = 'Token expired';
  }
  // Handle operational errors
  else if (err instanceof AppError) {
    error.statusCode = err.statusCode;
    error.type = err.type || 'AppError';
  }
  // Handle programming errors (500)
  else {
    error.statusCode = 500;
    error.type = 'InternalServerError';
    
    // Don't leak error details in production
    if (process.env.NODE_ENV === 'production') {
      error.message = 'Something went wrong!';
      delete error.stack;
    } else {
      error.stack = err.stack;
    }
  }

  // Send error response
  res.status(error.statusCode || 500).json(error);
};

// 404 handler for unmatched routes
const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    type: 'NotFoundError',
    timestamp: new Date().toISOString()
  });
};

// Async error wrapper to catch async errors
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = {
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  RateLimitError,
  ExternalAPIError,
  errorHandler,
  notFoundHandler,
  asyncHandler
};
