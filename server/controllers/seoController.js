const SeoAnalysis = require('../models/SeoAnalysis');
const seoAnalyzer = require('../services/seoAnalyzer');
const aiAnalysisService = require('../services/aiAnalysisService');


const seoController = {
  async analyzeSite(req, res) {
    try {
      const { url } = req.body;
      const userId = req.userId;
      const ipAddress = req.ip || req.connection.remoteAddress;

      if (!url) {
        return res.status(400).json({
          success: false,
          message: 'URL is required'
        });
      }

      // Check rate limit availability first
      const availability = await aiAnalysisService.checkAvailability(userId, ipAddress);
      
      if (!availability.available) {
        return res.status(429).json({
          success: false,
          message: availability.reason,
          limit: 10,
          remaining: availability.remainingRequests || 0,
          resetTime: availability.resetTime
        });
      }

      // Get complete analysis
      const analysisResults = await seoAnalyzer.analyzeContent(url);
      
      // Debug: Log the PageSpeed structure
      console.log('PageSpeed Analysis Results:', JSON.stringify(analysisResults?.technicalAnalysis?.pageSpeed, null, 2));
      
      // Calculate overall score
      const score = calculateOverallScore(analysisResults);

      // Extract domain from URL
      let domain;
      try {
        const urlObj = new URL(url);
        domain = urlObj.hostname;
      } catch (error) {
        domain = 'unknown';
      }

      // Prepare analysis data with proper structure
      const analysisData = {
        userId,
        url,
        domain,
        score,
        analysis: {
          meta: {
            title: analysisResults?.metaAnalysis?.title || '',
            description: analysisResults?.metaAnalysis?.description || '',
            keywords: analysisResults?.metaAnalysis?.keywords || '',
            recommendations: analysisResults?.metaAnalysis?.recommendations?.map(rec => ({
              type: rec.type || 'warning',
              message: rec.message
            })) || []
          },
          content: {
            wordCount: analysisResults?.contentAnalysis?.wordCount || 0,
            headings: {
              h1: analysisResults?.contentAnalysis?.headings?.h1 || 0,
              h2: analysisResults?.contentAnalysis?.headings?.h2 || 0,
              h3: analysisResults?.contentAnalysis?.headings?.h3 || 0
            },
            images: {
              total: analysisResults?.contentAnalysis?.images?.total || 0,
              withAlt: analysisResults?.contentAnalysis?.images?.withAlt || 0,
              withoutAlt: analysisResults?.contentAnalysis?.images?.withoutAlt || 0
            },
            paragraphs: analysisResults?.contentAnalysis?.paragraphs || 0,
            recommendations: analysisResults?.contentAnalysis?.recommendations?.map(rec => ({
              type: rec.type || 'warning',
              message: rec.message
            })) || []
          },
          technical: {
            mobileResponsiveness: {
              isMobileFriendly: analysisResults?.technicalAnalysis?.mobileResponsiveness?.isMobileFriendly || false,
              issues: analysisResults?.technicalAnalysis?.mobileResponsiveness?.issues || []
            },
            pageSpeed: {
              mobile: {
                score: Number(analysisResults?.technicalAnalysis?.pageSpeed?.mobile?.score || 0),
                coreWebVitals: {
                  firstContentfulPaint: {
                    value: Number(analysisResults?.technicalAnalysis?.pageSpeed?.mobile?.coreWebVitals?.firstContentfulPaint?.value || 0),
                    score: Number(analysisResults?.technicalAnalysis?.pageSpeed?.mobile?.coreWebVitals?.firstContentfulPaint?.score || 0)
                  },
                  speedIndex: {
                    value: Number(analysisResults?.technicalAnalysis?.pageSpeed?.mobile?.coreWebVitals?.speedIndex?.value || 0),
                    score: Number(analysisResults?.technicalAnalysis?.pageSpeed?.mobile?.coreWebVitals?.speedIndex?.score || 0)
                  },
                  largestContentfulPaint: {
                    value: Number(analysisResults?.technicalAnalysis?.pageSpeed?.mobile?.coreWebVitals?.largestContentfulPaint?.value || 0),
                    score: Number(analysisResults?.technicalAnalysis?.pageSpeed?.mobile?.coreWebVitals?.largestContentfulPaint?.score || 0)
                  },
                  timeToInteractive: {
                    value: Number(analysisResults?.technicalAnalysis?.pageSpeed?.mobile?.coreWebVitals?.timeToInteractive?.value || 0),
                    score: Number(analysisResults?.technicalAnalysis?.pageSpeed?.mobile?.coreWebVitals?.timeToInteractive?.score || 0)
                  },
                  totalBlockingTime: {
                    value: Number(analysisResults?.technicalAnalysis?.pageSpeed?.mobile?.coreWebVitals?.totalBlockingTime?.value || 0),
                    score: Number(analysisResults?.technicalAnalysis?.pageSpeed?.mobile?.coreWebVitals?.totalBlockingTime?.score || 0)
                  },
                  cumulativeLayoutShift: {
                    value: Number(analysisResults?.technicalAnalysis?.pageSpeed?.mobile?.coreWebVitals?.cumulativeLayoutShift?.value || 0),
                    score: Number(analysisResults?.technicalAnalysis?.pageSpeed?.mobile?.coreWebVitals?.cumulativeLayoutShift?.score || 0)
                  }
                },
                opportunities: (analysisResults?.technicalAnalysis?.pageSpeed?.mobile?.opportunities || []).map(opp => ({
                  type: 'warning',
                  message: opp.title || 'Performance improvement opportunity',
                  title: opp.title,
                  description: opp.description,
                  potentialSavings: opp.potentialSavings,
                  impact: opp.impact
                }))
              },
              desktop: {
                score: Number(analysisResults?.technicalAnalysis?.pageSpeed?.desktop?.score || 0),
                coreWebVitals: {
                  firstContentfulPaint: {
                    value: Number(analysisResults?.technicalAnalysis?.pageSpeed?.desktop?.coreWebVitals?.firstContentfulPaint?.value || 0),
                    score: Number(analysisResults?.technicalAnalysis?.pageSpeed?.desktop?.coreWebVitals?.firstContentfulPaint?.score || 0)
                  },
                  speedIndex: {
                    value: Number(analysisResults?.technicalAnalysis?.pageSpeed?.desktop?.coreWebVitals?.speedIndex?.value || 0),
                    score: Number(analysisResults?.technicalAnalysis?.pageSpeed?.desktop?.coreWebVitals?.speedIndex?.score || 0)
                  },
                  largestContentfulPaint: {
                    value: Number(analysisResults?.technicalAnalysis?.pageSpeed?.desktop?.coreWebVitals?.largestContentfulPaint?.value || 0),
                    score: Number(analysisResults?.technicalAnalysis?.pageSpeed?.desktop?.coreWebVitals?.largestContentfulPaint?.score || 0)
                  },
                  timeToInteractive: {
                    value: Number(analysisResults?.technicalAnalysis?.pageSpeed?.desktop?.coreWebVitals?.timeToInteractive?.value || 0),
                    score: Number(analysisResults?.technicalAnalysis?.pageSpeed?.desktop?.coreWebVitals?.timeToInteractive?.score || 0)
                  },
                  totalBlockingTime: {
                    value: Number(analysisResults?.technicalAnalysis?.pageSpeed?.desktop?.coreWebVitals?.totalBlockingTime?.value || 0),
                    score: Number(analysisResults?.technicalAnalysis?.pageSpeed?.desktop?.coreWebVitals?.totalBlockingTime?.score || 0)
                  },
                  cumulativeLayoutShift: {
                    value: Number(analysisResults?.technicalAnalysis?.pageSpeed?.desktop?.coreWebVitals?.cumulativeLayoutShift?.value || 0),
                    score: Number(analysisResults?.technicalAnalysis?.pageSpeed?.desktop?.coreWebVitals?.cumulativeLayoutShift?.score || 0)
                  }
                },
                opportunities: (analysisResults?.technicalAnalysis?.pageSpeed?.desktop?.opportunities || []).map(opp => ({
                  type: 'warning',
                  message: opp.title || 'Performance improvement opportunity',
                  title: opp.title,
                  description: opp.description,
                  potentialSavings: opp.potentialSavings,
                  impact: opp.impact
                }))
              }
            },
            recommendations: analysisResults?.technicalAnalysis?.recommendations?.map(rec => ({
              type: rec.type || 'warning',
              message: rec.message
            })) || []
          }
        },
        createdAt: new Date()
      };

      // Save the basic SEO analysis
      const seoAnalysis = new SeoAnalysis(analysisData);
      await seoAnalysis.save();

      // Set basic rate limit headers (for SEO analysis tracking)
      res.setHeader('X-RateLimit-Remaining', 10); // Basic SEO analysis doesn't count against AI limit
      res.setHeader('X-RateLimit-Limit', 10);

      // Prepare response WITHOUT AI insights (user can request them separately)
      const response = {
        success: true,
        data: {
          score,
          analysis: analysisData.analysis,
          recommendations: generateRecommendations(analysisResults),
          aiInsights: null, // No AI insights by default
          aiAvailability: null
        },
        message: 'SEO analysis completed. Click "Get AI Insights" for strategic recommendations.',
        analysisId: seoAnalysis._id // Include ID for AI insights request
      };

      res.json(response);

    } catch (error) {
      console.error('SEO Analysis error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error analyzing website',
        error: error.message 
      })
    }
  },

  // New endpoint to check AI availability
  async checkAIAvailability(req, res) {
    try {
      const userId = req.userId;
      const ipAddress = req.ip || req.connection.remoteAddress;

      const availability = await aiAnalysisService.checkAvailability(userId, ipAddress);
      
      res.json({
        success: true,
        availability
      });
    } catch (error) {
      console.error('AI availability check error:', error);
      res.status(500).json({
        success: false,
        message: 'Error checking AI availability'
      });
    }
  },

  // New endpoint to get usage statistics for admin
  async getAIUsageStats(req, res) {
    try {
      const stats = await aiAnalysisService.getUsageStats();
      
      res.json({
        success: true,
        stats
      });
    } catch (error) {
      console.error('AI usage stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Error retrieving usage statistics'
      });
    }
  },

  // New endpoint to get rate limit status for debugging
  async getRateLimitStatus(req, res) {
    try {
      const userId = req.userId;
      const ipAddress = req.ip || req.connection.remoteAddress;

      const status = await aiAnalysisService.getRateLimitStatus(userId, ipAddress);
      
      res.json({
        success: true,
        status
      });
    } catch (error) {
      console.error('Rate limit status error:', error);
      res.status(500).json({
        success: false,
        message: 'Error checking rate limit status'
      });
    }
  },

  // New endpoint to reset rate limits (for testing)
  async resetRateLimits(req, res) {
    try {
      const userId = req.userId;
      const ipAddress = req.ip || req.connection.remoteAddress;

      const resetCount = await aiAnalysisService.resetRateLimits(userId, ipAddress);
      
      res.json({
        success: true,
        message: `Reset ${resetCount} rate limit records`,
        resetCount
      });
    } catch (error) {
      console.error('Rate limit reset error:', error);
      res.status(500).json({
        success: false,
        message: 'Error resetting rate limits'
      });
    }
  },

  // New endpoint to get AI insights for a specific analysis
  async getAIInsights(req, res) {
    try {
      const { analysisId } = req.params;
      const userId = req.userId;
      const ipAddress = req.ip || req.connection.remoteAddress;

      // Find the analysis
      const analysis = await SeoAnalysis.findOne({ 
        _id: analysisId, 
        userId: userId 
      });

      if (!analysis) {
        return res.status(404).json({
          success: false,
          message: 'Analysis not found'
        });
      }

      // Check rate limit availability for AI insights
      const availability = await aiAnalysisService.checkAvailability(userId, ipAddress);
      
      if (!availability.available) {
        return res.status(429).json({
          success: false,
          message: availability.reason,
          limit: 10,
          remaining: availability.remainingRequests || 0,
          resetTime: availability.resetTime
        });
      }

      // Generate AI insights for the existing analysis
      const aiResult = await aiAnalysisService.generateInsights(
        {
          url: analysis.url,
          score: analysis.score,
          analysis: analysis.analysis,
          recommendations: generateRecommendations({
            metaAnalysis: { recommendations: analysis.analysis.meta.recommendations },
            contentAnalysis: { recommendations: analysis.analysis.content.recommendations },
            technicalAnalysis: { recommendations: analysis.analysis.technical.recommendations }
          })
        },
        userId,
        ipAddress
      );

      // Set proper rate limit headers based on current usage
      const currentAvailability = await aiAnalysisService.checkAvailability(userId, ipAddress);
      res.setHeader('X-RateLimit-Remaining', currentAvailability.remainingRequests || 0);
      res.setHeader('X-RateLimit-Limit', 10);
      res.setHeader('X-RateLimit-Reset', currentAvailability.resetTime);

      // Prepare response with AI insights
      const response = {
        success: true,
        data: {
          aiInsights: aiResult.success ? aiResult.insights : null,
          analysisId: analysisId
        },
        aiUsage: {
          available: aiResult.success || aiResult.availability?.available,
          cached: aiResult.cached,
          error: aiResult.error,
          remainingRequests: currentAvailability.remainingRequests || 0,
          requestCount: currentAvailability.requestCount || 0,
          resetTime: currentAvailability.resetTime,
          fallback: aiResult.fallback || false
        }
      };

      res.json(response);

    } catch (error) {
      console.error('AI Insights error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error generating AI insights',
        error: error.message 
      });
    }
  },

  // Keep the existing getAnalysisHistory method
  async getAnalysisHistory(req, res) {
    try {
      const userId = req.userId;
      const ipAddress = req.ip || req.connection.remoteAddress;

      // Set rate limit headers for history endpoint
      const availability = await aiAnalysisService.checkAvailability(userId, ipAddress);
      res.setHeader('X-RateLimit-Remaining', availability.remainingRequests || 0);
      res.setHeader('X-RateLimit-Limit', 10);
      res.setHeader('X-RateLimit-Reset', availability.resetTime);

      const history = await SeoAnalysis.find({ userId })
        .sort({ createdAt: -1 })
        .limit(10);
      res.json({ success: true, data: history });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: 'Error fetching analysis history' 
      });
    }
  }
};

