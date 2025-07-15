const Analytics = require('../models/Analytics');
const dashboardService = require('../services/dashboardService');
const asyncHandler = require('../utils/asyncHandler');

const analyticsController = {
  async getAnalytics(req, res) {
    try {
      const userId = req.userId;
      
      // For demo purposes, generate mock data if none exists
      let analytics = await Analytics.findOne({ userId });
      
      if (!analytics) {
        analytics = await createMockAnalytics(userId);
      }
      
      res.json(analytics);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching analytics data' });
    }
  },

  // Get performance trends over time (REAL DATA)
  getTrends: asyncHandler(async (req, res) => {
    const userId = req.userId;
    const { days = 30 } = req.query;
    
    const trends = await dashboardService.getAnalyticsTrends(userId, parseInt(days));
    
    res.json({
      success: true,
      data: trends,
      meta: {
        period: `${days} days`,
        totalDataPoints: trends.length
      }
    });
  }),

  // Get recent analyses summary (REAL DATA)
  getRecentAnalyses: asyncHandler(async (req, res) => {
    const userId = req.userId;
    const { limit = 10 } = req.query;
    
    const analyses = await dashboardService.getRecentAnalyses(userId, parseInt(limit));
    
    res.json({
      success: true,
      data: analyses,
      meta: {
        total: analyses.length,
        limit: parseInt(limit)
      }
    });
  }),

  // Get performance metrics summary (REAL DATA)
  getPerformanceMetrics: asyncHandler(async (req, res) => {
    const userId = req.userId;
    
    const metrics = await dashboardService.getPerformanceMetrics(userId);
    
    res.json({
      success: true,
      data: metrics
    });
  }),

  // Get comprehensive analytics data for dashboard (REAL DATA)
  getDashboardAnalytics: asyncHandler(async (req, res) => {
    const userId = req.userId;
    const { days = 30 } = req.query;
    
    // Get all analytics data in parallel
    const [trends, recentAnalyses, performanceMetrics] = await Promise.all([
      dashboardService.getAnalyticsTrends(userId, parseInt(days)),
      dashboardService.getRecentAnalyses(userId, 5),
      dashboardService.getPerformanceMetrics(userId)
    ]);

    // Transform trends for chart display
    const chartData = {
      seoScores: trends.map(t => ({ date: t.date, value: t.seoScore, count: t.analysisCount })),
      pageSpeedMobile: trends.map(t => ({ date: t.date, value: t.mobileScore })),
      pageSpeedDesktop: trends.map(t => ({ date: t.date, value: t.desktopScore })),
      coreWebVitals: {
        lcp: trends.map(t => ({ date: t.date, value: t.lcp })),
        fid: trends.map(t => ({ date: t.date, value: t.fid })),
        cls: trends.map(t => ({ date: t.date, value: t.cls }))
      }
    };

    res.json({
      success: true,
      data: {
        charts: chartData,
        recentAnalyses,
        performanceMetrics,
        summary: {
          totalDataPoints: trends.length,
          dateRange: {
            start: trends.length > 0 ? trends[0].date : null,
            end: trends.length > 0 ? trends[trends.length - 1].date : null
          }
        }
      }
    });
  }),

  async updateAnalytics(req, res) {
    try {
      const userId = req.userId;
      const { websiteUrl } = req.body;

      const analytics = await Analytics.findOneAndUpdate(
        { userId },
        { 
          $set: { 
            websiteUrl,
            lastUpdated: new Date()
          }
        },
        { new: true, upsert: true }
      );

      res.json(analytics);
    } catch (error) {
      res.status(500).json({ message: 'Error updating analytics' });
    }
  }
};

// Helper function to generate mock analytics data
const createMockAnalytics = async (userId) => {
  const dates = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    return date;
  });

  const mockData = {
    userId,
    websiteUrl: 'example.com',
    data: {
      pageViews: dates.map(date => ({
        date,
        count: Math.floor(Math.random() * 1000) + 100
      })),
      visitors: dates.map(date => ({
        date,
        count: Math.floor(Math.random() * 500) + 50
      })),
      searchImpressions: dates.map(date => ({
        date,
        count: Math.floor(Math.random() * 2000) + 200
      })),
      searchClicks: dates.map(date => ({
        date,
        count: Math.floor(Math.random() * 100) + 10
      }))
    }
  };

  return await Analytics.create(mockData);
};

module.exports = analyticsController;