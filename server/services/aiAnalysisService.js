const { GoogleGenerativeAI } = require('@google/generative-ai');
const RateLimit = require('../models/RateLimit');
const AiInsight = require('../models/AiInsight');
const cacheService = require('./cacheService');

// Create a simple logger if the main logger isn't available
const logger = {
  error: (msg, error) => console.error(`[AI-Service] ${msg}`, error || ''),
  warn: (msg) => console.warn(`[AI-Service] ${msg}`),
  info: (msg) => console.log(`[AI-Service] ${msg}`)
};

class AIAnalysisService {
  constructor() {
    // Load environment variables
    require('dotenv').config();
    
    const apiKey = process.env.GEMINI_API_KEY;
    this.isEnabled = !!apiKey;
    
    if (this.isEnabled) {
      this.genAI = new GoogleGenerativeAI(apiKey);
      // Use the latest available model
      this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
      // Test the model availability
      this.testModelAvailability();
    }
    
    // Rate limiting configuration
    this.DAILY_LIMIT = parseInt(process.env.AI_USER_DAILY_LIMIT) || 10;
    this.COOLDOWN_HOURS = parseInt(process.env.AI_COOLDOWN_HOURS) || 24;
    this.GLOBAL_DAILY_LIMIT = parseInt(process.env.AI_DAILY_LIMIT) || 100;
    
    if (this.isEnabled) {
      console.log('✅ AI Analysis Service initialized with Gemini API');
      console.log(`📊 Limits: ${this.DAILY_LIMIT} per user/day, ${this.GLOBAL_DAILY_LIMIT} global/day`);
    } else {
      console.log('⚠️ AI Analysis Service disabled - No Gemini API key found');
      console.log('Current API key value:', apiKey ? `${apiKey.substring(0, 10)}...` : 'undefined');
    }
  }

  /**
   * Test model availability
   */
  async testModelAvailability() {
    try {
      // Try a simple test prompt
      const result = await this.model.generateContent("Hello");
      const response = await result.response;
      logger.info('✅ Gemini model test successful');
    } catch (error) {
      logger.error('❌ Gemini model test failed:', error.message);
      if (error.message.includes('not found')) {
        logger.warn('Try updating to use: gemini-1.5-pro or gemini-1.5-flash-latest');
      }
    }
  }

  /**
   * Check if AI analysis is available for user/IP
   */
  async checkAvailability(userId, ipAddress) {
    try {
      if (!this.isEnabled) {
        return {
          available: false,
          reason: 'AI service temporarily unavailable',
          remainingRequests: 0,
          resetTime: null
        };
      }

      // Check global daily limit
      const globalUsage = await this.getGlobalUsage();
      if (globalUsage >= this.GLOBAL_DAILY_LIMIT) {
        return {
          available: false,
          reason: 'Daily global limit reached. Service will reset tomorrow.',
          remainingRequests: 0,
          resetTime: this.getNextResetTime()
        };
      }

      // Check user-specific limits
      const userLimit = await this.getUserRateLimit(userId, ipAddress);
      const remainingRequests = this.DAILY_LIMIT - userLimit.requestCount;

      if (remainingRequests <= 0) {
        return {
          available: false,
          reason: 'Daily limit reached (10/10). AI analysis will reset tomorrow.',
          remainingRequests: 0,
          resetTime: this.getNextResetTime(),
          requestCount: userLimit.requestCount
        };
      }

      return {
        available: true,
        remainingRequests,
        requestCount: userLimit.requestCount,
        resetTime: this.getNextResetTime()
      };
    } catch (error) {
      logger.error('AI availability check error:', error);
      return {
        available: false,
        reason: 'Unable to check AI service availability',
        remainingRequests: 0,
        resetTime: null
      };
    }
  }

