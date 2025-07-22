const axios = require('axios');
const cheerio = require('cheerio');
const googlePageSpeed = require('./googlePageSpeed');
const sslAnalyzer = require('./sslAnalyzer');
const cacheService = require('./cacheService');

class SeoAnalyzer {
  constructor() {
    // Enhanced recommendation engine with impact scoring
    this.recommendationEngine = {
      categories: {
        TECHNICAL: 'Technical SEO',
        CONTENT: 'Content Optimization', 
        ON_PAGE: 'On-Page SEO',
        PERFORMANCE: 'Performance',
        MOBILE: 'Mobile & Accessibility',
        SECURITY: 'Security'
      },
      priorities: {
        CRITICAL: { level: 'critical', impact: 10, color: 'red' },
        HIGH: { level: 'high', impact: 8, color: 'orange' },
        MEDIUM: { level: 'medium', impact: 5, color: 'yellow' },
        LOW: { level: 'low', impact: 3, color: 'blue' }
      }
    };
  }

  // Check if a URL is likely to be protected or problematic
  isProtectedSite(url) {
    const protectedDomains = [
      'linkedin.com',
      'indeed.com', 
      'glassdoor.com',
      'monster.com',
      'jobsite.co.uk',
      'cwjobs.co.uk',
      'reed.co.uk',
      'totaljobs.com',
      'facebook.com',
      'twitter.com',
      'instagram.com',
      'tiktok.com',
      'netflix.com',
      'amazon.com',
      'ebay.com'
    ];
    
    const domain = new URL(url).hostname.toLowerCase();
    return protectedDomains.some(protectedDomain => domain.includes(protectedDomain));
  }

  // Provide alternative analysis for protected sites
  async getAlternativeAnalysis(url) {
    return {
      url,
      isProtected: true,
      message: "This site uses anti-bot protection. Here's what we can analyze:",
      basicChecks: {
        ssl: await this.checkSSL(url),
        domain: this.analyzeDomain(url),
        publicInfo: this.getPublicSiteInfo(url)
      },
      recommendations: [
        {
          category: 'ANALYSIS_LIMITATION',
          priority: 'INFO',
          title: 'Protected Site Detected',
          description: 'This website uses protection against automated analysis (Cloudflare, rate limiting, etc.)',
          suggestion: 'For detailed SEO analysis of protected sites, consider: 1) Manual analysis, 2) Using the site\'s public APIs if available, 3) Analyzing less protected pages of the same domain'
        }
      ]
    };
  }

  checkSSL(url) {
    return url.startsWith('https://') ? 
      { hasSSL: true, score: 100 } : 
      { hasSSL: false, score: 0 };
  }

  analyzeDomain(url) {
    const domain = new URL(url).hostname;
    return {
      domain,
      isSubdomain: domain.split('.').length > 2,
      tld: domain.split('.').pop()
    };
  }

  getPublicSiteInfo(url) {
    const domain = new URL(url).hostname;
    return {
      domain,
      checkSuggestions: [
        `Check ${domain} robots.txt: ${url}/robots.txt`,
        `Check ${domain} sitemap: ${url}/sitemap.xml`,
        `Use tools like GTmetrix or PageSpeed Insights manually`,
        `Check domain authority on MOZ or similar tools`
      ]
    };
  }
  
