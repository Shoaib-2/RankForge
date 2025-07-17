const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const aiAnalysisService = require('../services/aiAnalysisService');
const RateLimitCleanup = require('../utils/rateLimitCleanup');

// Admin endpoint to clear all SEO analysis cache (deprecated - now handled by MongoDB TTL)
router.post('/clear-seo-cache', authMiddleware, (req, res) => {
  try {
    // Since we're now using MongoDB with TTL, this is handled automatically
    res.json({
      success: true,
      message: 'SEO analysis cache is now handled by MongoDB TTL. No manual clearing needed.',
      clearedCount: 0
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
router.post('/reset-user-limit', authMiddleware, async (req, res) => {
  try {
    const { userId, email } = req.body;
    
    if (!userId && !email) {
      return res.status(400).json({
        success: false,
        message: 'Either userId or email is required'
      });
    }
    
    // Use the new MongoDB-based reset function
    const resetCount = await aiAnalysisService.resetRateLimits(userId, null);
    
    res.json({
      success: true,
      message: `Successfully reset daily limit for user: ${userId || email}`,
      resetCount
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
router.post('/reset-my-limit', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    const ipAddress = req.ip || req.connection.remoteAddress;
    
    // Use the new MongoDB-based reset function
    const resetCount = await aiAnalysisService.resetRateLimits(userId, ipAddress);
    
    res.json({
      success: true,
      message: 'Successfully reset your daily limit',
      resetCount
    });
  } catch (error) {
    console.error('Error resetting user limit:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reset your limit'
    });
  }
});

// New admin endpoints for the MongoDB-based system

// Get rate limit statistics
router.get('/rate-limit-stats', authMiddleware, async (req, res) => {
  try {
    const [stats, breakdown] = await Promise.all([
      RateLimitCleanup.getStats(),
      RateLimitCleanup.getServiceBreakdown()
    ]);
    
    res.json({
      success: true,
      stats,
      breakdown
    });
  } catch (error) {
    console.error('Error getting rate limit stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get rate limit statistics'
    });
  }
});

// Manual cleanup of expired records
router.post('/cleanup-rate-limits', authMiddleware, async (req, res) => {
  try {
    const cleanedCount = await RateLimitCleanup.cleanupExpiredRecords();
    
    res.json({
      success: true,
      message: `Cleaned up ${cleanedCount} expired rate limit records`,
      cleanedCount
    });
  } catch (error) {
    console.error('Error cleaning up rate limits:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cleanup rate limits'
    });
  }
});

// Emergency reset all rate limits
router.post('/emergency-reset', authMiddleware, async (req, res) => {
  try {
    const resetCount = await RateLimitCleanup.emergencyReset();
    
    res.json({
      success: true,
      message: `Emergency reset completed. Deleted ${resetCount} rate limit records`,
      resetCount
    });
  } catch (error) {
    console.error('Error during emergency reset:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to perform emergency reset'
    });
  }
});

module.exports = router;
