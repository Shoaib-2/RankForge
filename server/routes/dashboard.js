const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardService');
const authMiddleware = require('../middleware/auth');


router.use(authMiddleware);

router.get('/stats', dashboardController.getStats);

module.exports = router;