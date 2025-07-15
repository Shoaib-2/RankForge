const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { authMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

router.get('/data', analyticsController.getAnalytics);
router.post('/update', analyticsController.updateAnalytics);

module.exports = router;