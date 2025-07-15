const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authLimiter, emailRateLimiter } = require('../middleware/rateLimiter');
const { validationRules, handleValidationErrors } = require('../middleware/validation');
const { authMiddleware } = require('../middleware/auth');

// Debug middleware for auth routes
router.use((req, res, next) => {
  console.log(`AUTH ROUTE: ${req.method} ${req.path}`);
  console.log('Request body:', req.body);
  next();
});

// Simple test endpoint
router.get('/test', (req, res) => {
  console.log('Test endpoint hit!');
  res.json({ message: 'Auth routes are working!' });
});

// Apply rate limiting to all auth routes
router.use(authLimiter);

router.post('/register', 
  emailRateLimiter,
  validationRules.register,
  handleValidationErrors,
  authController.register
);

router.post('/login', 
  emailRateLimiter,
  validationRules.login,
  handleValidationErrors,
  authController.login
);

router.post('/refresh-token',
  authController.refreshToken
);

router.post('/logout',
  authMiddleware,
  authController.logout
);

router.post('/forgot-password', 
  emailRateLimiter,
  validationRules.forgotPassword,
  handleValidationErrors,
  authController.forgotPassword
);

module.exports = router;