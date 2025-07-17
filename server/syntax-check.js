// Quick syntax check for all modified files
const fs = require('fs');
const path = require('path');

console.log('🔍 Checking syntax of modified files...\n');

const filesToCheck = [
  'middleware/rateLimiter.js',
  'utils/rateLimitCleanup.js',
  'services/aiAnalysisService.js',
  'controllers/seoController.js',
  'routes/seo.js',
  'routes/keywords.js',
  'routes/admin.js',
  'models/RateLimit.js'
];

let allGood = true;

filesToCheck.forEach(file => {
  try {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
      require(filePath);
      console.log(`✅ ${file} - OK`);
    } else {
      console.log(`⚠️  ${file} - File not found`);
    }
  } catch (error) {
    console.log(`❌ ${file} - ERROR: ${error.message}`);
    allGood = false;
  }
});

console.log('\n' + '='.repeat(50));
if (allGood) {
  console.log('🎉 All files passed syntax check!');
  console.log('\n📋 Next steps:');
  console.log('1. Restart your server');
  console.log('2. Test SEO analysis to verify rate limiting works');
  console.log('3. Check that limits reset properly');
} else {
  console.log('⚠️  Some files have syntax errors. Please fix them before proceeding.');
}
console.log('='.repeat(50));
