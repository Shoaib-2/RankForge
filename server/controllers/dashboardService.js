const dashboardService = require('../services/dashboardService');

const dashboardController = {
  async getStats(req, res) {
    try {
      const userId = req.userId;
      const stats = await dashboardService.calculateStats(userId);
      res.json(stats);
    } catch (error) {
      console.error('Dashboard stats error:', error);
      res.status(500).json({ message: 'Error fetching dashboard stats' });
    }
  }
};

module.exports = dashboardController;