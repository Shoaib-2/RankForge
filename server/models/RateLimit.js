const mongoose = require('mongoose');

const rateLimitSchema = new mongoose.Schema({
  identifier: {
    type: String,
    required: true,
    index: true // Index for faster queries
  },
  type: {
    type: String,
    enum: ['email', 'ip', 'user'],
    required: true
  },
  requests: {
    type: Number,
    default: 0
  },
  windowStart: {
    type: Date,
    default: Date.now,
    expires: 86400 // Auto-delete after 24 hours
  },
  violations: {
    type: Number,
    default: 0
  },
  blockedUntil: {
    type: Date
  }
});

// Compound index for efficient queries
rateLimitSchema.index({ identifier: 1, type: 1 });

module.exports = mongoose.model('RateLimit', rateLimitSchema);
