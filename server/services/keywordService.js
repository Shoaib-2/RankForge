const axios = require('axios');
const cheerio = require('cheerio');
const googlePageSpeed = require('./googlePageSpeed');

class KeywordService {
  constructor() {
    // Ensure environment variables are loaded
    require('dotenv').config();
    
    this.GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
    this.GOOGLE_CSE_ID = process.env.GOOGLE_CSE_ID;
    this.SERP_API_BASE = 'https://serpapi.com/search';
    // Using Google's related searches and autocomplete APIs
    this.KEYWORD_TOOLS_API = 'https://suggestqueries.google.com/complete/search';
    
    // Circuit breaker for Google Custom Search API
    this.circuitBreaker = {
      isOpen: false,
      failureCount: 0,
      lastFailureTime: null,
      resetTimeout: 300000, // 5 minutes
      maxFailures: 3
    };
    
    // Reset circuit breaker on startup for testing
    this.resetCircuitBreaker();
    
    // Simple in-memory cache for API results (15 minutes TTL)
    this.cache = new Map();
    this.cacheTimeout = 15 * 60 * 1000; // 15 minutes
    
    // Log API status on startup
    if (!this.GOOGLE_API_KEY || !this.GOOGLE_CSE_ID) {
      console.log('⚠️  Google API Key or CSE ID not found - will use mock data for keyword tracking');
      console.log('Current API Key:', this.GOOGLE_API_KEY ? 'Present' : 'Missing');
      console.log('Current CSE ID:', this.GOOGLE_CSE_ID ? 'Present' : 'Missing');
    } else {
      console.log('✅ Google API Key and CSE ID found - will attempt real keyword tracking');
      console.log('💡 If you get 403 errors, enable Custom Search API at: https://console.developers.google.com/apis/api/customsearch.googleapis.com/overview');
    }
  }

  // Reset circuit breaker (for testing purposes)
  resetCircuitBreaker() {
    this.circuitBreaker.isOpen = false;
    this.circuitBreaker.failureCount = 0;
    this.circuitBreaker.lastFailureTime = null;
    console.log('🔄 Circuit breaker reset - API calls enabled');
  }

  // Check if circuit breaker should allow API calls
  canMakeApiCall() {
    if (!this.circuitBreaker.isOpen) {
      return true;
    }
    
    // Check if we should reset the circuit breaker
    const now = Date.now();
    if (now - this.circuitBreaker.lastFailureTime > this.circuitBreaker.resetTimeout) {
      console.log('🔄 Circuit breaker reset - attempting API calls again');
      this.circuitBreaker.isOpen = false;
      this.circuitBreaker.failureCount = 0;
      return true;
    }
    
    return false;
  }

  // Record API failure
  recordApiFailure() {
    this.circuitBreaker.failureCount++;
    this.circuitBreaker.lastFailureTime = Date.now();
    
    if (this.circuitBreaker.failureCount >= this.circuitBreaker.maxFailures) {
      this.circuitBreaker.isOpen = true;
      console.log(`🚨 Circuit breaker opened - API calls blocked for ${this.circuitBreaker.resetTimeout / 60000} minutes`);
    }
  }

