// Test script to verify rate limiting fixes
// Run this with: node test-rate-limits.js

const mongoose = require('mongoose');
const RateLimit = require('./models/RateLimit');
const aiAnalysisService = require('./services/aiAnalysisService');
require('dotenv').config();

async function testRateLimiting() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    // console.log('Connected to MongoDB');

    const testUserId = new mongoose.Types.ObjectId();
    const testIP = '127.0.0.1';

    // console.log('\n=== Testing Rate Limiting System ===');
    
    // Test 1: Check initial availability
    // console.log('\n1. Checking initial availability...');
    const initialAvailability = await aiAnalysisService.checkAvailability(testUserId, testIP);
    // console.log('Initial availability:', initialAvailability);

    // Test 2: Increment usage
    // console.log('\n2. Testing usage increment...');
    await aiAnalysisService.incrementUsage(testUserId, testIP);
    const afterIncrement = await aiAnalysisService.checkAvailability(testUserId, testIP);
    // console.log('After one use:', afterIncrement);

    // Test 3: Get rate limit status
    // console.log('\n3. Getting detailed rate limit status...');
    const status = await aiAnalysisService.getRateLimitStatus(testUserId, testIP);
    // console.log('Detailed status:', JSON.stringify(status, null, 2));

    // Test 4: Test UTC timing
    // console.log('\n4. Testing UTC boundary calculation...');
    const todayUTC = new Date();
    todayUTC.setUTCHours(0, 0, 0, 0);
    console.log('Today UTC boundary:', todayUTC.toISOString());
    console.log('Next reset time:', aiAnalysisService.getNextResetTime());

    // Test 5: Check MongoDB records
    // console.log('\n5. Checking MongoDB records...');
    const records = await RateLimit.find({
      $or: [{ userId: testUserId }, { ipAddress: testIP }],
      service: 'ai_analysis'
    });
    // console.log('Rate limit records:', records.map(r => ({
    //   userId: r.userId,
    //   ipAddress: r.ipAddress,
    //   requestCount: r.requestCount,
    //   createdAt: r.createdAt.toISOString(),
    //   service: r.service
    // })));

    // Cleanup test data
    // console.log('\n6. Cleaning up test data...');
    const resetCount = await aiAnalysisService.resetRateLimits(testUserId, testIP);
    // console.log(`Cleaned up ${resetCount} test records`);

    // console.log('\n✅ Rate limiting test completed successfully!');
    
  } catch (error) {
    // console.error('❌ Error during rate limiting test:', error);
  } finally {
    await mongoose.disconnect();
    // console.log('Disconnected from MongoDB');
  }
}

// Run the test
testRateLimiting();