  async analyzeContent(url) {
    try {
      console.log('Starting comprehensive SEO analysis for:', url);
      
      // Check cache first
      const cachedResult = cacheService.getSeoAnalysis(url);
      if (cachedResult) {
        console.log('SEO analysis cache hit for:', url);
        return cachedResult;
      }

      // Enhanced headers to appear more like a real browser
      const headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Cache-Control': 'max-age=0'
      };

      // Fetch page content with enhanced configuration
      const response = await axios.get(url, {
        timeout: 30000, // Increased timeout to 30 seconds
        maxRedirects: 5,
        headers,
        validateStatus: function (status) {
          return status >= 200 && status < 400; // Accept redirects
        }
      });
      
      const html = response.data;
      const $ = cheerio.load(html);
      
      // Run analyses in parallel for better performance
      const [
        metaAnalysis,
        contentAnalysis,
        mobileAnalysis,
        pageSpeedAnalysis,
        sslAnalysis
      ] = await Promise.all([
        this.analyzeMetaTags($),
        this.analyzeContentStructure($),
        this.analyzeMobileResponsiveness($, html),
        googlePageSpeed.analyzePageSpeed(url),
        sslAnalyzer.analyzeSSL(url)
      ]);

      const result = {
        metaAnalysis,
        contentAnalysis,
        mobileAnalysis,
        technicalAnalysis: {
          pageSpeed: pageSpeedAnalysis,
          ssl: sslAnalysis,
          mobileResponsiveness: mobileAnalysis
        }
      };

      // Generate comprehensive recommendations
      result.recommendations = this.generateEnhancedRecommendations(result, $, url);
      result.score = this.calculateSEOScore(result);

      // Cache the result if the URL is cacheable
      if (cacheService.shouldCache(url)) {
        cacheService.setSeoAnalysis(url, result);
      }

      return result;
    } catch (error) {
      console.error('Error analyzing content:', error.message);
      
      // Handle specific error types with helpful messages
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        throw new Error(`Website analysis timed out. This site (${url}) may have anti-bot protection or be heavily protected against automated analysis. Try analyzing a different URL or the site's robots.txt might restrict access.`);
      } else if (error.response?.status === 403) {
        throw new Error(`Access denied (403). This site (${url}) blocks automated requests. Many job sites and large platforms use Cloudflare or similar protection.`);
      } else if (error.response?.status === 429) {
        throw new Error(`Rate limited (429). This site (${url}) is temporarily blocking requests due to high traffic. Please try again later.`);
      } else if (error.response?.status >= 500) {
        throw new Error(`Server error (${error.response.status}). The target website (${url}) is experiencing issues.`);
      } else {
        throw new Error(`Error analyzing content: ${error.message}`);
      }
    }
  }

  analyzeMetaTags($) {
    const metaData = {
      title: $('title').text(),
      description: $('meta[name="description"]').attr('content'),
      keywords: $('meta[name="keywords"]').attr('content'),
      recommendations: []
    };

    // Title analysis
    if (!metaData.title) {
      metaData.recommendations.push({
        type: 'error',
        message: 'Missing title tag'
      });
    } else if (metaData.title.length < 30 || metaData.title.length > 60) {
      metaData.recommendations.push({
        type: 'warning',
        message: 'Title length should be between 30-60 characters'
      });
    }


    // Description analysis
    if (!metaData.description) {
      metaData.recommendations.push({
        type: 'error',
        message: 'Missing meta description'
      });
    } else if (metaData.description.length < 120 || metaData.description.length > 160) {
      metaData.recommendations.push({
        type: 'warning',
        message: 'Meta description should be between 120-160 characters'
      });
    }

    return metaData;
  }

  analyzeContentStructure($) {
    const content = {
      wordCount: $('body').text().trim().split(/\s+/).length,
      headings: {
        h1: $('h1').length,
        h2: $('h2').length,
        h3: $('h3').length
      },
      images: {
        total: $('img').length,
        withAlt: $('img[alt]').length,
        withoutAlt: $('img:not([alt])').length
      },
      paragraphs: $('p').length,
      recommendations: []
    };

    // Content length analysis
    if (content.wordCount < 300) {
      content.recommendations.push({
        type: 'error',
        message: 'Content length is too short. Aim for at least 300 words.'
      });
    }

    // Heading structure analysis
    if (content.headings.h1 === 0) {
      content.recommendations.push({
        type: 'error',
        message: 'No H1 heading found'
      });
    } else if (content.headings.h1 > 1) {
      content.recommendations.push({
        type: 'warning',
        message: 'Multiple H1 headings found. Consider using only one.'
      });
    }

    // Image optimization analysis
    if (content.images.withoutAlt > 0) {
      content.recommendations.push({
        type: 'error',
        message: `${content.images.withoutAlt} images missing alt text`
      });
    }

    // Paragraph structure analysis
    if (content.paragraphs < 3) {
      content.recommendations.push({
        type: 'warning',
        message: 'Consider adding more paragraphs for better content structure'
      });
    }

    return content;
  }

   // New method for mobile responsiveness analysis
   async analyzeMobileResponsiveness($, html) {
    // Check viewport meta tag
    const viewport = $('meta[name="viewport"]').attr('content');

    // Analyze responsive images
    const images = {
      total: $('img').length,
      responsive: $('img[srcset], img[sizes], picture source[srcset]').length
    };

    // Check for media queries in the HTML
    const mediaQueries = (html.match(/@media\s*([^{]+)/g) || []).length;
    
    // Analyze touch targets (buttons, links)
    const smallTouchTargets = $('a, button').filter(function() {
      const width = $(this).css('width');
      const height = $(this).css('height');
      return (parseInt(width) < 44 || parseInt(height) < 44);
    }).length;

    // Check font sizes for readability
    const smallFonts = $('*').filter(function() {
      const fontSize = $(this).css('font-size');
      return fontSize && parseInt(fontSize) < 16;
    }).length;

    const recommendations = [];
    let score = 100;

    // Score calculations and recommendations
    if (!viewport) {
      score -= 30;
      recommendations.push({
        type: 'error',
        message: 'Add a viewport meta tag for mobile optimization'
      });
    }

    if (images.total > 0 && images.responsive < images.total) {
      score -= 20;
      recommendations.push({
        type: 'warning',
        message: `Make images responsive using srcset or picture elements (${images.responsive}/${images.total} done)`
      });
    }

    if (mediaQueries === 0) {
      score -= 20;
      recommendations.push({
        type: 'error',
        message: 'No media queries found. Add responsive design breakpoints'
      });
    }

    if (smallTouchTargets > 0) {
      score -= Math.min(20, smallTouchTargets * 2);
      recommendations.push({
        type: 'warning',
        message: `Increase size of ${smallTouchTargets} touch targets to at least 44x44px`
      });
    }

    if (smallFonts > 0) {
      score -= Math.min(10, smallFonts);
      recommendations.push({
        type: 'warning',
        message: `Increase font size for ${smallFonts} elements to at least 16px`
      });
    }

    // Return mobile analysis results
    return {
      score: Math.max(0, Math.round(score)),
      metrics: {
        viewport: !!viewport,
        responsiveImages: images.responsive / images.total,
        mediaQueries,
        smallTouchTargets,
        smallFonts
      },
      recommendations
    };
  }

  async analyzeTechnicalAspects(url) {
    try {
      const [mobileResults, pageSpeedResults] = await Promise.all([
        this.checkMobileResponsiveness(url),
        googlePageSpeed.analyzePageSpeed(url)
      ]);
  
      return {
        mobileResponsiveness: {
          score: Number(mobileResults.score),
          isMobileFriendly: mobileResults.isMobileFriendly,
          issues: mobileResults.issues,
          recommendations: mobileResults.recommendations
        },
        pageSpeed: pageSpeedResults // This already comes with mobile and desktop data
      };
    } catch (error) {
      console.error('Technical analysis error:', error);
      return {
        mobileResponsiveness: {
          score: 0,
          isMobileFriendly: false,
          issues: [],
          recommendations: []
        },
        pageSpeed: {
          mobile: {
            score: 0,
            coreWebVitals: {
              firstContentfulPaint: { value: 0, score: 0 },
              speedIndex: { value: 0, score: 0 },
              largestContentfulPaint: { value: 0, score: 0 },
              timeToInteractive: { value: 0, score: 0 }
            },
            opportunities: []
          },
          desktop: {
            score: 0,
            coreWebVitals: {
              firstContentfulPaint: { value: 0, score: 0 },
              speedIndex: { value: 0, score: 0 },
              largestContentfulPaint: { value: 0, score: 0 },
              timeToInteractive: { value: 0, score: 0 }
            },
            opportunities: []
          }
        }
      };
    }
  }

  // Updated mobile responsiveness check to use more detailed data
  async checkMobileResponsiveness(url) {
    // This now returns a more detailed structure
    return {
      isMobileFriendly: true,
      issues: [],
      details: {
        viewportPresent: true,
        touchTargetsSuitable: true,
        fontSizesAdequate: true
      }
    };
  }

  async checkPageSpeed(url) {
    // Mock implementation - would be replaced with real page speed test
    return {
      score: 85,
      metrics: {
        firstContentfulPaint: '1.2s',
        speedIndex: '2.1s',
        largestContentfulPaint: '2.5s'
      }
    };
  }

  // Enhanced recommendation generation system
  generateEnhancedRecommendations(analysis, $, url) {
    const recommendations = [];
    
    // Technical SEO Recommendations
    recommendations.push(...this.generateTechnicalRecommendations(analysis, $, url));
    
    // Content Optimization Recommendations
    recommendations.push(...this.generateContentRecommendations(analysis, $));
    
    // On-Page SEO Recommendations
    recommendations.push(...this.generateOnPageRecommendations(analysis, $));
    
    // Performance Recommendations
    recommendations.push(...this.generatePerformanceRecommendations(analysis));
    
    // Mobile & Accessibility Recommendations
    recommendations.push(...this.generateMobileRecommendations(analysis, $));
    
    // Security Recommendations
    recommendations.push(...this.generateSecurityRecommendations(analysis, url));
    
    // Sort by priority and impact
    return recommendations.sort((a, b) => {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  generateTechnicalRecommendations(analysis, $, url) {
    const recommendations = [];
    const { categories, priorities } = this.recommendationEngine;

    // Schema markup check
    const structuredData = $('script[type="application/ld+json"]');
    if (structuredData.length === 0) {
      recommendations.push({
        category: categories.TECHNICAL,
        title: 'Add Schema Markup',
        priority: priorities.HIGH.level,
        impact: priorities.HIGH.impact,
        description: 'Schema markup helps search engines understand your content better and can improve rich snippets.',
        actionItems: [
          'Add Organization schema for business information',
          'Implement WebPage schema for page content',
          'Add Product schema if applicable',
          'Use Google\'s Structured Data Testing Tool to validate'
        ],
        timeEstimate: '2-4 hours',
        expectedImpact: 'Improved search result appearance and potential rich snippets'
      });
    }

    // Robots.txt check
    const robotsMeta = $('meta[name="robots"]');
    if (robotsMeta.length === 0) {
      recommendations.push({
        category: categories.TECHNICAL,
        title: 'Add Robots Meta Tag',
        priority: priorities.MEDIUM.level,
        impact: priorities.MEDIUM.impact,
        description: 'Robots meta tags give search engines specific instructions about how to crawl and index your page.',
        actionItems: [
          'Add <meta name="robots" content="index, follow"> for normal pages',
          'Use "noindex" for pages you don\'t want indexed',
          'Implement canonical tags for duplicate content'
        ],
        timeEstimate: '30 minutes',
        expectedImpact: 'Better control over search engine crawling and indexing'
      });
    }

    // XML Sitemap check (basic implementation)
    recommendations.push({
      category: categories.TECHNICAL,
      title: 'XML Sitemap Optimization',
      priority: priorities.MEDIUM.level,
      impact: priorities.MEDIUM.impact,
      description: 'Ensure your XML sitemap is properly configured and submitted to search engines.',
      actionItems: [
        'Create or update XML sitemap with all important pages',
        'Submit sitemap to Google Search Console',
        'Include lastmod dates for better crawl efficiency',
        'Keep sitemap under 50MB and 50,000 URLs'
      ],
      timeEstimate: '1-2 hours',
      expectedImpact: 'Improved search engine discovery and indexing of your pages'
    });

    return recommendations;
  }

  generateContentRecommendations(analysis, $) {
    const recommendations = [];
    const { categories, priorities } = this.recommendationEngine;

    // Content length analysis
    const textContent = $('body').text().replace(/\s+/g, ' ').trim();
    const wordCount = textContent.split(' ').length;
    
    if (wordCount < 300) {
      recommendations.push({
        category: categories.CONTENT,
        title: 'Increase Content Length',
        priority: priorities.HIGH.level,
        impact: priorities.HIGH.impact,
        description: `Your page has only ${wordCount} words. Pages with substantial content typically perform better in search results.`,
        actionItems: [
          'Aim for at least 300-500 words of quality content',
          'Add detailed descriptions and explanations',
          'Include relevant examples and case studies',
          'Ensure content provides value to users'
        ],
        timeEstimate: '2-4 hours',
        expectedImpact: 'Better search rankings and user engagement'
      });
    }

    // Heading structure analysis
    const headings = {
      h1: $('h1').length,
      h2: $('h2').length,
      h3: $('h3').length
    };

    if (headings.h1 === 0) {
      recommendations.push({
        category: categories.CONTENT,
        title: 'Add H1 Heading',
        priority: priorities.CRITICAL.level,
        impact: priorities.CRITICAL.impact,
        description: 'Missing H1 tag. Every page should have exactly one H1 tag that describes the main topic.',
        actionItems: [
          'Add a single H1 tag near the top of your page',
          'Include your primary keyword in the H1',
          'Keep H1 under 60 characters',
          'Make sure H1 accurately describes page content'
        ],
        timeEstimate: '15 minutes',
        expectedImpact: 'Significant improvement in search engine understanding and rankings'
      });
    } else if (headings.h1 > 1) {
      recommendations.push({
        category: categories.CONTENT,
        title: 'Fix Multiple H1 Tags',
        priority: priorities.HIGH.level,
        impact: priorities.HIGH.impact,
        description: `Found ${headings.h1} H1 tags. Use only one H1 per page for better SEO.`,
        actionItems: [
          'Keep only one H1 tag for the main page topic',
          'Convert other H1s to H2 or H3 tags',
          'Ensure proper heading hierarchy (H1 > H2 > H3)',
          'Use headings to create logical content structure'
        ],
        timeEstimate: '30 minutes',
        expectedImpact: 'Improved content structure and search engine understanding'
      });
    }

    // Image alt text analysis
    const images = $('img');
    const imagesWithoutAlt = images.filter((i, img) => !$(img).attr('alt')).length;
    
    if (imagesWithoutAlt > 0) {
      recommendations.push({
        category: categories.CONTENT,
        title: 'Add Alt Text to Images',
        priority: priorities.HIGH.level,
        impact: priorities.HIGH.impact,
        description: `${imagesWithoutAlt} images are missing alt text. Alt text improves accessibility and SEO.`,
        actionItems: [
          'Add descriptive alt text to all images',
          'Include relevant keywords naturally',
          'Keep alt text under 125 characters',
          'Use empty alt="" for decorative images'
        ],
        timeEstimate: '1-2 hours',
        expectedImpact: 'Better accessibility and image search rankings'
      });
    }

    return recommendations;
  }

  generateOnPageRecommendations(analysis, $) {
    const recommendations = [];
    const { categories, priorities } = this.recommendationEngine;

    // Meta description analysis
    if (!analysis.metaAnalysis.description) {
      recommendations.push({
        category: categories.ON_PAGE,
        title: 'Add Meta Description',
        priority: priorities.CRITICAL.level,
        impact: priorities.CRITICAL.impact,
        description: 'Missing meta description. This is crucial for search result snippets and click-through rates.',
        actionItems: [
          'Write a compelling 120-160 character meta description',
          'Include your primary keyword naturally',
          'Create a unique description for each page',
          'Focus on what users will gain from visiting your page'
        ],
        timeEstimate: '30 minutes',
        expectedImpact: 'Improved click-through rates from search results'
      });
    }

    // Title tag analysis
    if (!analysis.metaAnalysis.title) {
      recommendations.push({
        category: categories.ON_PAGE,
        title: 'Add Title Tag',
        priority: priorities.CRITICAL.level,
        impact: priorities.CRITICAL.impact,
        description: 'Missing title tag. This is one of the most important on-page SEO elements.',
        actionItems: [
          'Create a unique, descriptive title for the page',
          'Keep title between 30-60 characters',
          'Include primary keyword near the beginning',
          'Make it compelling for users to click'
        ],
        timeEstimate: '15 minutes',
        expectedImpact: 'Major improvement in search rankings and click-through rates'
      });
    }

    // Internal linking analysis
    const internalLinks = $('a[href^="/"], a[href*="' + ($('link[rel="canonical"]').attr('href') || '') + '"]').length;
    if (internalLinks < 3) {
      recommendations.push({
        category: categories.ON_PAGE,
        title: 'Improve Internal Linking',
        priority: priorities.MEDIUM.level,
        impact: priorities.MEDIUM.impact,
        description: 'Limited internal linking detected. Internal links help search engines understand site structure.',
        actionItems: [
          'Add 3-5 relevant internal links per page',
          'Use descriptive anchor text with keywords',
          'Link to related content and important pages',
          'Create a logical site hierarchy'
        ],
        timeEstimate: '1 hour',
        expectedImpact: 'Better page authority distribution and user engagement'
      });
    }

    return recommendations;
  }

  generatePerformanceRecommendations(analysis) {
    const recommendations = [];
    const { categories, priorities } = this.recommendationEngine;

    if (analysis.technicalAnalysis.pageSpeed) {
      const pageSpeed = analysis.technicalAnalysis.pageSpeed;
      
      if (pageSpeed.score < 70) {
        recommendations.push({
          category: categories.PERFORMANCE,
          title: 'Improve Page Speed',
          priority: priorities.HIGH.level,
          impact: priorities.HIGH.impact,
          description: `Page speed score is ${pageSpeed.score}/100. Faster pages rank better and provide better user experience.`,
          actionItems: [
            'Optimize and compress images (use WebP format)',
            'Enable browser caching and compression',
            'Minify CSS, JavaScript, and HTML',
            'Use a Content Delivery Network (CDN)',
            'Eliminate render-blocking resources'
          ],
          timeEstimate: '4-8 hours',
          expectedImpact: 'Improved rankings, user experience, and conversion rates'
        });
      }

      // Core Web Vitals recommendations
      if (pageSpeed.metrics) {
        const lcp = parseFloat(pageSpeed.metrics.largestContentfulPaint?.value);
        if (lcp > 2.5) {
          recommendations.push({
            category: categories.PERFORMANCE,
            title: 'Optimize Largest Contentful Paint (LCP)',
            priority: priorities.HIGH.level,
            impact: priorities.HIGH.impact,
            description: `LCP is ${lcp}s (should be under 2.5s). This affects Core Web Vitals scoring.`,
            actionItems: [
              'Optimize server response times',
              'Implement efficient image loading',
              'Preload important resources',
              'Remove unnecessary third-party scripts'
            ],
            timeEstimate: '3-6 hours',
            expectedImpact: 'Better Core Web Vitals and search rankings'
          });
        }
      }
    }

    return recommendations;
  }

  generateMobileRecommendations(analysis, $) {
    const recommendations = [];
    const { categories, priorities } = this.recommendationEngine;

    // Viewport meta tag check
    const viewport = $('meta[name="viewport"]');
    if (viewport.length === 0) {
      recommendations.push({
        category: categories.MOBILE,
        title: 'Add Viewport Meta Tag',
        priority: priorities.CRITICAL.level,
        impact: priorities.CRITICAL.impact,
        description: 'Missing viewport meta tag. This is essential for mobile responsiveness.',
        actionItems: [
          'Add <meta name="viewport" content="width=device-width, initial-scale=1">',
          'Test mobile responsiveness across devices',
          'Ensure touch targets are at least 44px',
          'Use readable font sizes (16px minimum)'
        ],
        timeEstimate: '1-2 hours',
        expectedImpact: 'Proper mobile display and better mobile search rankings'
      });
    }

    // Font size check
    const smallFonts = $('*').filter(function() {
      const fontSize = $(this).css('font-size');
      return fontSize && parseFloat(fontSize) < 16;
    }).length;

    if (smallFonts > 0) {
      recommendations.push({
        category: categories.MOBILE,
        title: 'Improve Mobile Font Sizes',
        priority: priorities.MEDIUM.level,
        impact: priorities.MEDIUM.impact,
        description: 'Some text appears to be too small for mobile devices.',
        actionItems: [
          'Use minimum 16px font size for body text',
          'Ensure good contrast ratios (4.5:1 minimum)',
          'Test readability on mobile devices',
          'Use responsive typography'
        ],
        timeEstimate: '2-3 hours',
        expectedImpact: 'Better mobile user experience and accessibility'
      });
    }

    return recommendations;
  }

  generateSecurityRecommendations(analysis, url) {
    const recommendations = [];
    const { categories, priorities } = this.recommendationEngine;

    // HTTPS check
    if (!url.startsWith('https://')) {
      recommendations.push({
        category: categories.SECURITY,
        title: 'Implement HTTPS',
        priority: priorities.CRITICAL.level,
        impact: priorities.CRITICAL.impact,
        description: 'Your site is not using HTTPS. This is a confirmed ranking factor and security requirement.',
        actionItems: [
          'Purchase and install an SSL certificate',
          'Set up 301 redirects from HTTP to HTTPS',
          'Update internal links to use HTTPS',
          'Submit new HTTPS URLs to search engines'
        ],
        timeEstimate: '2-4 hours',
        expectedImpact: 'Improved security, user trust, and search rankings'
      });
    }

    // Security headers check (basic)
    if (analysis.technicalAnalysis.ssl && !analysis.technicalAnalysis.ssl.secure) {
      recommendations.push({
        category: categories.SECURITY,
        title: 'Improve Security Headers',
        priority: priorities.MEDIUM.level,
        impact: priorities.MEDIUM.impact,
        description: 'Add security headers to protect against common web vulnerabilities.',
        actionItems: [
          'Implement Content Security Policy (CSP)',
          'Add X-Frame-Options header',
          'Set X-Content-Type-Options to nosniff',
          'Add Strict-Transport-Security header'
        ],
        timeEstimate: '1-3 hours',
        expectedImpact: 'Enhanced security and potential SEO benefits'
      });
    }

    return recommendations;
  }

  calculateSEOScore(analysis) {
    let score = 100;
    const deductions = {
      critical: 25,
      high: 15,
      medium: 8,
      low: 3
    };

    // Count recommendations by priority
    const priorityCounts = {
      critical: 0,
      high: 0, 
      medium: 0,
      low: 0
    };

    if (analysis.recommendations) {
      analysis.recommendations.forEach(rec => {
        priorityCounts[rec.priority]++;
      });
    }

    // Apply deductions
    Object.keys(priorityCounts).forEach(priority => {
      score -= priorityCounts[priority] * deductions[priority];
    });

    // Ensure score doesn't go below 0
    return Math.max(0, Math.min(100, score));
  }
}

module.exports = new SeoAnalyzer();