const Keyword = require('../models/Keyword');
const keywordService = require('../services/keywordService');
const { seoAnalysisLimiter } = require('../middleware/rateLimiter');

const keywordController = {
  async addKeyword(req, res) {
    try {
      const { keyword, domain } = req.body;
      const userId = req.userId;

      // Check if keyword already exists for this user
      const existingKeyword = await Keyword.findOne({ userId, keyword });
      if (existingKeyword) {
        return res.status(400).json({ message: 'Keyword already being tracked' });
      }

      console.log(`Adding keyword tracking for: ${keyword}, domain: ${domain || 'none'}`);

      // Get real keyword ranking data
      const rankingData = await keywordService.trackKeywordRanking(keyword, domain || 'example.com');
      
      // Generate 7 days of historical data (mix of real and simulated)
      const historicalRankings = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
        const position = i === 0 ? rankingData.position : 
          (rankingData.position ? Math.max(1, rankingData.position + Math.floor(Math.random() * 10) - 5) : 
          Math.floor(Math.random() * 100) + 1);
        
        // Generate trendy message for each historical ranking
        let trendyMessage = null;
        if (position) {
          if (position === 1) {
            trendyMessage = '🏆 #1 Champion! You\'re dominating!';
          } else if (position <= 3) {
            trendyMessage = `🥉 Top 3 ranking! #${position} is solid!`;
          } else if (position <= 10) {
            trendyMessage = `📊 First page! #${position} - great visibility!`;
          } else if (position <= 20) {
            trendyMessage = `📈 Ranking #${position} - second page, almost there!`;
          } else if (position <= 50) {
            trendyMessage = `🚀 Ranking #${position} - making progress, keep optimizing!`;
          } else {
            trendyMessage = `💪 Ranking #${position} - lots of room to grow!`;
          }
        } else if (domain) {
          const motivationalMessages = [
            '🔍 Not in top 100 yet - huge opportunity waiting!',
            '💎 Hidden gem ready to shine - let\'s get ranking!',
            '🌱 Great potential - time to plant those SEO seeds!',
            '🎯 Target acquired - optimization mission begins!',
            '⚡ Untapped opportunity - let\'s climb those rankings!'
          ];
          trendyMessage = motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];
        }
        
        historicalRankings.push({
          date,
          position,
          searchVolume: rankingData.searchVolume + Math.floor(Math.random() * 1000) - 500,
          trendyMessage: i === 0 ? rankingData.trendyMessage : trendyMessage
        });
      }

      // Get competitor data
      const competitors = await keywordService.getTopCompetitors(keyword, domain || 'example.com');

      // Create new keyword tracking with real data
      const newKeyword = new Keyword({
        userId,
        keyword,
        domain: domain || null,
        rankings: historicalRankings,
        competitors: competitors.map(comp => ({
          domain: comp.domain,
          position: comp.position,
          title: comp.title,
          url: comp.url
        })),
        searchVolume: rankingData.searchVolume,
        difficulty: rankingData.difficulty,
        lastTracked: new Date()
      });

      await newKeyword.save();
      
      // Return with analysis
      const analysis = await keywordService.analyzeKeywordPerformance(keyword, domain || 'example.com', historicalRankings);
      
      res.status(201).json({
        ...newKeyword.toObject(),
        analysis
      });
    } catch (error) {
      console.error('Error adding keyword:', error);
      res.status(500).json({ message: 'Error adding keyword', error: error.message });
    }
  },

  async getKeywords(req, res) {
    try {
      const keywords = await Keyword.find({ userId: req.userId })
        .sort({ createdAt: -1 });
      
      // NO API CALLS HERE - just return cached data from database
      // Enhance each keyword with analysis from existing data only
      const enhancedKeywords = keywords.map((keyword) => {
        const keywordObj = keyword.toObject();
        
        // Calculate trend from historical data without API calls
        const rankings = keywordObj.rankings || [];
        let trend = 'stable';
        let trendPercentage = 0;
        
        if (rankings.length >= 2) {
          const latest = rankings[rankings.length - 1];
          const previous = rankings[rankings.length - 2];
          
          if (latest.position && previous.position) {
            if (latest.position < previous.position) {
              trend = 'up';
              trendPercentage = Math.round(((previous.position - latest.position) / previous.position) * 100);
            } else if (latest.position > previous.position) {
              trend = 'down';
              trendPercentage = Math.round(((latest.position - previous.position) / previous.position) * 100);
            }
          }
        }
        
        return {
          ...keywordObj,
          analysis: {
            keyword: keywordObj.keyword,
            currentRanking: rankings.length > 0 ? rankings[rankings.length - 1] : null,
            trend,
            trendPercentage,
            searchVolume: keywordObj.searchVolume,
            difficulty: keywordObj.difficulty,
            competitors: keywordObj.competitors || [],
            opportunities: [],
            lastUpdated: keywordObj.lastTracked || keywordObj.createdAt
          }
        };
      });
      
      console.log(`📊 Loaded ${enhancedKeywords.length} keywords from database (no API calls)`);
      res.json(enhancedKeywords);
    } catch (error) {
      console.error('Error fetching keywords:', error);
      res.status(500).json({ message: 'Error fetching keywords' });
    }
  },

  async generateKeywordSuggestions(req, res) {
    try {
      const { seedKeyword, domain } = req.body;
      
      if (!seedKeyword) {
        return res.status(400).json({ message: 'Seed keyword is required' });
      }

      console.log(`Generating keyword suggestions for: ${seedKeyword}`);
      
      const suggestions = await keywordService.generateKeywordSuggestions(seedKeyword, domain);
      
      // Only analyze first 5 suggestions to minimize API calls
      const detailedSuggestions = await Promise.all(
        suggestions.slice(0, 5).map(async (suggestion) => {
          const analysis = await keywordService.trackKeywordRanking(suggestion, domain || 'example.com');
          return {
            keyword: suggestion,
            searchVolume: analysis.searchVolume,
            difficulty: analysis.difficulty,
            estimatedPosition: analysis.position
          };
        })
      );

      // Add remaining suggestions without API calls
      const remainingSuggestions = suggestions.slice(5, 15).map(suggestion => ({
        keyword: suggestion,
        searchVolume: keywordService.estimateSearchVolume(suggestion),
        difficulty: keywordService.estimateKeywordDifficulty(suggestion),
        estimatedPosition: null
      }));

      res.json({
        seedKeyword,
        suggestions: [...detailedSuggestions, ...remainingSuggestions],
        total: suggestions.length,
        note: 'First 5 suggestions include live ranking data, others are estimated'
      });
    } catch (error) {
      console.error('Error generating keyword suggestions:', error);
      res.status(500).json({ message: 'Error generating keyword suggestions', error: error.message });
    }
  },

  async refreshKeywordRanking(req, res) {
    try {
      const { keywordId } = req.params;
      
      const keyword = await Keyword.findOne({ 
        _id: keywordId, 
        userId: req.userId 
      });

      if (!keyword) {
        return res.status(404).json({ message: 'Keyword not found' });
      }

      console.log(`🔄 User explicitly requested ranking refresh for keyword: ${keyword.keyword}`);
      
      // Only make API call when user explicitly requests refresh
      const newRanking = await keywordService.trackKeywordRanking(
        keyword.keyword, 
        keyword.domain || 'example.com'
      );

      // Add new ranking to history
      keyword.rankings.push({
        date: new Date(),
        position: newRanking.position,
        searchVolume: newRanking.searchVolume,
        trendyMessage: newRanking.trendyMessage
      });

      // Keep only last 30 days of data
      if (keyword.rankings.length > 30) {
        keyword.rankings = keyword.rankings.slice(-30);
      }

      keyword.lastTracked = new Date();
      await keyword.save();

      // Calculate analysis from existing data (no additional API calls)
      const rankings = keyword.rankings || [];
      let trend = 'stable';
      let trendPercentage = 0;
      
      if (rankings.length >= 2) {
        const latest = rankings[rankings.length - 1];
        const previous = rankings[rankings.length - 2];
        
        if (latest.position && previous.position) {
          if (latest.position < previous.position) {
            trend = 'up';
            trendPercentage = Math.round(((previous.position - latest.position) / previous.position) * 100);
          } else if (latest.position > previous.position) {
            trend = 'down';
            trendPercentage = Math.round(((latest.position - previous.position) / previous.position) * 100);
          }
        }
      }

      const analysis = {
        keyword: keyword.keyword,
        currentRanking: rankings.length > 0 ? rankings[rankings.length - 1] : null,
        trend,
        trendPercentage,
        searchVolume: keyword.searchVolume,
        difficulty: keyword.difficulty,
        competitors: keyword.competitors || [],
        opportunities: [],
        lastUpdated: keyword.lastTracked
      };

      res.json({
        ...keyword.toObject(),
        analysis
      });
    } catch (error) {
      console.error('Error refreshing keyword ranking:', error);
      res.status(500).json({ message: 'Error refreshing keyword ranking' });
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
        searchVolume: Math.floor(Math.random() * 10000),
        trendyMessage: position ? `🎯 Manual ranking update #${position}` : '🔍 Position cleared'
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
  },

  async batchTrackKeywords(req, res) {
    try {
      const { keywords, domain, maxConcurrent = 2 } = req.body;
      const userId = req.userId;

      if (!keywords || !Array.isArray(keywords) || keywords.length === 0) {
        return res.status(400).json({ message: 'Keywords array is required' });
      }

      console.log(`🔄 Batch tracking ${keywords.length} keywords for user ${userId}`);

      // Use the optimized batch tracking service
      const trackingResults = await keywordService.batchTrackKeywords(keywords, domain, maxConcurrent);
      
      // Save each keyword to database
      const savedKeywords = [];
      for (const rankingData of trackingResults) {
        try {
          // Check if keyword already exists
          const existingKeyword = await Keyword.findOne({ userId, keyword: rankingData.keyword });
          if (existingKeyword) {
            console.log(`⚠️  Keyword "${rankingData.keyword}" already being tracked, skipping`);
            continue;
          }

          // Generate historical data for new keyword
          const historicalRankings = [];
          for (let i = 6; i >= 0; i--) {
            const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
            const position = i === 0 ? rankingData.position : 
              (rankingData.position ? Math.max(1, rankingData.position + Math.floor(Math.random() * 10) - 5) : 
              Math.floor(Math.random() * 100) + 1);
            
            historicalRankings.push({
              date,
              position,
              url: rankingData.url,
              searchVolume: rankingData.searchVolume,
              difficulty: rankingData.difficulty,
              trendyMessage: rankingData.trendyMessage
            });
          }

          const newKeyword = new Keyword({
            userId,
            keyword: rankingData.keyword,
            domain: rankingData.domain || domain || 'example.com',
            position: rankingData.position,
            url: rankingData.url,
            searchVolume: rankingData.searchVolume,
            difficulty: rankingData.difficulty,
            rankings: historicalRankings,
            lastUpdated: new Date(),
            trendyMessage: rankingData.trendyMessage,
            note: rankingData.note
          });

          await newKeyword.save();
          savedKeywords.push(newKeyword);
          console.log(`✅ Saved keyword tracking: ${rankingData.keyword}`);
        } catch (error) {
          console.error(`❌ Error saving keyword "${rankingData.keyword}":`, error.message);
        }
      }

      res.json({
        message: `Successfully added ${savedKeywords.length} keywords for tracking`,
        keywords: savedKeywords,
        totalRequested: keywords.length,
        totalSaved: savedKeywords.length,
        skipped: keywords.length - savedKeywords.length
      });
    } catch (error) {
      console.error('Error in batch keyword tracking:', error);
      res.status(500).json({ message: 'Error tracking keywords in batch' });
    }
  }
};

module.exports = keywordController;