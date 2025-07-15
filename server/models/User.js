const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    index: true // Add index for faster queries
  },
  password: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    index: true // Add index for search functionality
  },
  website: {
    type: String,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true // Add index for date-based queries
  },
  lastLogin: {
    type: Date,
    index: true // Add index for activity tracking
  },
  // API Usage Tracking
  apiUsage: {
    dailyAnalyses: {
      type: Number,
      default: 0
    },
    totalAnalyses: {
      type: Number,
      default: 0,
      index: true // Add index for usage analytics
    },
    lastResetDate: {
      type: Date,
      default: Date.now
    },
    tier: {
      type: String,
      enum: ['free', 'premium'],
      default: 'free',
      index: true // Add index for tier-based queries
    }
  },
  // Security fields
  refreshToken: {
    type: String,
    index: true // Add index for token verification
  },
  tokenVersion: {
    type: Number,
    default: 0,
    index: true // Add index for token validation
  }
}, {
  timestamps: true, // Automatically manage createdAt and updatedAt
  optimisticConcurrency: true // Enable optimistic concurrency control
});

// Compound indexes for complex queries
userSchema.index({ email: 1, tokenVersion: 1 }); // For auth verification
userSchema.index({ 'apiUsage.tier': 1, 'apiUsage.totalAnalyses': 1 }); // For usage analytics
userSchema.index({ createdAt: 1, lastLogin: 1 }); // For user activity analysis
userSchema.index({ 'apiUsage.lastResetDate': 1 }, { 
  expireAfterSeconds: 86400 * 30 // Auto-expire old usage data after 30 days
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12); // Increased salt rounds for better security
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);