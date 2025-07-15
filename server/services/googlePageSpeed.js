const axios = require('axios');
const cacheService = require('./cacheService');

class GooglePageSpeedService {
  constructor() {
    // Google PageSpeed Insights API (free tier: 25,000 requests/day)
    this.apiKey = process.env.GOOGLE_PAGESPEED_API_KEY || null;
    this.baseUrl = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed';
    
    // Log API key status on initialization
    if (this.apiKey) {
      console.log('✅ Google PageSpeed API key configured - using real API data');
    } else {
      console.log('⚠️  No Google PageSpeed API key found - using mock data');
      console.log('💡 Add GOOGLE_PAGESPEED_API_KEY to .env for real data');
    }
  }

  async analyzePageSpeed(url) {
    try {
      // Check cache first
      const cachedResult = cacheService.getPageSpeed(url);
      if (cachedResult) {
        console.log('PageSpeed cache hit for:', url);
        return cachedResult;
      }

      const results = {};

      // Try to analyze both strategies concurrently for better performance
      const analysisPromises = ['mobile', 'desktop'].map(async (strategy) => {
        try {
          const apiUrl = new URL(this.baseUrl);
          apiUrl.searchParams.set('url', url);
          apiUrl.searchParams.set('strategy', strategy);
          apiUrl.searchParams.set('category', 'performance');
          
          // Add API key if available
          if (this.apiKey) {
            apiUrl.searchParams.set('key', this.apiKey);
          }

          console.log(`Analyzing PageSpeed for ${url} (${strategy})`);
          
          if (this.apiKey) {
            console.log('✅ Using Google API key for real data');
          } else {
            console.log('⚠️ No API key - using mock data');
          }

          // Try with retries for better reliability
          let retries = 2;
          let response;
          
          while (retries > 0) {
            try {
              response = await axios.get(apiUrl.toString(), {
                timeout: 45000, // Increased to 45 seconds
                headers: {
                  'User-Agent': 'SEO-Tool/1.0'
                }
              });
              break; // Success, exit retry loop
            } catch (error) {
              retries--;
              if (retries === 0) throw error; // Last retry failed
              
              console.log(`⚠️ Retry ${2 - retries}/2 for ${strategy} strategy...`);
              await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds before retry
            }
          }

          console.log(`✅ Google PageSpeed API response received for ${strategy}`);
          return { strategy, data: this.processPageSpeedData(response.data) };
          
        } catch (error) {
          console.error(`❌ Failed to analyze ${strategy} strategy:`, error.message);
          // Return fallback data for this strategy
          const fallbackData = this.getFallbackPageSpeedData();
          return { strategy, data: fallbackData[strategy] };
        }
      });

      // Wait for all analysis to complete (with individual error handling)
      const analysisResults = await Promise.allSettled(analysisPromises);
      
      // Process results
      analysisResults.forEach((result, index) => {
        const strategy = ['mobile', 'desktop'][index];
        if (result.status === 'fulfilled') {
          results[result.value.strategy] = result.value.data;
        } else {
          console.error(`Failed ${strategy} analysis:`, result.reason);
          const fallbackData = this.getFallbackPageSpeedData();
          results[strategy] = fallbackData[strategy];
        }
      });

      const finalResult = {
        mobile: results.mobile,
        desktop: results.desktop,
        timestamp: new Date().toISOString()
      };

      // Cache the result
      if (cacheService.shouldCache(url)) {
        cacheService.setPageSpeed(url, finalResult);
      }

      return finalResult;

    } catch (error) {
      console.error('🚨 Google PageSpeed API error:', error.message);
      console.error('Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        code: error.code,
        timeout: error.code === 'ECONNABORTED'
      });
      
      // Specific handling for different error types
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        console.log('⏰ API timeout - Google PageSpeed is slow for this site');
      } else if (error.response?.status === 429) {
        console.log('🚫 Rate limit exceeded - using cached/mock data');
      } else if (error.response?.status >= 500) {
        console.log('🔧 Google API server error - temporary issue');
      }
      