// Keep your existing helper functions
function calculateOverallScore(analysisResults) {
  let score = 100;
  
  // Safely check for meta issues
  const metaIssues = analysisResults?.metaAnalysis?.recommendations?.length || 0;
  score -= metaIssues * 5;

  // Safely check for content issues
  const contentIssues = analysisResults?.contentAnalysis?.recommendations?.length || 0;
  score -= contentIssues * 5;

  // Safely check mobile responsiveness
  const isMobileFriendly = analysisResults?.technicalAnalysis?.mobileResponsiveness?.isMobileFriendly;
  if (isMobileFriendly === false) {
    score -= 15;
  }

  // Safely check page speed score (use mobile score as primary)
  const pageSpeedScore = analysisResults?.technicalAnalysis?.pageSpeed?.mobile?.score;
  if (typeof pageSpeedScore === 'number' && !isNaN(pageSpeedScore)) {
    score -= Math.max(0, (100 - pageSpeedScore) * 0.15);
  }

  // Ensure score is a valid number between 0 and 100
  const finalScore = Math.max(0, Math.min(100, Math.round(score)));
  
  // If still NaN, default to 50
  return isNaN(finalScore) ? 50 : finalScore;
}

function generateRecommendations(analysisResults) {
  const recommendations = [];

  // Add meta recommendations with validation
  if (analysisResults?.metaAnalysis?.recommendations) {
    analysisResults.metaAnalysis.recommendations.forEach(rec => {
      recommendations.push({
        category: 'meta',
        type: rec.type || 'warning',
        message: rec.message,
        priority: rec.type === 'error' ? 'high' : 'medium'
      });
    });
  }

  // Add content recommendations with validation
  if (analysisResults?.contentAnalysis?.recommendations) {
    analysisResults.contentAnalysis.recommendations.forEach(rec => {
      recommendations.push({
        category: 'content',
        type: rec.type || 'warning',
        message: rec.message,
        priority: rec.type === 'error' ? 'high' : 'medium'
      });
    });
  }

  // Add technical recommendations with validation
  if (analysisResults?.technicalAnalysis?.recommendations) {
    analysisResults.technicalAnalysis.recommendations.forEach(rec => {
      recommendations.push({
        category: 'technical',
        type: rec.type || 'warning',
        message: rec.message,
        priority: 'high'
      });
    });
  }

  return recommendations;
}

module.exports = seoController;