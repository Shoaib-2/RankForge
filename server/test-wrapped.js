// Test with try-catch
try {
  const Keyword = require('./models/Keyword');
  const keywordService = require('./services/keywordService');
  const { seoAnalysisLimiter } = require('./middleware/rateLimiter');
  
  // console.log('All imports successful, creating controller...');
  
  const keywordController = {
    async addKeyword(req, res) {
      res.json({ message: 'Test addKeyword' });
    },
    
    async getKeywords(req, res) {
      res.json({ message: 'Test getKeywords' });
    }
  };
  
  // console.log('Controller created successfully');
  // console.log('Controller keys:', Object.keys(keywordController));
  module.exports = keywordController;
  
} catch (error) {
  // console.error('Error creating controller:', error.message);
  // console.error('Stack:', error.stack);
  module.exports = {};
}
