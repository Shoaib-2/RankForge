const express = require('express');
const router = express.Router();
const keywordController = require('../controllers/keywordController');
const { authMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

// Keyword routes - rate limiting now handled by aiAnalysisService in controller
router.post('/add', keywordController.addKeyword);
router.get('/list', keywordController.getKeywords);
router.post('/suggestions', keywordController.generateKeywordSuggestions);
router.put('/:keywordId/ranking', keywordController.updateKeywordRanking);
router.put('/:keywordId/refresh', keywordController.refreshKeywordRanking);
router.delete('/:keywordId', keywordController.deleteKeyword);

module.exports = router;