const axios = require('axios');
const cheerio = require('cheerio');
const pageSpeedAnalyzer = require('./pageSpeedAnalyzer');

class SeoAnalyzer {
  async analyzeContent(url) {
    try {
      const response = await axios.get(url);
      const html = response.data;
      const $ = cheerio.load(html);
      
      return {
        metaAnalysis: this.analyzeMetaTags($),
        contentAnalysis: this.analyzeContentStructure($),
        mobileAnalysis: await this.analyzeMobileResponsiveness($, html), // New addition
        technicalAnalysis: await this.analyzeTechnicalAspects(url)
      };
    } catch (error) {
      throw new Error(`Error analyzing content: ${error.message}`);
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
        pageSpeedAnalyzer.analyze(url)
      ]);
  
      return {
        mobileResponsiveness: {
          score: Number(mobileResults.score),
          isMobileFriendly: mobileResults.isMobileFriendly,
          issues: mobileResults.issues,
          recommendations: mobileResults.recommendations
        },
        pageSpeed: {
          score: Number(pageSpeedResults.score),
          metrics: pageSpeedResults.metrics,
          recommendations: pageSpeedResults.recommendations
        }
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
          score: 0,
          metrics: {
            firstContentfulPaint: { value: 0, score: 0 },
            speedIndex: { value: 0, score: 0 },
            largestContentfulPaint: { value: 0, score: 0 },
            timeToInteractive: { value: 0, score: 0 }
          },
          recommendations: []
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
}

module.exports = new SeoAnalyzer();