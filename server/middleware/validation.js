const { body, param, query, validationResult } = require('express-validator');
const validator = require('validator');

// Custom URL validator
const isValidUrl = (value) => {
  // If empty or undefined, it's valid (optional field)
  if (!value || value.trim() === '') {
    return true;
  }
  
  try {
    const url = new URL(value);
    return ['http:', 'https:'].includes(url.protocol);
  } catch {
    return false;
  }
};

// Validation rules for different endpoints
const validationRules = {
  // Auth validation
  register: [
    body('email')
      .isEmail()
      // .normalizeEmail() // Disabled to preserve original email format
      .withMessage('Please provide a valid email address'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters long')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
    body('name')
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('Name must be between 2 and 50 characters')
      .matches(/^[a-zA-Z\s]+$/)
      .withMessage('Name can only contain letters and spaces'),
    body('website')
      .optional({ checkFalsy: true }) // This will skip validation if empty string
      .custom(isValidUrl)
      .withMessage('Please provide a valid website URL')
  ],

  login: [
    body('email')
      .isEmail()
      // .normalizeEmail() // Temporarily disabled to prevent dot removal
      .withMessage('Please provide a valid email address'),
    body('password')
      .notEmpty()
      .withMessage('Password is required')
  ],

  forgotPassword: [
    body('email')
      .isEmail()
      // .normalizeEmail() // Disabled to maintain consistency
      .withMessage('Please provide a valid email address')
  ],

  // SEO analysis validation
  seoAnalyze: [
    body('url')
      .custom(isValidUrl)
      .withMessage('Please provide a valid URL (must include http:// or https://)')
      .isLength({ max: 2048 })
      .withMessage('URL is too long')
      .custom((value) => {
        // Additional security: block internal networks
        const url = new URL(value);
        const hostname = url.hostname.toLowerCase();
        
        const blockedPatterns = [
          /^localhost$/,
          /^127\./,
          /^192\.168\./,
          /^10\./,
          /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
          /^0\./,
          /^169\.254\./
        ];
        
        if (blockedPatterns.some(pattern => pattern.test(hostname))) {
          throw new Error('Internal network URLs are not allowed');
        }
        
        return true;
      })
  ],

  // Keyword tracking validation
  addKeyword: [
    body('keyword')
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Keyword must be between 1 and 100 characters'),
    body('url')
      .custom(isValidUrl)
      .withMessage('Please provide a valid URL')
  ],

  // General validation for IDs
  mongoId: [
    param('id')
      .isMongoId()
      .withMessage('Invalid ID format')
  ]
};

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map(error => ({
      field: error.path,
      message: error.msg,
      value: error.value
    }));

    console.log('Validation errors:', formattedErrors);
    console.log('Request body:', req.body);

    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: formattedErrors
    });
  }
  
  next();
};

// Security middleware for input sanitization
const sanitizeInput = (req, res, next) => {
  // Recursively sanitize all string inputs
  const sanitizeValue = (value, key = '') => {
    if (typeof value === 'string') {
      // Don't escape email fields and passwords
      const sensitiveFields = ['email', 'password', 'url'];
      if (sensitiveFields.includes(key.toLowerCase())) {
        return value.trim(); // Only trim, don't escape
      }
      
      // For other fields, remove potential XSS but be more selective
      return value.trim()
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
        .replace(/javascript:/gi, '') // Remove javascript: protocols
        .replace(/on\w+\s*=/gi, ''); // Remove event handlers
    } else if (typeof value === 'object' && value !== null) {
      for (const objKey in value) {
        if (value.hasOwnProperty(objKey)) {
          value[objKey] = sanitizeValue(value[objKey], objKey);
        }
      }
    }
    return value;
  };

  if (req.body) {
    req.body = sanitizeValue(req.body);
  }
  
  if (req.query) {
    req.query = sanitizeValue(req.query);
  }

  next();
};

module.exports = {
  validationRules,
  handleValidationErrors,
  sanitizeInput
};
