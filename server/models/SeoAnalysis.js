const mongoose = require('mongoose');

const recommendationSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['error', 'warning', 'info'],
    required: true,
    index: true // Add index for filtering by type
  },
  message: {
    type: String,
    required: true
  },
  priority: {
    type: Number,
    default: 1,
    min: 1,
    max: 5 // Priority scale 1-5
  }
}, { _id: false }); // Disable _id for subdocuments

const metricSchema = new mongoose.Schema({
  value: {
    type: Number,
    required: true
  },
  score: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  benchmark: {
    type: Number,
    default: null // Industry benchmark for comparison
  }
}, { _id: false });

const seoAnalysisSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true // Add index for user-based queries
  },
  url: {
    type: String,
    required: true,
    index: true // Add index for URL-based searches
  },
  domain: {
    type: String,
    required: true,
    index: true // Add index for domain-based analytics
  },
  score: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
    index: true // Add index for score-based queries
  },
  analysis: {
    meta: {
      title: String,
      description: String,
      keywords: String,
      recommendations: [recommendationSchema]
    },
    content: {
      wordCount: Number,
      headings: {
        h1: Number,
        h2: Number,
        h3: Number
      },
      images: {
        total: Number,
        withAlt: Number,
        withoutAlt: Number
      },
      paragraphs: Number,
      recommendations: [recommendationSchema]
    },
    technical: {
      pageSpeed: {
        score: Number,
        metrics: {
          firstContentfulPaint: metricSchema,
          speedIndex: metricSchema,
          largestContentfulPaint: metricSchema,
          timeToInteractive: metricSchema,
          totalBlockingTime: metricSchema,
          cumulativeLayoutShift: metricSchema
        },
        recommendations: [recommendationSchema]
      },
      mobileResponsiveness: {
        score: Number,
        isMobileFriendly: Boolean,
        issues: [String],
        recommendations: [recommendationSchema]
      }
    }
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true // Add index for date-based queries
  },
  processingTime: {
    type: Number, // Time taken to analyze in milliseconds
    default: 0
  },
  version: {
    type: String,
    default: '1.0', // API version for backward compatibility
    index: true
  }
}, {
  timestamps: true, // Automatically manage createdAt and updatedAt
  optimisticConcurrency: true
});

// Compound indexes for efficient queries
seoAnalysisSchema.index({ userId: 1, createdAt: -1 }); // User's recent analyses
seoAnalysisSchema.index({ domain: 1, createdAt: -1 }); // Domain analysis history
seoAnalysisSchema.index({ score: -1, createdAt: -1 }); // Best performing sites
seoAnalysisSchema.index({ userId: 1, url: 1 }, { unique: false }); // User-URL combination
seoAnalysisSchema.index({ 
  createdAt: 1 
}, { 
  expireAfterSeconds: 7776000 // Auto-expire after 90 days
});

// Virtual for analysis age
seoAnalysisSchema.virtual('age').get(function() {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24)); // Days
});

// Pre-save middleware to extract domain
seoAnalysisSchema.pre('save', function(next) {
  if (this.url && !this.domain) {
    try {
      const urlObj = new URL(this.url);
      this.domain = urlObj.hostname;
    } catch (error) {
      this.domain = 'unknown';
    }
  }
  next();
});

module.exports = mongoose.model('SeoAnalysis', seoAnalysisSchema);