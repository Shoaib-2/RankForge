const SeoAnalysis = require('../models/SeoAnalysis');
const seoAnalyzer = require('../services/seoAnalyzer');


const seoController = {
  async analyzeSite(req, res) {
    try {
      const { url } = req.body;
      const userId = req.userId;

      if (!url) {
        return res.status(400).json({
          success: false,
          message: 'URL is required'
        });
      }

      // Get complete analysis
      const analysisResults = await seoAnalyzer.analyzeContent(url);
      
      // Calculate overall score
      const score = calculateOverallScore(analysisResults);

      // Prepare analysis data with proper structure
      const analysisData = {
        userId,
        url,
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
              score: Number(analysisResults?.technicalAnalysis?.pageSpeed?.score || 0),
              metrics: {
                firstContentfulPaint: {
                  value: Number(analysisResults?.technicalAnalysis?.pageSpeed?.metrics?.firstContentfulPaint?.value || 0),
                  score: Number(analysisResults?.technicalAnalysis?.pageSpeed?.metrics?.firstContentfulPaint?.score || 0)
                },
                speedIndex: {
                  value: Number(analysisResults?.technicalAnalysis?.pageSpeed?.metrics?.speedIndex?.value || 0),
                  score: Number(analysisResults?.technicalAnalysis?.pageSpeed?.metrics?.speedIndex?.score || 0)
                },
                largestContentfulPaint: {
                  value: Number(analysisResults?.technicalAnalysis?.pageSpeed?.metrics?.largestContentfulPaint?.value || 0),
                  score: Number(analysisResults?.technicalAnalysis?.pageSpeed?.metrics?.largestContentfulPaint?.score || 0)
                },
                timeToInteractive: {
                  value: Number(analysisResults?.technicalAnalysis?.pageSpeed?.metrics?.timeToInteractive?.value || 0),
                  score: Number(analysisResults?.technicalAnalysis?.pageSpeed?.metrics?.timeToInteractive?.score || 0)
                }
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

      // Save analysis to database
      const seoAnalysis = new SeoAnalysis(analysisData);
      await seoAnalysis.save();

      // Send response with usage information
      res.json({
        success: true,
        data: {
          score,
          analysis: analysisData.analysis,
          recommendations: generateRecommendations(analysisResults)
        },
        usage: req.usageInfo // Added from rate limiter middleware
      });

    } catch (error) {
      console.error('SEO Analysis error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error analyzing website',
        error: error.message 
      })
    }
  },

  // Keep the existing getAnalysisHistory method
  async getAnalysisHistory(req, res) {
    try {
      const userId = req.userId;
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
  
  const metaIssues = analysisResults.metaAnalysis.recommendations.length;
  score -= metaIssues * 5;

  const contentIssues = analysisResults.contentAnalysis.recommendations.length;
  score -= contentIssues * 5;

  if (!analysisResults.technicalAnalysis.mobileResponsiveness.isMobileFriendly) {
    score -= 15;
  }
  score -= Math.max(0, (100 - analysisResults.technicalAnalysis.pageSpeed.score) * 0.15);

  return Math.max(0, Math.min(100, Math.round(score)));
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