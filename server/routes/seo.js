const express = require('express');
const router = express.Router();
const seoController = require('../controllers/seoController');
const { authMiddleware } = require('../middleware/auth');
const { validationRules, handleValidationErrors } = require('../middleware/validation');

// SEO Analysis routes - rate limiting now handled by aiAnalysisService in controller
router.post('/analyze', 
  authMiddleware,
  validationRules.seoAnalyze,
  handleValidationErrors,
  seoController.analyzeSite
);

router.get('/history', authMiddleware, seoController.getAnalysisHistory);

// AI Analysis routes
router.get('/ai/availability', authMiddleware, seoController.checkAIAvailability);
router.get('/ai/usage-stats', authMiddleware, seoController.getAIUsageStats);
router.post('/ai/insights/:analysisId', authMiddleware, seoController.getAIInsights);

// Debug routes for rate limiting
router.get('/ai/rate-limit-status', authMiddleware, seoController.getRateLimitStatus);
router.post('/ai/reset-rate-limits', authMiddleware, seoController.resetRateLimits);

// Test endpoint to verify rate limiting fixes
router.get('/test-rate-limit', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    const ipAddress = req.ip || req.connection.remoteAddress;
    const aiAnalysisService = require('../services/aiAnalysisService');
    
    const [availability, status] = await Promise.all([
      aiAnalysisService.checkAvailability(userId, ipAddress),
      aiAnalysisService.getRateLimitStatus(userId, ipAddress)
    ]);
    
    res.json({
      success: true,
      message: 'Rate limiting system test',
      availability,
      detailedStatus: status,
      timestamp: new Date().toISOString(),
      notes: {
        rateLimit: availability.available ? 'Rate limit OK' : 'Rate limit exceeded',
        aiService: availability.available ? 'AI service available' : 'AI service unavailable',
        fallbackReady: 'Fallback insights available if AI fails'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error testing rate limiting system',
      error: error.message
    });
  }
});

// Test endpoint to simulate AI service behavior during outages
router.get('/test-ai-fallback', authMiddleware, async (req, res) => {
  try {
    const aiAnalysisService = require('../services/aiAnalysisService');
    
    // Generate a sample analysis data for testing
    const testAnalysisData = {
      url: 'https://example.com',
      score: 75,
      analysis: { meta: {}, content: {}, technical: {} },
      recommendations: []
    };
    
    // Generate fallback insights
    const fallbackInsights = aiAnalysisService.generateFallbackInsights(testAnalysisData);
    
    res.json({
      success: true,
      message: 'AI fallback system test',
      fallbackInsights,
      info: 'This shows what users get when Gemini API is unavailable (503 errors)',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error testing AI fallback system',
      error: error.message
    });
  }
});

module.exports = router;