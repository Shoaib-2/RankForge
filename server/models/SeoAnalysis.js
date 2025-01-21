const mongoose = require('mongoose');

const recommendationSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['error', 'warning'],
    required: true
  },
  message: {
    type: String,
    required: true
  }
});

const metricSchema = new mongoose.Schema({
  value: {
    type: Number,
    required: true
  },
  score: {
    type: Number,
    required: true
  }
});

const seoAnalysisSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  url: {
    type: String,
    required: true
  },
  score: {
    type: Number,
    required: true
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
    default: Date.now
  }
});

module.exports = mongoose.model('SeoAnalysis', seoAnalysisSchema);