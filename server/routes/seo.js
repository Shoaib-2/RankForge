const express = require('express');
const router = express.Router();
const seoController = require('../controllers/seoController');
const { authMiddleware } = require('../middleware/auth');
const { seoAnalysisLimiter } = require('../middleware/rateLimiter');
const { validationRules, handleValidationErrors } = require('../middleware/validation');

router.post('/analyze', 
  authMiddleware,
  seoAnalysisLimiter,
  validationRules.seoAnalyze,
  handleValidationErrors,
  seoController.analyzeSite
);

router.get('/history', authMiddleware, seoController.getAnalysisHistory);

module.exports = router;