const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  websiteUrl: String,
  data: {
    pageViews: [{
      date: Date,
      count: Number
    }],
    visitors: [{
      date: Date,
      count: Number
    }],
    searchImpressions: [{
      date: Date,
      count: Number
    }],
    searchClicks: [{
      date: Date,
      count: Number
    }]
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Analytics', analyticsSchema);