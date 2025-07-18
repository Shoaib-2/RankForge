const Keyword = require('../models/Keyword');
const SeoAnalysis = require('../models/SeoAnalysis');
const DashboardStats = require('../models/DashboardStats');
const googlePageSpeedService = require('./googlePageSpeed');

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

  async getAnalyticsTrends(userId, days = 30) {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // Get SEO analyses over time
      const analyses = await SeoAnalysis.find({
        userId,
        createdAt: { $gte: startDate, $lte: endDate }
      }).sort({ createdAt: 1 });

      // Group by date and calculate averages
      const trendsMap = new Map();
      
      analyses.forEach(analysis => {
        const dateKey = analysis.createdAt.toISOString().split('T')[0];
        if (!trendsMap.has(dateKey)) {
          trendsMap.set(dateKey, {
            date: dateKey,
            seoScores: [],
            mobileScores: [],
            desktopScores: [],
            coreWebVitals: {
              lcp: [],
              fid: [],
              cls: []
            },
            analysisCount: 0
          });
        }
        
        const dayData = trendsMap.get(dateKey);
        dayData.seoScores.push(analysis.score || 0);
        dayData.analysisCount++;

        // Extract PageSpeed data if available
        if (analysis.analysis?.technical?.pageSpeed) {
          if (analysis.analysis.technical.pageSpeed.mobile?.score) {
            dayData.mobileScores.push(analysis.analysis.technical.pageSpeed.mobile.score);
          }
          if (analysis.analysis.technical.pageSpeed.desktop?.score) {
            dayData.desktopScores.push(analysis.analysis.technical.pageSpeed.desktop.score);
          }
          
          // Core Web Vitals from mobile data
          if (analysis.analysis.technical.pageSpeed.mobile?.coreWebVitals) {
            const cwv = analysis.analysis.technical.pageSpeed.mobile.coreWebVitals;
            if (cwv.largestContentfulPaint?.value) {
              dayData.coreWebVitals.lcp.push(cwv.largestContentfulPaint.value);
            }
            if (cwv.firstInputDelay?.value) {
              dayData.coreWebVitals.fid.push(cwv.firstInputDelay.value);
            }
            if (cwv.cumulativeLayoutShift?.value) {
              dayData.coreWebVitals.cls.push(cwv.cumulativeLayoutShift.value);
            }
          }
        }
      });

      // Convert to array and calculate averages
      const trends = Array.from(trendsMap.values()).map(dayData => ({
        date: dayData.date,
        seoScore: dayData.seoScores.length > 0 
          ? Math.round(dayData.seoScores.reduce((a, b) => a + b, 0) / dayData.seoScores.length)
          : 0,
        mobileScore: dayData.mobileScores.length > 0
          ? Math.round(dayData.mobileScores.reduce((a, b) => a + b, 0) / dayData.mobileScores.length)
          : 0,
        desktopScore: dayData.desktopScores.length > 0
          ? Math.round(dayData.desktopScores.reduce((a, b) => a + b, 0) / dayData.desktopScores.length)
          : 0,
        lcp: dayData.coreWebVitals.lcp.length > 0
          ? parseFloat((dayData.coreWebVitals.lcp.reduce((a, b) => a + b, 0) / dayData.coreWebVitals.lcp.length).toFixed(2))
          : 0,
        fid: dayData.coreWebVitals.fid.length > 0
          ? parseFloat((dayData.coreWebVitals.fid.reduce((a, b) => a + b, 0) / dayData.coreWebVitals.fid.length).toFixed(2))
          : 0,
        cls: dayData.coreWebVitals.cls.length > 0
          ? parseFloat((dayData.coreWebVitals.cls.reduce((a, b) => a + b, 0) / dayData.coreWebVitals.cls.length).toFixed(2))
          : 0,
        analysisCount: dayData.analysisCount
      }));

      return trends;
    } catch (error) {
      console.error('Error getting analytics trends:', error);
      throw error;
    }
  }

  async getRecentAnalyses(userId, limit = 10) {
    try {
      const analyses = await SeoAnalysis.find({ userId })
        .sort({ createdAt: -1 })
        .limit(limit)
        .select('url score pageSpeed createdAt domain');

      return analyses.map(analysis => ({
        id: analysis._id,
        url: analysis.url,
        domain: analysis.domain,
        seoScore: analysis.score || 0,
        mobileScore: analysis.analysis?.technical?.pageSpeed?.mobile?.score || 0,
        desktopScore: analysis.analysis?.technical?.pageSpeed?.desktop?.score || 0,
        date: analysis.createdAt,
        coreWebVitals: analysis.analysis?.technical?.pageSpeed?.mobile?.coreWebVitals ? {
          lcp: analysis.analysis.technical.pageSpeed.mobile.coreWebVitals.largestContentfulPaint?.value || 0,
          fid: analysis.analysis.technical.pageSpeed.mobile.coreWebVitals.firstInputDelay?.value || 0,
          cls: analysis.analysis.technical.pageSpeed.mobile.coreWebVitals.cumulativeLayoutShift?.value || 0
        } : null
      }));
    } catch (error) {
      console.error('Error getting recent analyses:', error);
      throw error;
    }
  }

  async getPerformanceMetrics(userId) {
    try {
      // Get latest analyses for performance overview
      const recentAnalyses = await SeoAnalysis.find({ userId })
        .sort({ createdAt: -1 })
        .limit(50);

      if (recentAnalyses.length === 0) {
        return {
          averageScores: { seo: 0, mobile: 0, desktop: 0 },
          coreWebVitals: { lcp: 0, fid: 0, cls: 0 },
          totalAnalyses: 0,
          topDomains: []
        };
      }

      // Calculate averages
      let seoSum = 0, mobileSum = 0, desktopSum = 0;
      let lcpSum = 0, fidSum = 0, clsSum = 0;
      let mobileCount = 0, desktopCount = 0, cwvCount = 0;
      
      const domainCounts = new Map();

      recentAnalyses.forEach(analysis => {
        if (analysis.score) seoSum += analysis.score;
        
        if (analysis.analysis?.technical?.pageSpeed?.mobile?.score) {
          mobileSum += analysis.analysis.technical.pageSpeed.mobile.score;
          mobileCount++;
        }
        
        if (analysis.analysis?.technical?.pageSpeed?.desktop?.score) {
          desktopSum += analysis.analysis.technical.pageSpeed.desktop.score;
          desktopCount++;
        }

        // Core Web Vitals
        if (analysis.analysis?.technical?.pageSpeed?.mobile?.coreWebVitals) {
          const cwv = analysis.analysis.technical.pageSpeed.mobile.coreWebVitals;
          if (cwv.largestContentfulPaint?.value) {
            lcpSum += cwv.largestContentfulPaint.value;
            cwvCount++;
          }
          if (cwv.firstInputDelay?.value) {
            fidSum += cwv.firstInputDelay.value;
          }
          if (cwv.cumulativeLayoutShift?.value) {
            clsSum += cwv.cumulativeLayoutShift.value;
          }
        }

        // Domain tracking
        const domain = analysis.domain || new URL(analysis.url).hostname;
        domainCounts.set(domain, (domainCounts.get(domain) || 0) + 1);
      });

      const topDomains = Array.from(domainCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([domain, count]) => ({ domain, count }));

      return {
        averageScores: {
          seo: Math.round(seoSum / recentAnalyses.length),
          mobile: mobileCount > 0 ? Math.round(mobileSum / mobileCount) : 0,
          desktop: desktopCount > 0 ? Math.round(desktopSum / desktopCount) : 0
        },
        coreWebVitals: {
          lcp: cwvCount > 0 ? parseFloat((lcpSum / cwvCount).toFixed(2)) : 0,
          fid: cwvCount > 0 ? parseFloat((fidSum / cwvCount).toFixed(2)) : 0,
          cls: cwvCount > 0 ? parseFloat((clsSum / cwvCount).toFixed(3)) : 0
        },
        totalAnalyses: recentAnalyses.length,
        topDomains
      };
    } catch (error) {
      console.error('Error getting performance metrics:', error);
      throw error;
    }
  }
}

module.exports = new DashboardService();