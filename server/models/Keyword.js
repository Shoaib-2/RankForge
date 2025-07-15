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
  domain: {
    type: String,
    default: null
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
    title: String,
    url: String,
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  }],
  searchVolume: {
    type: Number,
    default: 0
  },
  difficulty: {
    type: Number,
    default: 50
  },
  lastTracked: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Keyword', keywordSchema);