  /**
   * Generate AI-powered insights for SEO analysis
   */
  async generateInsights(analysisData, userId, ipAddress) {
    try {
      // Check availability first
      const availability = await this.checkAvailability(userId, ipAddress);
      if (!availability.available) {
        return {
          success: false,
          error: availability.reason,
          fallback: true,
          availability
        };
      }

      // Check cache first
      const cacheKey = `ai_insights_${this.generateCacheKey(analysisData)}`;
      const cachedInsights = cacheService.get(cacheKey);
      
      if (cachedInsights) {
        logger.info('AI insights cache hit for analysis');
        return {
          success: true,
          insights: cachedInsights,
          cached: true,
          availability
        };
      }

      // Increment usage counter (even if AI fails, we track the attempt)
      await this.incrementUsage(userId, ipAddress);

      // Generate AI insights
      const insights = await this.callGeminiAPI(analysisData);

      // Check if we got fallback insights due to API failure
      if (insights.fallbackGenerated) {
        logger.info('Using fallback insights due to AI service unavailability');
      }

      // Cache the insights for 6 hours (reduced for fallback, 24 hours for real AI)
      const cacheTime = insights.fallbackGenerated ? 6 * 60 * 60 : 24 * 60 * 60;
      cacheService.set(cacheKey, insights, cacheTime);

      // Store insights in database (even fallback ones for consistency)
      await this.storeInsights(analysisData.url, insights, userId);

      // Get updated availability
      const updatedAvailability = await this.checkAvailability(userId, ipAddress);

      return {
        success: true,
        insights,
        cached: false,
        fallback: insights.fallbackGenerated || false,
        availability: updatedAvailability
      };

    } catch (error) {
      logger.error('AI insights generation error:', error);
      return {
        success: false,
        error: 'Failed to generate AI insights',
        fallback: true,
        availability: await this.checkAvailability(userId, ipAddress)
      };
    }
  }

