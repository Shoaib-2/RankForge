// Test script to debug the keywordController issue
console.log('Starting keywordController test...');

try {
  console.log('1. Testing keywordController import...');
  const keywordController = require('./controllers/keywordController');
  console.log('2. keywordController imported successfully');
  console.log('3. Type of keywordController:', typeof keywordController);
  console.log('4. Keys in keywordController:', Object.keys(keywordController));
  console.log('5. addKeyword function type:', typeof keywordController.addKeyword);
  
  if (typeof keywordController.addKeyword === 'function') {
    console.log('✅ addKeyword function exists and is callable');
  } else {
    console.log('❌ addKeyword function is not available');
  }
  
} catch (error) {
  console.error('❌ Error importing keywordController:', error.message);
  console.error('Stack:', error.stack);
}
