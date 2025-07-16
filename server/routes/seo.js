const express = require('express');
const router = express.Router();
const seoController = require('../controllers/seoController');
const { authMiddleware } = require('../middleware/auth');
const { seoAnalysisLimiter, seoAnalysisLimiterStatusOnly } = require('../middleware/rateLimiter');
const { validationRules, handleValidationErrors } = require('../middleware/validation');

router.post('/analyze', 
  authMiddleware,
  seoAnalysisLimiter,
  validationRules.seoAnalyze,
  handleValidationErrors,
  seoController.analyzeSite
);

router.get('/history', authMiddleware, seoAnalysisLimiterStatusOnly, seoController.getAnalysisHistory);

// AI Analysis routes
router.get('/ai/availability', authMiddleware, seoController.checkAIAvailability);
router.get('/ai/usage-stats', authMiddleware, seoController.getAIUsageStats);

// Debug routes for rate limiting
router.get('/ai/rate-limit-status', authMiddleware, seoController.getRateLimitStatus);
router.post('/ai/reset-rate-limits', authMiddleware, seoController.resetRateLimits);

module.exports = router;