  // Get cached result
  getCachedResult(keyword, domain) {
    const cacheKey = `${keyword}-${domain}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      console.log(`💾 Using cached result for "${keyword}"`);
      return cached.data;
    }
    
    return null;
  }

  // Set cached result
  setCachedResult(keyword, domain, data) {
    const cacheKey = `${keyword}-${domain}`;
    this.cache.set(cacheKey, {
      data,
      timestamp: Date.now()
    });
  }

  // Track keyword ranking using Google Custom Search API
  async trackKeywordRanking(keyword, domain, targetUrl = null) {
    try {
      console.log(`Tracking ranking for keyword: ${keyword}, domain: ${domain}`);
      
      // Normalize domain parameter
      if (!domain || domain === 'null' || domain === 'undefined') {
        domain = null;
      }
      
      // Check cache first
      const cachedResult = this.getCachedResult(keyword, domain);
      if (cachedResult) {
        return cachedResult;
      }
      
      // Check circuit breaker
      if (!this.canMakeApiCall()) {
        console.log('🚨 Circuit breaker is open - using mock data to prevent API quota exhaustion');
        return this.generateMockRankingData(keyword, domain || 'example.com');
      }
      
      // Check if API key and CSE ID are available
      if (!this.GOOGLE_API_KEY || !this.GOOGLE_CSE_ID) {
        console.log('Google API key or CSE ID not found, using mock data');
        return this.generateMockRankingData(keyword, domain || 'example.com');
      }
      
      // Validate and sanitize the keyword
      const sanitizedKeyword = keyword.trim().replace(/[^\w\s-]/g, '');
      if (!sanitizedKeyword || sanitizedKeyword.length < 2) {
        console.log('Invalid keyword, using mock data');
        return this.generateMockRankingData(keyword, domain);
      }
      
      // Validate CSE ID format (should be alphanumeric)
      if (!/^[a-zA-Z0-9]+$/.test(this.GOOGLE_CSE_ID)) {
        console.log('Invalid CSE ID format, using mock data');
        return this.generateMockRankingData(keyword, domain);
      }
      
      // Search in batches to find the actual ranking position (up to 100 results)
      let position = null;
      let foundUrl = null;
      let searchResults = [];
      let rateLimitCount = 0;
      const maxRateLimitRetries = 3;
      
      // Search in batches of 10 results, up to 100 total
      for (let start = 1; start <= 91; start += 10) {
        try {
          const searchResponse = await axios.get('https://www.googleapis.com/customsearch/v1', {
            params: {
              key: this.GOOGLE_API_KEY,
              cx: this.GOOGLE_CSE_ID,
              q: sanitizedKeyword,
              num: 10,
              start: start,
              safe: 'off',
              gl: 'us',
              hl: 'en'
            },
            timeout: 15000,
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
          });
          
          // Reset rate limit counter on successful request
          rateLimitCount = 0;
          
          if (searchResponse.data && searchResponse.data.items) {
            const results = searchResponse.data.items;
            searchResults.push(...results);
            
            // Check if we found our domain in this batch
            for (let i = 0; i < results.length; i++) {
              const result = results[i];
              const resultDomain = this.extractDomain(result.link);
              
              if (domain && domain !== 'null' && domain.trim() !== '') {
                if (resultDomain.includes(domain) || domain.includes(resultDomain)) {
                  position = start + i;
                  foundUrl = result.link;
                  console.log(`✅ Found domain ${domain} at position ${position}`);
                  break;
                }
              }
            }
            
            // If we found the domain, stop searching
            if (position) break;
            
            // If this batch returned less than 10 results, we've reached the end
            if (results.length < 10) break;
            
            // Add a small delay to avoid hitting rate limits
            await new Promise(resolve => setTimeout(resolve, 200));
            
          } else {
            // If no results in this batch, stop searching
            break;
          }
        } catch (batchError) {
          console.log(`Error searching batch starting at ${start}:`, batchError.message);
          
          // Handle rate limiting with circuit breaker
          if (batchError.response?.status === 429) {
            rateLimitCount++;
            this.recordApiFailure(); // Record failure in circuit breaker
            
            if (rateLimitCount >= maxRateLimitRetries) {
              console.log(`❌ Rate limit exceeded ${maxRateLimitRetries} times, stopping search and using available results`);
              break;
            }
            
            const waitTime = Math.min(2000 * Math.pow(2, rateLimitCount - 1), 10000); // Exponential backoff, max 10 seconds
            console.log(`Rate limit hit (${rateLimitCount}/${maxRateLimitRetries}), waiting ${waitTime}ms...`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
            
            // Retry the same batch (don't increment start)
            start -= 10;
            continue;
          }
          
          // For other errors (403, 500, etc.), record failure and stop
          if (batchError.response?.status === 403) {
            console.log('❌ API access denied - check API key and CSE ID permissions');
            this.recordApiFailure();
            break;
          }
          
          // For other errors, record failure and continue
          this.recordApiFailure();
          break;
        }
      }
      
      if (searchResults.length > 0) {
        console.log(`Found ${searchResults.length} total search results for keyword: ${sanitizedKeyword}`);
        
        if (domain && domain !== 'null' && domain.trim() !== '' && !position) {
          console.log(`❌ Domain ${domain} not found in top ${searchResults.length} results`);
          console.log(`Available domains: ${searchResults.slice(0, 10).map(r => this.extractDomain(r.link)).join(', ')}`);
        }
        
        // Generate trendy messages based on position
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
        
        const result = {
          keyword,
          position: position || null,
          url: foundUrl,
          searchVolume: this.estimateSearchVolume(keyword),
          difficulty: this.estimateKeywordDifficulty(keyword),
          date: new Date(),
          domain: domain || null,
          searchResultsCount: searchResults.length,
          domainFound: !!position,
          note: position ? null : (domain ? `🔍 ${domain} isn't ranking in top ${searchResults.length} yet - time to optimize!` : 'No domain specified'),
          trendyMessage: trendyMessage
        };
        
