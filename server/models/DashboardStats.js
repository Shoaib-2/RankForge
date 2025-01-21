const mongoose = require('mongoose');

const dashboardStatsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  keywords: {
    count: { type: Number, default: 0 },
    change: { type: Number, default: 0 }
  },
  position: {
    value: { type: Number, default: 0 },
    change: { type: Number, default: 0 }
  },
  seoScore: {
    value: { type: Number, default: 0 },
    change: { type: Number, default: 0 }
  },
  issues: {
    count: { type: Number, default: 0 },
    highPriority: { type: Number, default: 0 }
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('DashboardStats', dashboardStatsSchema);