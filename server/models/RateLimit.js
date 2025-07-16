const mongoose = require('mongoose');

const rateLimitSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false,
    index: true
  },
  ipAddress: {
    type: String,
    required: true,
    index: true
  },
  requestCount: {
    type: Number,
    default: 0,
    min: 0,
    max: 10 // Daily limit
  },
  lastRequestAt: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
    expires: 86400 // Auto-delete after 24 hours
  },
  service: {
    type: String,
    default: 'ai_analysis',
    enum: ['ai_analysis', 'seo_analysis', 'general']
  },
  blocked: {
    type: Boolean,
    default: false
  },
  blockReason: {
    type: String,
    default: null
  },
  // Legacy fields for backward compatibility
  identifier: {
    type: String,
    required: false,
    index: true
  },
  type: {
    type: String,
    enum: ['email', 'ip', 'user', 'ai_analysis'],
    required: false
  },
  requests: {
    type: Number,
    default: 0
  },
  windowStart: {
    type: Date,
    default: Date.now
  },
  violations: {
    type: Number,
    default: 0
  },
  blockedUntil: {
    type: Date
  }
}, {
  timestamps: true
});

// Compound indexes for efficient lookups
rateLimitSchema.index({ userId: 1, ipAddress: 1, createdAt: -1 });
rateLimitSchema.index({ ipAddress: 1, createdAt: -1 });
rateLimitSchema.index({ service: 1, createdAt: -1 });
rateLimitSchema.index({ identifier: 1, type: 1 }); // Legacy compatibility

// Instance methods
rateLimitSchema.methods.isLimitReached = function() {
  return this.requestCount >= 10;
};

rateLimitSchema.methods.getRemainingRequests = function() {
  return Math.max(0, 10 - this.requestCount);
};

rateLimitSchema.methods.getUsagePercentage = function() {
  return Math.min(100, (this.requestCount / 10) * 100);
};

rateLimitSchema.methods.getResetTime = function() {
  const tomorrow = new Date(this.createdAt);
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
  tomorrow.setUTCHours(0, 0, 0, 0);
  return tomorrow;
};

// Static methods
rateLimitSchema.statics.getUserDailyUsage = async function(userId, ipAddress) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const usage = await this.findOne({
    $or: [
      { userId: userId },
      { ipAddress: ipAddress }
    ],
    createdAt: { $gte: today },
    service: 'ai_analysis'
  });

  return usage || {
    requestCount: 0,
    getRemainingRequests: () => 10,
    getUsagePercentage: () => 0,
    getResetTime: () => {
      const tomorrow = new Date();
      tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
      tomorrow.setUTCHours(0, 0, 0, 0);
      return tomorrow;
    }
  };
};

rateLimitSchema.statics.getGlobalDailyUsage = async function() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const result = await this.aggregate([
    { 
      $match: { 
        createdAt: { $gte: today },
        service: 'ai_analysis'
      } 
    },
    { 
      $group: { 
        _id: null, 
        totalRequests: { $sum: '$requestCount' },
        uniqueUsers: { $addToSet: '$userId' },
        uniqueIPs: { $addToSet: '$ipAddress' }
      } 
    }
  ]);

  return result.length > 0 ? result[0] : {
    totalRequests: 0,
    uniqueUsers: [],
    uniqueIPs: []
  };
};

rateLimitSchema.statics.cleanupExpired = async function() {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 2);
  
  const result = await this.deleteMany({
    createdAt: { $lt: yesterday }
  });
  
  return result.deletedCount;
};

module.exports = mongoose.model('RateLimit', rateLimitSchema);
