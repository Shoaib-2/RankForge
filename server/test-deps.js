// Test script to debug dependencies
console.log('Testing dependencies...');

try {
  console.log('1. Testing Keyword model...');
  const Keyword = require('./models/Keyword');
  console.log('✅ Keyword model loaded successfully');
} catch (error) {
  console.error('❌ Keyword model error:', error.message);
  return;
}

try {
  console.log('2. Testing keywordService...');
  const keywordService = require('./services/keywordService');
  console.log('✅ keywordService loaded successfully');
} catch (error) {
  console.error('❌ keywordService error:', error.message);
  return;
}

try {
  console.log('3. Testing rateLimiter...');
  const { seoAnalysisLimiter } = require('./middleware/rateLimiter');
  console.log('✅ rateLimiter loaded successfully');
} catch (error) {
  console.error('❌ rateLimiter error:', error.message);
  return;
}

console.log('All dependencies loaded successfully!');
