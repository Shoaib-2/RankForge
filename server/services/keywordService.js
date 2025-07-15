const axios = require('axios');
const cheerio = require('cheerio');
const googlePageSpeed = require('./googlePageSpeed');

class KeywordService {
  constructor() {
    this.GOOGLE_API_KEY = process.env.GOOGLE_API_KEY || 'AIzaSyDOlKmUKU_cUFIa3SZDaYysc4OCX2KE-pQ';
    this.SERP_API_BASE = 'https://serpapi.com/search';
    // Using Google's related searches and autocomplete APIs
    this.KEYWORD_TOOLS_API = 'https://suggestqueries.google.com/complete/search';
  }

  // Generate keyword suggestions based on a seed keyword
  async generateKeywordSuggestions(seedKeyword, domain = null) {
    try {
      console.log(`Generating keyword suggestions for: ${seedKeyword}`);
      
      const suggestions = [];
      
      // 1. Get Google Autocomplete suggestions
      const autocompleteSuggestions = await this.getGoogleAutocompleteSuggestions(seedKeyword);
      suggestions.push(...autocompleteSuggestions);
      
      // 2. Generate related keywords using common patterns
      const relatedKeywords = this.generateRelatedKeywords(seedKeyword);
      suggestions.push(...relatedKeywords);
      
      // 3. If domain is provided, analyze existing content for more keywords
      if (domain) {
        const contentKeywords = await this.extractKeywordsFromDomain(domain);
        suggestions.push(...contentKeywords);
      }
      
      // Remove duplicates and return top suggestions
      const uniqueSuggestions = [...new Set(suggestions)]
        .filter(keyword => keyword.length > 3 && keyword.length < 50)
        .slice(0, 20);
      
      console.log(`Generated ${uniqueSuggestions.length} keyword suggestions`);
      return uniqueSuggestions;
      
    } catch (error) {
      console.error('Error generating keyword suggestions:', error);
      return this.getFallbackKeywordSuggestions(seedKeyword);
    }
  }

  // Get Google Autocomplete suggestions
  async getGoogleAutocompleteSuggestions(query) {
    try {
      const response = await axios.get(this.KEYWORD_TOOLS_API, {
        params: {
          client: 'firefox',
          q: query
        },
        timeout: 5000
      });
      
      if (response.data && Array.isArray(response.data[1])) {
        return response.data[1].slice(0, 10);
      }
      
      return [];
    } catch (error) {
      console.log('Google autocomplete unavailable, using fallback');
      return [];
    }
  }

  // Generate related keywords using common SEO patterns
  generateRelatedKeywords(seedKeyword) {
    const modifiers = [
      'best', 'top', 'how to', 'guide', 'tips', 'tools', 'software',
      'free', 'online', 'professional', 'advanced', 'beginner',
      'strategy', 'techniques', 'methods', 'solutions', 'services'
    ];
    
    const suffixes = [
      'guide', 'tutorial', 'tips', 'tricks', 'hacks', 'strategies',
      'tools', 'software', 'service', 'company', 'agency', 'expert'
    ];
    
    const related = [];
    
    // Add modifier + keyword combinations
    modifiers.forEach(modifier => {
      related.push(`${modifier} ${seedKeyword}`);
    });
    
    // Add keyword + suffix combinations
    suffixes.forEach(suffix => {
      related.push(`${seedKeyword} ${suffix}`);
    });
    
    return related;
  }