        // Cache the successful result
        this.setCachedResult(keyword, domain, result);
        
        return result;
      }
      
      // Fallback to mock data if API fails
      console.log('No results from Google Custom Search API, using mock data');
      const mockResult = this.generateMockRankingData(keyword, domain || 'example.com');
      mockResult.isMockData = true;
      mockResult.note = '⚡ Using simulated data - API temporarily unavailable';
      mockResult.trendyMessage = mockResult.position ? `🎯 Simulated ranking #${mockResult.position}` : (domain ? `📈 Not in top 100 - huge opportunity!` : null);
      return mockResult;
      
    } catch (error) {
      console.error('Error tracking keyword ranking:', error);
      const mockResult = this.generateMockRankingData(keyword, domain || 'example.com');
      mockResult.isMockData = true;
      mockResult.note = '⚡ Using simulated data - API temporarily unavailable';
      mockResult.trendyMessage = mockResult.position ? `🎯 Simulated ranking #${mockResult.position}` : (domain ? `📈 Not in top 100 - huge opportunity!` : null);
      return mockResult;
    }
  }

  // Extract domain from URL
  extractDomain(url) {
    try {
      const domain = new URL(url).hostname;
      return domain.replace('www.', '');
    } catch {
      return url;
    }
  }

  // Estimate search volume
  estimateSearchVolume(keyword) {
    const words = keyword.split(' ').length;
    let baseVolume = 1000;
    if (words === 1) baseVolume *= 5;
    if (keyword.length < 10) baseVolume *= 2;
    if (keyword.includes('how to')) baseVolume *= 1.5;
    if (keyword.includes('best')) baseVolume *= 1.3;
    return Math.floor(baseVolume + (Math.random() * baseVolume * 0.5));
  }

  // Estimate keyword difficulty
  estimateKeywordDifficulty(keyword) {
    const words = keyword.split(' ').length;
    const isCommercial = ['buy', 'best', 'top', 'review', 'price'].some(term => 
      keyword.toLowerCase().includes(term)
    );
    
    let difficulty = 30;
    if (words === 1) difficulty += 40;
    if (words > 3) difficulty -= 20;
    if (isCommercial) difficulty += 20;
    
    return Math.min(100, Math.max(10, difficulty + Math.floor(Math.random() * 20)));
  }

  // Generate mock ranking data
  generateMockRankingData(keyword, domain) {
    let position = null;
    let url = null;
    
    if (domain && domain !== 'example.com') {
      const popularDomains = ['google.com', 'github.com', 'stackoverflow.com', 'youtube.com', 'wikipedia.org'];
      const isPopular = popularDomains.some(popular => domain.includes(popular) || popular.includes(domain));
      
      if (isPopular) {
        position = Math.floor(Math.random() * 20) + 1;
      } else {
        position = Math.floor(Math.random() * 100) + 1;
      }
      
      url = `https://${domain}`;
    }
    
    // Generate trendy messages based on position
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
    
    return {
      keyword,
      position,
      url,
      searchVolume: this.estimateSearchVolume(keyword),
      difficulty: this.estimateKeywordDifficulty(keyword),
      date: new Date(),
      domain: domain || null,
      searchResultsCount: 10,
      domainFound: !!position,
      note: position ? `🚀 Mock ranking for ${domain}` : (domain ? `🔍 ${domain} isn't ranking in top 100 yet - time to optimize!` : 'No domain specified'),
      trendyMessage: trendyMessage,
      isMockData: true
    };
  }

  // Generate keyword suggestions
  async generateKeywordSuggestions(seedKeyword, domain = null) {
    const suggestions = [
      `best ${seedKeyword}`,
      `${seedKeyword} guide`,
      `how to ${seedKeyword}`,
      `${seedKeyword} tips`,
      `${seedKeyword} tools`
    ];
    return suggestions;
  }

  // Batch track multiple keywords with better rate limiting
  async batchTrackKeywords(keywords, domain, maxConcurrent = 2) {
    const results = [];
    const chunks = [];
    
    // Split keywords into chunks to avoid overwhelming the API
    for (let i = 0; i < keywords.length; i += maxConcurrent) {
      chunks.push(keywords.slice(i, i + maxConcurrent));
    }
    
    console.log(`📊 Tracking ${keywords.length} keywords in ${chunks.length} batches (${maxConcurrent} concurrent)`);
    
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      console.log(`Processing batch ${i + 1}/${chunks.length}: ${chunk.join(', ')}`);
      
      try {
        // Process chunk with concurrent requests
        const chunkPromises = chunk.map(keyword => 
          this.trackKeywordRanking(keyword, domain).catch(error => {
            console.error(`Error tracking keyword "${keyword}":`, error.message);
            return this.generateMockRankingData(keyword, domain);
          })
        );
        
        const chunkResults = await Promise.all(chunkPromises);
        results.push(...chunkResults);
        
        // Add delay between batches to respect rate limits
        if (i < chunks.length - 1) {
          const delay = Math.min(3000 + (i * 1000), 10000); // Progressive delay, max 10 seconds
          console.log(`⏳ Waiting ${delay}ms before next batch...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      } catch (error) {
        console.error(`Error processing batch ${i + 1}:`, error.message);
        // Add mock data for failed batch
        chunk.forEach(keyword => {
          results.push(this.generateMockRankingData(keyword, domain));
        });
      }
    }
    
    console.log(`✅ Completed tracking ${results.length} keywords`);
    return results;
  }

  // Analyze keyword performance
  async analyzeKeywordPerformance(keyword, domain, historicalData = []) {
    const currentRanking = await this.trackKeywordRanking(keyword, domain);
    
    return {
      keyword,
      currentRanking,
      trend: 'stable',
      trendPercentage: 0,
      searchVolume: currentRanking.searchVolume,
      difficulty: currentRanking.difficulty,
      competitors: [],
      opportunities: [],
      lastUpdated: new Date()
    };
  }

  // Get top competitors
  async getTopCompetitors(keyword, excludeDomain) {
    return [
      { domain: 'competitor1.com', position: 1, title: 'Sample Result 1', url: 'https://competitor1.com' },
      { domain: 'competitor2.com', position: 2, title: 'Sample Result 2', url: 'https://competitor2.com' },
      { domain: 'competitor3.com', position: 3, title: 'Sample Result 3', url: 'https://competitor3.com' }
    ];
  }
}

module.exports = new KeywordService();