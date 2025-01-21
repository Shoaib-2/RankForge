const Keyword = require('../models/Keyword');
const SeoAnalysis = require('../models/SeoAnalysis');
const DashboardStats = require('../models/DashboardStats');

class DashboardService {
  async calculateStats(userId) {
    try {
      // Get keywords count and calculate average position
      const keywords = await Keyword.find({ userId });
      const keywordCount = keywords.length;
      
      // Calculate average position from all keyword rankings
      let totalPosition = 0;
      let rankingsCount = 0;
      keywords.forEach(keyword => {
        if (keyword.rankings && keyword.rankings.length > 0) {
          const latestRanking = keyword.rankings[keyword.rankings.length - 1];
          totalPosition += latestRanking.position;
          rankingsCount++;
        }
      });
      const averagePosition = rankingsCount > 0 ? totalPosition / rankingsCount : 0;

      // Get latest SEO analysis
      const latestAnalysis = await SeoAnalysis.findOne({ userId })
        .sort({ createdAt: -1 });

      // Count issues from latest analysis
      let totalIssues = 0;
      let highPriorityIssues = 0;
      if (latestAnalysis && latestAnalysis.recommendations) {
        totalIssues = latestAnalysis.recommendations.length;
        highPriorityIssues = latestAnalysis.recommendations.filter(
          rec => rec.priority === 'high'
        ).length;
      }

      // Get previous stats to calculate changes
      const previousStats = await DashboardStats.findOne({ userId })
        .sort({ lastUpdated: -1 });

      // Calculate changes
      const calculateChange = (current, previous) => {
        if (!previous) return 0;
        return ((current - previous) / previous * 100).toFixed(1);
      };

      const stats = {
        keywords: {
          count: keywordCount,
          change: previousStats ? calculateChange(keywordCount, previousStats.keywords.count) : 0
        },
        position: {
          value: averagePosition,
          change: previousStats ? calculateChange(averagePosition, previousStats.position.value) : 0
        },
        seoScore: {
          value: latestAnalysis ? latestAnalysis.score : 0,
          change: previousStats ? calculateChange(
            latestAnalysis ? latestAnalysis.score : 0,
            previousStats.seoScore.value
          ) : 0
        },
        issues: {
          count: totalIssues,
          highPriority: highPriorityIssues
        }
      };

      // Save new stats
      const dashboardStats = new DashboardStats({
        userId,
        ...stats
      });
      await dashboardStats.save();

      return stats;
    } catch (error) {
      console.error('Error calculating dashboard stats:', error);
      throw error;
    }
  }
}

module.exports = new DashboardService();