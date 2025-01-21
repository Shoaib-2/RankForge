const Analytics = require('../models/Analytics');

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