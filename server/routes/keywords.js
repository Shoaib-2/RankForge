const express = require('express');
const router = express.Router();
const keywordController = require('../controllers/keywordController');
const { authMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

router.post('/add', keywordController.addKeyword);
router.get('/list', keywordController.getKeywords);
router.put('/:keywordId/ranking', keywordController.updateKeywordRanking);
router.delete('/:keywordId', keywordController.deleteKeyword);

module.exports = router;