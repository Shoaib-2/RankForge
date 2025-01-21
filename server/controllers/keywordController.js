const Keyword = require('../models/Keyword');

const keywordController = {
  async addKeyword(req, res) {
    try {
      const { keyword } = req.body;
      const userId = req.userId;

      // Check if keyword already exists for this user
      const existingKeyword = await Keyword.findOne({ userId, keyword });
      if (existingKeyword) {
        return res.status(400).json({ message: 'Keyword already being tracked' });
      }

        // Generate 7 days of mock historical data
     const historicalRankings = Array.from({ length: 7 }, (_, index) => ({
            date: new Date(Date.now() - (6 - index) * 24 * 60 * 60 * 1000),
            position: Math.floor(Math.random() * 50) + 1, // Random position between 1-50
            searchVolume: Math.floor(Math.random() * 10000)
        }));

      // Create new keyword tracking
      const newKeyword = new Keyword({
        userId,
        keyword,
        rankings: historicalRankings,
        competitors: [
          {
            domain: 'competitor1.com',
            position: Math.floor(Math.random() * 10) + 1
          },
          {
            domain: 'competitor2.com',
            position: Math.floor(Math.random() * 10) + 1
          }
        ]
      });

      await newKeyword.save();
      res.status(201).json(newKeyword);
    } catch (error) {
      res.status(500).json({ message: 'Error adding keyword', error: error.message });
    }
  },

  async getKeywords(req, res) {
    try {
      const keywords = await Keyword.find({ userId: req.userId })
        .sort({ createdAt: -1 });
      res.json(keywords);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching keywords' });
    }
  },

  async updateKeywordRanking(req, res) {
    try {
      const { keywordId } = req.params;
      const { position } = req.body;

      const keyword = await Keyword.findOne({ 
        _id: keywordId, 
        userId: req.userId 
      });

      if (!keyword) {
        return res.status(404).json({ message: 'Keyword not found' });
      }

      keyword.rankings.push({
        date: new Date(),
        position,
        searchVolume: Math.floor(Math.random() * 10000)
      });

      await keyword.save();
      res.json(keyword);
    } catch (error) {
      res.status(500).json({ message: 'Error updating keyword ranking' });
    }
  },

  async deleteKeyword(req, res) {
    try {
      const { keywordId } = req.params;
      await Keyword.findOneAndDelete({ 
        _id: keywordId, 
        userId: req.userId 
      });
      res.json({ message: 'Keyword deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error deleting keyword' });
    }
  }
};

module.exports = keywordController;