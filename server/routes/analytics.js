const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { authMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

// Legacy routes
router.get('/data', analyticsController.getAnalytics);
router.post('/update', analyticsController.updateAnalytics);

// NEW REAL DATA ROUTES
router.get('/dashboard', analyticsController.getDashboardAnalytics);
router.get('/trends', analyticsController.getTrends);
router.get('/recent', analyticsController.getRecentAnalyses);
router.get('/performance', analyticsController.getPerformanceMetrics);

module.exports = router;