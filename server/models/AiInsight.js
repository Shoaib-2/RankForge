const mongoose = require('mongoose');

const aiInsightSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  insights: {
    executiveSummary: {
      type: String,
      required: true
    },
    priorityActions: [{
      action: {
        type: String,
        required: true
      },
      impact: {
        type: String,
        enum: ['High', 'Medium', 'Low'],
        required: true
      },
      timeframe: {
        type: String,
        required: true
      },
      reasoning: {
        type: String,
        required: true
      }
    }],
    competitiveAdvantage: {
      type: String,
      required: true
    },
    expectedOutcomes: {
      shortTerm: {
        type: String,
        required: true
      },
      longTerm: {
        type: String,
        required: true
      }
    },
    industryInsights: {
      type: String,
      required: true
    },
    riskAssessment: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      required: true
    },
    generatedAt: {
      type: Date,
      default: Date.now
    },
    confidence: {
      type: Number,
      min: 0,
      max: 1,
      default: 0.7
    }
  },
  modelUsed: {
    type: String,
    default: 'gemini-1.5-pro'
  },
  tokensUsed: {
    input: {
      type: Number,
      default: 0
    },
    output: {
      type: Number,
      default: 0
    }
  },
  processingTime: {
    type: Number, // milliseconds
    default: 0
  },
  cached: {
    type: Boolean,
    default: false
  },
  userFeedback: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: {
      type: String
    },
    helpful: {
      type: Boolean
    }
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
aiInsightSchema.index({ url: 1, createdAt: -1 });
aiInsightSchema.index({ userId: 1, createdAt: -1 });
aiInsightSchema.index({ 'insights.confidence': -1 });
aiInsightSchema.index({ modelUsed: 1, createdAt: -1 });

// Instance methods
aiInsightSchema.methods.getAgeInHours = function() {
  return (Date.now() - this.createdAt.getTime()) / (1000 * 60 * 60);
};

aiInsightSchema.methods.isStale = function(maxAgeHours = 24) {
  return this.getAgeInHours() > maxAgeHours;
};

aiInsightSchema.methods.addFeedback = function(rating, comment, helpful) {
  this.userFeedback = {
    rating,
    comment,
    helpful,
    submittedAt: new Date()
  };
  return this.save();
};

// Static methods
aiInsightSchema.statics.getRecentInsights = function(userId, limit = 10) {
  return this.find({ userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .select('url insights.executiveSummary insights.confidence createdAt');
};

aiInsightSchema.statics.getInsightsByUrl = function(url, maxAgeHours = 6) {
  const cutoffTime = new Date(Date.now() - (maxAgeHours * 60 * 60 * 1000));
  
  return this.findOne({
    url,
    createdAt: { $gte: cutoffTime }
  }).sort({ createdAt: -1 });
};

aiInsightSchema.statics.getUsageStats = function(startDate, endDate) {
  const matchStage = {
    createdAt: {
      $gte: startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      $lte: endDate || new Date()
    }
  };

  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalInsights: { $sum: 1 },
        averageConfidence: { $avg: '$insights.confidence' },
        totalTokensUsed: { 
          $sum: { $add: ['$tokensUsed.input', '$tokensUsed.output'] }
        },
        averageProcessingTime: { $avg: '$processingTime' },
        uniqueUsers: { $addToSet: '$userId' },
        uniqueUrls: { $addToSet: '$url' }
      }
    },
    {
      $project: {
        totalInsights: 1,
        averageConfidence: { $round: ['$averageConfidence', 3] },
        totalTokensUsed: 1,
        averageProcessingTime: { $round: ['$averageProcessingTime', 2] },
        uniqueUserCount: { $size: '$uniqueUsers' },
        uniqueUrlCount: { $size: '$uniqueUrls' }
      }
    }
  ]);
};

aiInsightSchema.statics.getFeedbackStats = function() {
  return this.aggregate([
    { $match: { 'userFeedback.rating': { $exists: true } } },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$userFeedback.rating' },
        totalFeedback: { $sum: 1 },
        helpfulCount: {
          $sum: {
            $cond: [{ $eq: ['$userFeedback.helpful', true] }, 1, 0]
          }
        },
        ratingDistribution: {
          $push: '$userFeedback.rating'
        }
      }
    }
  ]);
};

// Pre-save middleware to estimate token usage
aiInsightSchema.pre('save', function(next) {
  if (this.isNew && !this.tokensUsed.input) {
    // Rough estimation of tokens used (1 token ≈ 4 characters)
    const inputText = JSON.stringify(this.insights);
    this.tokensUsed.input = Math.ceil(inputText.length / 4);
    this.tokensUsed.output = Math.ceil(JSON.stringify(this.insights).length / 4);
  }
  next();
});

module.exports = mongoose.model('AiInsight', aiInsightSchema);
