const mongoose = require('mongoose');

const keywordSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  keyword: {
    type: String,
    required: true
  },
  rankings: [{
    date: {
      type: Date,
      default: Date.now
    },
    position: {
      type: Number
    },
    searchVolume: {
      type: Number,
      default: 0
    }
  }],
  competitors: [{
    domain: String,
    position: Number,
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Keyword', keywordSchema);