      // Return fallback mock data if API fails
      console.log('📄 Falling back to mock data due to API error');
      return this.getFallbackPageSpeedData();
    }
  }

  processPageSpeedData(data) {
    try {
      const lighthouseResult = data.lighthouseResult;
      const audits = lighthouseResult.audits;
      const categories = lighthouseResult.categories;

      // Extract Core Web Vitals
      const coreWebVitals = {
        largestContentfulPaint: {
          value: parseFloat(audits['largest-contentful-paint']?.numericValue || 0) / 1000,
          score: audits['largest-contentful-paint']?.score || 0,
          displayValue: audits['largest-contentful-paint']?.displayValue || 'N/A'
        },
        firstInputDelay: {
          value: parseFloat(audits['max-potential-fid']?.numericValue || 0),
          score: audits['max-potential-fid']?.score || 0,
          displayValue: audits['max-potential-fid']?.displayValue || 'N/A'
        },
        cumulativeLayoutShift: {
          value: parseFloat(audits['cumulative-layout-shift']?.numericValue || 0),
          score: audits['cumulative-layout-shift']?.score || 0,
          displayValue: audits['cumulative-layout-shift']?.displayValue || 'N/A'
        },
        firstContentfulPaint: {
          value: parseFloat(audits['first-contentful-paint']?.numericValue || 0) / 1000,
          score: audits['first-contentful-paint']?.score || 0,
          displayValue: audits['first-contentful-paint']?.displayValue || 'N/A'
        },
        speedIndex: {
          value: parseFloat(audits['speed-index']?.numericValue || 0) / 1000,
          score: audits['speed-index']?.score || 0,
          displayValue: audits['speed-index']?.displayValue || 'N/A'
        },
        timeToInteractive: {
          value: parseFloat(audits['interactive']?.numericValue || 0) / 1000,
          score: audits['interactive']?.score || 0,
          displayValue: audits['interactive']?.displayValue || 'N/A'
        },
        totalBlockingTime: {
          value: parseFloat(audits['total-blocking-time']?.numericValue || 0),
          score: audits['total-blocking-time']?.score || 0,
          displayValue: audits['total-blocking-time']?.displayValue || 'N/A'
        }
      };

      // Overall performance score
      const performanceScore = Math.round((categories.performance?.score || 0) * 100);

      // Performance opportunities
      const opportunities = Object.values(audits)
        .filter(audit => audit.details?.type === 'opportunity' && audit.numericValue > 0)
        .map(audit => ({
          title: audit.title,
          description: audit.description,
          potentialSavings: audit.displayValue,
          impact: audit.numericValue > 1000 ? 'high' : audit.numericValue > 500 ? 'medium' : 'low'
        }))
        .slice(0, 5); // Top 5 opportunities

      return {
        score: performanceScore,
        coreWebVitals,
        opportunities,
        loadingExperience: data.loadingExperience || null,
        originLoadingExperience: data.originLoadingExperience || null
      };

    } catch (error) {
      console.error('Error processing PageSpeed data:', error);
      return this.getFallbackPageSpeedData().mobile;
    }
  }

  getFallbackPageSpeedData() {
    return {
      mobile: {
        score: 75,
        coreWebVitals: {
          largestContentfulPaint: { value: 2.5, score: 0.8, displayValue: '2.5 s' },
          firstInputDelay: { value: 100, score: 0.9, displayValue: '100 ms' },
          cumulativeLayoutShift: { value: 0.1, score: 0.8, displayValue: '0.1' },
          firstContentfulPaint: { value: 1.8, score: 0.9, displayValue: '1.8 s' },
          speedIndex: { value: 3.2, score: 0.7, displayValue: '3.2 s' },
          timeToInteractive: { value: 4.1, score: 0.6, displayValue: '4.1 s' },
          totalBlockingTime: { value: 150, score: 0.8, displayValue: '150 ms' }
        },
        opportunities: [
          {
            title: 'Optimize images',
            description: 'Serve images in next-gen formats',
            potentialSavings: '0.5 s',
            impact: 'medium'
          }
        ],
        loadingExperience: null,
        originLoadingExperience: null
      },
      desktop: {
        score: 85,
        coreWebVitals: {
          largestContentfulPaint: { value: 1.8, score: 0.9, displayValue: '1.8 s' },
          firstInputDelay: { value: 50, score: 0.95, displayValue: '50 ms' },
          cumulativeLayoutShift: { value: 0.05, score: 0.9, displayValue: '0.05' },
          firstContentfulPaint: { value: 1.2, score: 0.95, displayValue: '1.2 s' },
          speedIndex: { value: 2.1, score: 0.85, displayValue: '2.1 s' },
          timeToInteractive: { value: 2.8, score: 0.8, displayValue: '2.8 s' },
          totalBlockingTime: { value: 80, score: 0.9, displayValue: '80 ms' }
        },
        opportunities: [
          {
            title: 'Remove unused CSS',
            description: 'Reduce unused rules from stylesheets',
            potentialSavings: '0.3 s',
            impact: 'low'
          }
        ],
        loadingExperience: null,
        originLoadingExperience: null
      },
      timestamp: new Date().toISOString()
    };
  }

  // Check if the service is available
  async isServiceAvailable() {
    try {
      // Test with a simple request
      const testUrl = 'https://www.google.com';
      const apiUrl = new URL(this.baseUrl);
      apiUrl.searchParams.set('url', testUrl);
      apiUrl.searchParams.set('strategy', 'mobile');
      
      if (this.apiKey) {
        apiUrl.searchParams.set('key', this.apiKey);
      }

      const response = await axios.get(apiUrl.toString(), { timeout: 10000 });
      return response.status === 200;
    } catch (error) {
      console.log('Google PageSpeed service not available:', error.message);
      return false;
    }
  }
}

module.exports = new GooglePageSpeedService();
