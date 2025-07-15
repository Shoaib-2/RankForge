const express = require('express');
const router = express.Router();
const keywordController = require('../controllers/keywordController');
const { authMiddleware } = require('../middleware/auth');
const { seoAnalysisLimiter } = require('../middleware/rateLimiter');

router.use(authMiddleware);

router.post('/add', seoAnalysisLimiter, keywordController.addKeyword);
router.get('/list', keywordController.getKeywords);
router.post('/suggestions', keywordController.generateKeywordSuggestions);
router.put('/:keywordId/ranking', keywordController.updateKeywordRanking);
router.put('/:keywordId/refresh', seoAnalysisLimiter, keywordController.refreshKeywordRanking);
router.delete('/:keywordId', keywordController.deleteKeyword);

module.exports = router;