const RateLimit = require('../models/RateLimit');
const { logger } = require('./logger');

/**
 * Cleanup utility for rate limit records
 * This ensures proper cleanup of expired records and maintains database performance
 */
class RateLimitCleanup {
  
  /**
   * Clean up old rate limit records manually (backup to MongoDB TTL)
   */
  static async cleanupExpiredRecords() {
    try {
      // Clean up records older than 25 hours (1 hour buffer beyond TTL)
      const cutoffTime = new Date();
      cutoffTime.setHours(cutoffTime.getHours() - 25);
      
      const result = await RateLimit.deleteMany({
        createdAt: { $lt: cutoffTime }
      });
      
      if (result.deletedCount > 0) {
        logger.info(`Cleaned up ${result.deletedCount} expired rate limit records`);
      }
      
      return result.deletedCount;
    } catch (error) {
      logger.error('Error cleaning up expired rate limit records:', error);
      return 0;
    }
  }

  /**
   * Get current statistics for monitoring
   */
  static async getStats() {
    try {
      const todayUTC = new Date();
      todayUTC.setUTCHours(0, 0, 0, 0);

      const [totalRecords, todayRecords, expiredRecords] = await Promise.all([
        RateLimit.countDocuments(),
        RateLimit.countDocuments({ createdAt: { $gte: todayUTC } }),
        RateLimit.countDocuments({
          createdAt: { 
            $lt: new Date(Date.now() - 25 * 60 * 60 * 1000) // 25 hours ago
          }
        })
      ]);

      return {
        total: totalRecords,
        today: todayRecords,
        expired: expiredRecords,
        cleanupRecommended: expiredRecords > 100
      };
    } catch (error) {
      logger.error('Error getting rate limit stats:', error);
      return { total: 0, today: 0, expired: 0, cleanupRecommended: false };
    }
  }

  /**
   * Force reset all rate limits (admin emergency function)
   */
  static async emergencyReset() {
    try {
      const result = await RateLimit.deleteMany({
        service: 'ai_analysis'
      });
      
      logger.warn(`Emergency reset: Deleted ${result.deletedCount} rate limit records`);
      return result.deletedCount;
    } catch (error) {
      logger.error('Error during emergency reset:', error);
      return 0;
    }
  }

  /**
   * Start automated cleanup scheduler (run every hour)
   */
  static startScheduler() {
    // Run cleanup every hour
    setInterval(async () => {
      await this.cleanupExpiredRecords();
    }, 60 * 60 * 1000); // 1 hour

    logger.info('Rate limit cleanup scheduler started (runs every hour)');
  }

  /**
   * Get detailed breakdown of rate limits by service
   */
  static async getServiceBreakdown() {
    try {
      const todayUTC = new Date();
      todayUTC.setUTCHours(0, 0, 0, 0);

      const breakdown = await RateLimit.aggregate([
        { $match: { createdAt: { $gte: todayUTC } } },
        {
          $group: {
            _id: '$service',
            count: { $sum: 1 },
            totalRequests: { $sum: '$requestCount' },
            uniqueUsers: { $addToSet: '$userId' },
            uniqueIPs: { $addToSet: '$ipAddress' }
          }
        }
      ]);

      return breakdown.map(item => ({
        service: item._id,
        records: item.count,
        totalRequests: item.totalRequests,
        uniqueUsers: item.uniqueUsers.filter(id => id).length,
        uniqueIPs: item.uniqueIPs.length
      }));
    } catch (error) {
      logger.error('Error getting service breakdown:', error);
      return [];
    }
  }
}

module.exports = RateLimitCleanup;
