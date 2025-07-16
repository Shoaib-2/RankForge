const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const { clearAllSEOAnalysisCache, resetUserDailyLimit } = require('../middleware/rateLimiter');

// Admin endpoint to clear all SEO analysis cache
router.post('/clear-seo-cache', authMiddleware, (req, res) => {
  try {
    const clearedCount = clearAllSEOAnalysisCache();
    res.json({
      success: true,
      message: `Successfully cleared ${clearedCount} SEO analysis cache entries`,
      clearedCount
    });
  } catch (error) {
    console.error('Error clearing SEO cache:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear SEO cache'
    });
  }
});

// Admin endpoint to reset a specific user's daily limit
router.post('/reset-user-limit', authMiddleware, (req, res) => {
  try {
    const { userId, email } = req.body;
    
    if (!userId && !email) {
      return res.status(400).json({
        success: false,
        message: 'Either userId or email is required'
      });
    }
    
    resetUserDailyLimit(userId, email);
    res.json({
      success: true,
      message: `Successfully reset daily limit for user: ${userId || email}`
    });
  } catch (error) {
    console.error('Error resetting user limit:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reset user limit'
    });
  }
});

// Admin endpoint to reset current user's daily limit
router.post('/reset-my-limit', authMiddleware, (req, res) => {
  try {
    const userId = req.userId;
    const email = req.user?.email;
    
    resetUserDailyLimit(userId, email);
    res.json({
      success: true,
      message: 'Successfully reset your daily limit'
    });
  } catch (error) {
    console.error('Error resetting user limit:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reset your limit'
    });
  }
});

module.exports = router;
