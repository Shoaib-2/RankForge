const express = require('express');
const router = express.Router();
const seoController = require('../controllers/seoController');
const authMiddleware = require('../middleware/auth');

router.post('/analyze', authMiddleware, seoController.analyzeSite);
router.get('/history', authMiddleware, seoController.getAnalysisHistory);

module.exports = router;