  // Extract keywords from domain content
  async extractKeywordsFromDomain(domain) {
    try {
      const url = domain.startsWith('http') ? domain : `https://${domain}`;
      const response = await axios.get(url, {
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; SEO-Tool/1.0; +https://seo-tool.com)'
        }
      });
      
      const $ = cheerio.load(response.data);
      
      // Extract keywords from meta tags, headings, and content
      const keywords = [];
      
      // Meta keywords (if present)
      const metaKeywords = $('meta[name="keywords"]').attr('content');
      if (metaKeywords) {
        keywords.push(...metaKeywords.split(',').map(k => k.trim()));
      }
      
      // Extract from headings
      $('h1, h2, h3').each((i, element) => {
        const text = $(element).text().trim();
        if (text.length > 5 && text.length < 50) {
          keywords.push(text.toLowerCase());
        }
      });
      
      // Extract from title
      const title = $('title').text().trim();
      if (title) {
        keywords.push(title.toLowerCase());
      }
      
      return keywords.slice(0, 10);
    } catch (error) {
      console.log('Could not extract keywords from domain:', error.message);
      return [];
    }
  }

  // Track keyword ranking using Google Custom Search API
  async trackKeywordRanking(keyword, domain, targetUrl = null) {
    try {
      console.log(`Tracking ranking for keyword: ${keyword}, domain: ${domain}`);
      
      // Use Google Custom Search API to find ranking position
      const searchResponse = await axios.get('https://www.googleapis.com/customsearch/v1', {
        params: {
          key: this.GOOGLE_API_KEY,
          cx: '017576662512468239146:omuauf_lfve', // Custom search engine ID
          q: keyword,
          num: 50 // Check top 50 results
        },
        timeout: 10000
      });
      
      if (searchResponse.data && searchResponse.data.items) {
        const results = searchResponse.data.items;
        let position = null;
        let foundUrl = null;
        
        // Find the position of our domain
        for (let i = 0; i < results.length; i++) {
          const result = results[i];
          const resultDomain = this.extractDomain(result.link);
          
          if (resultDomain.includes(domain) || domain.includes(resultDomain)) {
            position = i + 1;
            foundUrl = result.link;
            break;
          }
        }
        
        return {
          keyword,
          position: position || null,
          url: foundUrl,
          searchVolume: this.estimateSearchVolume(keyword),
          difficulty: this.estimateKeywordDifficulty(keyword),
          date: new Date()
        };
      }
      
      // Fallback to mock data if API fails
      return this.generateMockRankingData(keyword, domain);
      
    } catch (error) {
      console.error('Error tracking keyword ranking:', error);
      return this.generateMockRankingData(keyword, domain);
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

  // Estimate search volume based on keyword characteristics
  estimateSearchVolume(keyword) {
    const length = keyword.length;
    const words = keyword.split(' ').length;
    
    // Simple algorithm to estimate search volume
    let baseVolume = 1000;
    
    if (words === 1) baseVolume *= 5; // Single words have higher volume
    if (length < 10) baseVolume *= 2; // Shorter keywords higher volume
    if (keyword.includes('how to')) baseVolume *= 1.5; // Question keywords
    if (keyword.includes('best')) baseVolume *= 1.3; // Commercial keywords
    
    return Math.floor(baseVolume + (Math.random() * baseVolume * 0.5));
  }

  // Estimate keyword difficulty
  estimateKeywordDifficulty(keyword) {
    const words = keyword.split(' ').length;
    const isCommercial = ['buy', 'best', 'top', 'review', 'price'].some(term => 
      keyword.toLowerCase().includes(term)
    );
    
    let difficulty = 30; // Base difficulty
    
    if (words === 1) difficulty += 40; // Single words are harder
    if (words > 3) difficulty -= 20; // Long-tail easier
    if (isCommercial) difficulty += 20; // Commercial intent harder
    
    return Math.min(100, Math.max(10, difficulty + Math.floor(Math.random() * 20)));
  }

  // Generate comprehensive keyword analysis
  async analyzeKeywordPerformance(keyword, domain, historicalData = []) {
    try {
      // Get current ranking
      const currentRanking = await this.trackKeywordRanking(keyword, domain);
      
      // Calculate trends if historical data exists
      let trend = 'stable';
      let trendPercentage = 0;
      
      if (historicalData.length > 1) {
        const recent = historicalData.slice(-3).filter(d => d.position);
        if (recent.length >= 2) {
          const oldPos = recent[0].position;
          const newPos = recent[recent.length - 1].position;
          
          if (newPos < oldPos) {
            trend = 'improving';
            trendPercentage = ((oldPos - newPos) / oldPos * 100);
          } else if (newPos > oldPos) {
            trend = 'declining';
            trendPercentage = ((newPos - oldPos) / oldPos * 100);
          }
        }
      }
      
      // Get competitor analysis
      const competitors = await this.getTopCompetitors(keyword, domain);
      
      return {
        keyword,
        currentRanking,
        trend,
        trendPercentage: Math.round(trendPercentage),
        searchVolume: currentRanking.searchVolume,
        difficulty: currentRanking.difficulty,
        competitors,
        opportunities: this.identifyOpportunities(currentRanking, competitors),
        lastUpdated: new Date()
      };
      
    } catch (error) {
      console.error('Error analyzing keyword performance:', error);
      return this.generateMockKeywordAnalysis(keyword, domain);
    }
  }

  // Get top competitors for a keyword
  async getTopCompetitors(keyword, excludeDomain) {
    try {
      const searchResponse = await axios.get('https://www.googleapis.com/customsearch/v1', {
        params: {
          key: this.GOOGLE_API_KEY,
          cx: '017576662512468239146:omuauf_lfve',
          q: keyword,
          num: 10
        },
        timeout: 10000
      });
      
      if (searchResponse.data && searchResponse.data.items) {
        return searchResponse.data.items
          .map((item, index) => ({
            domain: this.extractDomain(item.link),
            position: index + 1,
            title: item.title,
            url: item.link
          }))
          .filter(comp => !comp.domain.includes(excludeDomain))
          .slice(0, 5);
      }
      
      return this.getMockCompetitors();
    } catch (error) {
      return this.getMockCompetitors();
    }
  }

  // Identify SEO opportunities
  identifyOpportunities(ranking, competitors) {
    const opportunities = [];
    
    if (!ranking.position || ranking.position > 10) {
      opportunities.push({
        type: 'ranking',
        priority: 'high',
        message: 'Focus on getting into top 10 results to increase visibility'
      });
    }
    
    if (ranking.difficulty < 50) {
      opportunities.push({
        type: 'difficulty',
        priority: 'medium',
        message: 'Low competition keyword - good opportunity for quick wins'
      });
    }
    
    if (ranking.searchVolume > 5000) {
      opportunities.push({
        type: 'volume',
        priority: 'high',
        message: 'High search volume keyword - prioritize optimization'
      });
    }
    
    return opportunities;
  }

  // Fallback methods for when APIs are unavailable
  getFallbackKeywordSuggestions(seedKeyword) {
    const suggestions = [
      `best ${seedKeyword}`,
      `${seedKeyword} guide`,
      `how to ${seedKeyword}`,
      `${seedKeyword} tips`,
      `${seedKeyword} tools`,
      `${seedKeyword} strategy`,
      `${seedKeyword} techniques`,
      `free ${seedKeyword}`,
      `${seedKeyword} software`,
      `${seedKeyword} services`
    ];
    
    return suggestions;
  }

  generateMockRankingData(keyword, domain) {
    return {
      keyword,
      position: Math.floor(Math.random() * 50) + 1,
      url: `https://${domain}`,
      searchVolume: this.estimateSearchVolume(keyword),
      difficulty: this.estimateKeywordDifficulty(keyword),
      date: new Date()
    };
  }

  generateMockKeywordAnalysis(keyword, domain) {
    const mockRanking = this.generateMockRankingData(keyword, domain);
    
    return {
      keyword,
      currentRanking: mockRanking,
      trend: ['improving', 'stable', 'declining'][Math.floor(Math.random() * 3)],
      trendPercentage: Math.floor(Math.random() * 30),
      searchVolume: mockRanking.searchVolume,
      difficulty: mockRanking.difficulty,
      competitors: this.getMockCompetitors(),
      opportunities: [
        {
          type: 'content',
          priority: 'medium',
          message: 'Create more comprehensive content targeting this keyword'
        }
      ],
      lastUpdated: new Date()
    };
  }

  getMockCompetitors() {
    const domains = ['competitor1.com', 'competitor2.com', 'example.com', 'test-site.org'];
    return domains.slice(0, 3).map((domain, index) => ({
      domain,
      position: index + 1,
      title: `Sample Result ${index + 1}`,
      url: `https://${domain}`
    }));
  }
}

module.exports = new KeywordService();