  /**
   * Call Gemini API with optimized prompts and retry logic
   */
  async callGeminiAPI(analysisData) {
    const maxRetries = 1; // Reduced retries to save quota
    let lastError;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const prompt = this.buildOptimizedPrompt(analysisData);
        
        // Log prompt length for monitoring
        logger.info(`AI prompt length: ${prompt.length} characters (est. ${Math.ceil(prompt.length / 4)} tokens)`);
        
        const result = await this.model.generateContent(prompt);

        const response = await result.response;
        let responseText = response.text();
        
        // Log response length for monitoring
        logger.info(`AI response length: ${responseText.length} characters (est. ${Math.ceil(responseText.length / 4)} tokens)`);
        
        // Clean up response text - remove markdown code blocks if present
        responseText = responseText.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
        
        const insights = JSON.parse(responseText);

        return this.validateAndEnhanceInsights(insights, analysisData);
        
      } catch (error) {
        lastError = error;
        
        // Handle specific API errors
        if (error.status === 429) {
          logger.warn(`Gemini API quota exceeded (attempt ${attempt}/${maxRetries})`);
        } else if (error.status === 503) {
          logger.warn(`Gemini API service overloaded (attempt ${attempt}/${maxRetries}): ${error.message}`);
        } else {
          logger.error(`Gemini API call error (attempt ${attempt}):`, error.message);
        }
        
        // For 503 (Service Unavailable) or 429 (Quota), retry with backoff
        if ((error.status === 429 || error.status === 503) && attempt < maxRetries) {
          // Wait before retry with exponential backoff
          const waitTime = error.status === 503 ? 5000 : 3000; // Longer wait for service overload
          logger.info(`Retrying in ${waitTime/1000}s...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          continue;
        }
        
        // If all retries failed or other error, return fallback
        if (attempt === maxRetries) {
          logger.warn('All Gemini API retries failed, returning fallback insights');
          return this.generateFallbackInsights(analysisData);
        }
      }
    }

    // This shouldn't be reached, but just in case
    return this.generateFallbackInsights(analysisData);
  }

  /**
   * Build ultra-compact prompt for Gemini (token-optimized)
   */
  buildOptimizedPrompt(analysisData) {
    const { score, analysis, recommendations } = analysisData;
    
    // Extract only essential data to minimize tokens
    const issues = recommendations?.slice(0, 3).map(r => r.message || r.title).join(', ') || 'None';
    const pageSpeed = analysis.technicalAnalysis?.pageSpeed?.score || 'N/A';
    const wordCount = analysis.contentAnalysis?.wordCount || 0;
    
    return `SEO Score: ${score}/100
Issues: ${issues}
Speed: ${pageSpeed}/100, Words: ${wordCount}

Return JSON:
{
"executiveSummary": "Brief 2-sentence summary",
"priorityActions": [{"action": "Top action", "impact": "High", "timeframe": "1-2 weeks", "reasoning": "Why"}],
"competitiveAdvantage": "Brief advantage statement",
"expectedOutcomes": {"shortTerm": "1-3 months result", "longTerm": "6-12 months result"},
"industryInsights": "Key trend",
"riskAssessment": "Low"
}

Be concise.`;
  }

  /**
   * Validate and enhance AI insights
   */
  validateAndEnhanceInsights(insights, analysisData) {
    // Ensure all required fields exist
    const validatedInsights = {
      executiveSummary: insights.executiveSummary || 'AI analysis completed successfully.',
      priorityActions: Array.isArray(insights.priorityActions) ? 
        insights.priorityActions.slice(0, 4) : 
        [{
          action: 'Review SEO fundamentals',
          impact: 'Medium',
          timeframe: '1-2 weeks',
          reasoning: 'Foundation optimization needed'
        }],
      competitiveAdvantage: insights.competitiveAdvantage || 'Improved search visibility and user experience.',
      expectedOutcomes: {
        shortTerm: insights.expectedOutcomes?.shortTerm || 'Initial SEO improvements',
        longTerm: insights.expectedOutcomes?.longTerm || 'Sustained organic growth'
      },
      industryInsights: insights.industryInsights || 'Focus on mobile-first optimization and Core Web Vitals.',
      riskAssessment: this.normalizeRiskAssessment(insights.riskAssessment) || 'Low',
      generatedAt: new Date().toISOString(),
      confidence: this.calculateConfidence(analysisData)
    };

    return validatedInsights;
  }

  /**
   * Normalize risk assessment to valid enum values
   */
  normalizeRiskAssessment(riskAssessment) {
    if (!riskAssessment) return 'Low';
    
    const assessment = riskAssessment.toLowerCase();
    
    if (assessment.includes('high')) return 'High';
    if (assessment.includes('medium')) return 'Medium';
    return 'Low'; // Default to Low for any other case
  }

  /**
   * Calculate confidence score based on data quality
   */
  calculateConfidence(analysisData) {
    let confidence = 0.7; // Base confidence
    
    if (analysisData.analysis?.metaAnalysis?.title) confidence += 0.1;
    if (analysisData.analysis?.metaAnalysis?.description) confidence += 0.1;
    if (analysisData.analysis?.contentAnalysis?.wordCount > 300) confidence += 0.1;
    
    return Math.min(0.95, confidence);
  }

  /**
   * Get or create rate limit record for user/IP
   */
  async getUserRateLimit(userId, ipAddress) {
    // Use UTC midnight for consistent daily boundaries
    const todayUTC = new Date();
    todayUTC.setUTCHours(0, 0, 0, 0);

    // Check user-based limit first
    let userRateLimit = null;
    if (userId) {
      userRateLimit = await RateLimit.findOne({
        userId: userId,
        createdAt: { $gte: todayUTC },
        service: 'ai_analysis'
      });
    }

    // Check IP-based limit
    let ipRateLimit = await RateLimit.findOne({
      ipAddress: ipAddress,
      createdAt: { $gte: todayUTC },
      service: 'ai_analysis'
    });

    // Return the limit record with the highest usage (most restrictive)
    if (userRateLimit && ipRateLimit) {
      return userRateLimit.requestCount >= ipRateLimit.requestCount ? userRateLimit : ipRateLimit;
    }

    if (userRateLimit) return userRateLimit;
    if (ipRateLimit) return ipRateLimit;

    // Create new rate limit record if none exists
    const newRateLimit = new RateLimit({
      userId,
      ipAddress,
      requestCount: 0,
      service: 'ai_analysis',
      createdAt: todayUTC // Use UTC midnight
    });
    await newRateLimit.save();
    
    return newRateLimit;
  }

  /**
   * Increment usage counter
   */
  async incrementUsage(userId, ipAddress) {
    // Use UTC midnight for consistent daily boundaries
    const todayUTC = new Date();
    todayUTC.setUTCHours(0, 0, 0, 0);

    // Update or create user-based rate limit
    if (userId) {
      await RateLimit.findOneAndUpdate(
        {
          userId: userId,
          createdAt: { $gte: todayUTC },
          service: 'ai_analysis'
        },
        { 
          $inc: { requestCount: 1 },
          $set: { 
            lastRequestAt: new Date(),
            ipAddress: ipAddress
          }
        },
        { upsert: true, setDefaultsOnInsert: true }
      );
    }

    // Update or create IP-based rate limit (separate record)
    await RateLimit.findOneAndUpdate(
      {
        ipAddress: ipAddress,
        userId: { $exists: false }, // Ensure this is IP-only record
        createdAt: { $gte: todayUTC },
        service: 'ai_analysis'
      },
      { 
        $inc: { requestCount: 1 },
        $set: { 
          lastRequestAt: new Date()
        }
      },
      { upsert: true, setDefaultsOnInsert: true }
    );
  }

  /**
   * Get global usage for the day
   */
  async getGlobalUsage() {
    // Use UTC midnight for consistent daily boundaries
    const todayUTC = new Date();
    todayUTC.setUTCHours(0, 0, 0, 0);

    const result = await RateLimit.aggregate([
      { $match: { createdAt: { $gte: todayUTC } } },
      { $group: { _id: null, totalRequests: { $sum: '$requestCount' } } }
    ]);

    return result.length > 0 ? result[0].totalRequests : 0;
  }

  /**
   * Get next reset time (midnight UTC)
   */
  getNextResetTime() {
    const tomorrow = new Date();
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
    tomorrow.setUTCHours(0, 0, 0, 0);
    return tomorrow.toISOString();
  }

  /**
   * Generate optimized cache key for better hit rates
   */
  generateCacheKey(analysisData) {
    // Simplified cache key based on score ranges for better hit rates
    const scoreRange = Math.floor(analysisData.score / 10) * 10; // Round to nearest 10
    const hasIssues = analysisData.recommendations?.length > 0 ? 'issues' : 'clean';
    
    return `ai_${scoreRange}_${hasIssues}`;
  }

  /**
   * Store insights in database
   */
  async storeInsights(url, insights, userId) {
    try {
      const aiInsight = new AiInsight({
        url,
        userId,
        insights,
        confidence: insights.confidence,
        createdAt: new Date()
      });
      
      await aiInsight.save();
    } catch (error) {
      logger.error('Failed to store AI insights:', error);
    }
  }

  /**
   * Get usage statistics for admin dashboard
   */
  async getUsageStats() {
    // Use UTC midnight for consistent daily boundaries
    const todayUTC = new Date();
    todayUTC.setUTCHours(0, 0, 0, 0);

    const [dailyStats, totalStats] = await Promise.all([
      RateLimit.aggregate([
        { $match: { createdAt: { $gte: todayUTC } } },
        { 
          $group: { 
            _id: null, 
            totalRequests: { $sum: '$requestCount' },
            uniqueUsers: { $addToSet: '$userId' },
            uniqueIPs: { $addToSet: '$ipAddress' }
          } 
        }
      ]),
      AiInsight.countDocuments({ createdAt: { $gte: todayUTC } })
    ]);

    return {
      daily: {
        requests: dailyStats[0]?.totalRequests || 0,
        uniqueUsers: dailyStats[0]?.uniqueUsers?.length || 0,
        uniqueIPs: dailyStats[0]?.uniqueIPs?.length || 0,
        insights: totalStats
      },
      limits: {
        perUser: this.DAILY_LIMIT,
        global: this.GLOBAL_DAILY_LIMIT,
        resetTime: this.getNextResetTime()
      }
    };
  }

  /**
   * Emergency disable AI service
   */
  async emergencyDisable() {
    this.isEnabled = false;
    logger.warn('AI service emergency disabled');
  }

  /**
   * Enable AI service
   */
  async enable() {
    if (process.env.GEMINI_API_KEY) {
      this.isEnabled = true;
      logger.info('AI service enabled');
    }
  }

  /**
   * Reset rate limits for testing (admin function)
   */
  async resetRateLimits(userId = null, ipAddress = null) {
    // Use UTC midnight for consistent daily boundaries
    const todayUTC = new Date();
    todayUTC.setUTCHours(0, 0, 0, 0);

    const query = {
      createdAt: { $gte: todayUTC },
      service: 'ai_analysis'
    };

    if (userId) query.userId = userId;
    if (ipAddress) query.ipAddress = ipAddress;

    const result = await RateLimit.deleteMany(query);
    logger.info(`Reset ${result.deletedCount} rate limit records`);
    
    return result.deletedCount;
  }

  /**
   * Get detailed rate limit status for debugging
   */
  async getRateLimitStatus(userId, ipAddress) {
    // Use UTC midnight for consistent daily boundaries
    const todayUTC = new Date();
    todayUTC.setUTCHours(0, 0, 0, 0);

    const userLimit = userId ? await RateLimit.findOne({
      userId: userId,
      createdAt: { $gte: todayUTC },
      service: 'ai_analysis'
    }) : null;

    const ipLimit = await RateLimit.findOne({
      ipAddress: ipAddress,
      createdAt: { $gte: todayUTC },
      service: 'ai_analysis'
    });

    return {
      user: {
        exists: !!userLimit,
        requestCount: userLimit?.requestCount || 0,
        remaining: userLimit ? Math.max(0, this.DAILY_LIMIT - userLimit.requestCount) : this.DAILY_LIMIT
      },
      ip: {
        exists: !!ipLimit,
        requestCount: ipLimit?.requestCount || 0,
        remaining: ipLimit ? Math.max(0, this.DAILY_LIMIT - ipLimit.requestCount) : this.DAILY_LIMIT
      },
      serviceEnabled: this.isEnabled,
      globalLimit: this.GLOBAL_DAILY_LIMIT,
      dailyLimit: this.DAILY_LIMIT,
      currentTimeUTC: new Date().toISOString(),
      todayBoundaryUTC: todayUTC.toISOString(),
      nextResetUTC: this.getNextResetTime()
    };
  }

  /**
   * Generate fallback insights when AI API fails
   */
  generateFallbackInsights(analysisData) {
    const score = analysisData.score || 0;
    
    // Generate contextual fallback based on score
    let executiveSummary, priorityActions, competitiveAdvantage;
    
    if (score < 50) {
      executiveSummary = "Your website has significant SEO opportunities that could dramatically improve search visibility. Focus on fundamental optimizations first for maximum impact.";
      priorityActions = [
        {
          action: "Optimize page titles and meta descriptions",
          impact: "High",
          timeframe: "1-2 weeks",
          reasoning: "Basic meta optimizations provide immediate search engine clarity"
        },
        {
          action: "Improve page loading speed",
          impact: "High", 
          timeframe: "2-3 weeks",
          reasoning: "Core Web Vitals directly impact rankings and user experience"
        },
        {
          action: "Add structured data markup",
          impact: "Medium",
          timeframe: "1-2 weeks",
          reasoning: "Enhanced search result appearance drives higher click-through rates"
        }
      ];
      competitiveAdvantage = "Implementing these foundational SEO improvements will help you catch up to competitors and establish a strong search presence.";
    } else if (score < 75) {
      executiveSummary = "Your website has solid SEO foundations with room for strategic improvements. Focus on advanced optimizations to outperform competitors.";
      priorityActions = [
        {
          action: "Enhance content quality and depth",
          impact: "High",
          timeframe: "2-4 weeks", 
          reasoning: "Comprehensive content builds topical authority and user engagement"
        },
        {
          action: "Optimize for featured snippets",
          impact: "Medium",
          timeframe: "1-3 weeks",
          reasoning: "Position zero captures more visibility and traffic"
        },
        {
          action: "Improve internal linking structure",
          impact: "Medium",
          timeframe: "1-2 weeks",
          reasoning: "Strategic linking distributes page authority and improves crawlability"
        }
      ];
      competitiveAdvantage = "These strategic optimizations will help you surpass competitors who focus only on basic SEO fundamentals.";
    } else {
      executiveSummary = "Your website demonstrates strong SEO performance. Focus on advanced tactics and continuous optimization to maintain your competitive edge.";
      priorityActions = [
        {
          action: "Implement advanced schema markup",
          impact: "Medium",
          timeframe: "1-2 weeks",
          reasoning: "Rich snippets enhance search appearance and click-through rates"
        },
        {
          action: "Optimize for voice search queries",
          impact: "Medium",
          timeframe: "2-3 weeks",
          reasoning: "Voice search optimization captures emerging search behaviors"
        },
        {
          action: "Monitor and optimize Core Web Vitals",
          impact: "High",
          timeframe: "Ongoing",
          reasoning: "Maintaining excellent page experience is crucial for sustained rankings"
        }
      ];
      competitiveAdvantage = "Your strong SEO foundation allows you to focus on cutting-edge optimizations that most competitors haven't implemented.";
    }

    return {
      executiveSummary,
      priorityActions,
      competitiveAdvantage,
      expectedOutcomes: {
        shortTerm: "Improved search rankings and organic traffic within 1-3 months",
        longTerm: "Sustained organic growth and market share expansion over 6-12 months"
      },
      industryInsights: "Focus on E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness) and user-first content strategy for long-term SEO success.",
      riskAssessment: "Low",
      generatedAt: new Date().toISOString(),
      confidence: 0.85,
      fallbackGenerated: true
    };
  }
}

module.exports = new AIAnalysisService();
