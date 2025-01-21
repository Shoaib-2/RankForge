// server/services/mobileAnalyzer.js
const mobileAnalyzer = {
    async checkMobileResponsiveness(html) {
      const $ = cheerio.load(html);
      
      const checks = {
        viewport: {
          exists: $('meta[name="viewport"]').length > 0,
          content: $('meta[name="viewport"]').attr('content')
        },
        responsiveImages: {
          total: $('img').length,
          responsive: $('img[srcset], img[sizes], picture source[srcset]').length
        },
        mediaQueries: this.checkMediaQueries(html),
        touchTargets: this.checkTouchTargets($),
        fontSize: this.checkFontSizes($)
      };
  
      return {
        score: this.calculateMobileScore(checks),
        checks,
        recommendations: this.generateRecommendations(checks)
      };
    },
  
    checkMediaQueries(html) {
      const mediaQueryRegex = /@media\s*([^{]+)/g;
      const matches = html.match(mediaQueryRegex) || [];
      return {
        exists: matches.length > 0,
        count: matches.length
      };
    },
  
    checkTouchTargets($) {
      const smallTargets = $('a, button').filter(function() {
        const width = $(this).css('width');
        const height = $(this).css('height');
        return (parseInt(width) < 44 || parseInt(height) < 44);
      }).length;
  
      return {
        total: $('a, button').length,
        smallTargets
      };
    },
  
    checkFontSizes($) {
      const smallFonts = $('*').filter(function() {
        const fontSize = $(this).css('font-size');
        return fontSize && parseInt(fontSize) < 16;
      }).length;
  
      return {
        hasSmallFonts: smallFonts > 0,
        smallFontsCount: smallFonts
      };
    },
  
    calculateMobileScore(checks) {
      let score = 100;
  
      // Viewport deductions
      if (!checks.viewport.exists) score -= 30;
      
      // Responsive images deductions
      if (checks.responsiveImages.total > 0) {
        const responsiveRatio = checks.responsiveImages.responsive / checks.responsiveImages.total;
        score -= (1 - responsiveRatio) * 20;
      }
  
      // Media queries deductions
      if (!checks.mediaQueries.exists) score -= 20;
  
      // Touch targets deductions
      if (checks.touchTargets.smallTargets > 0) {
        score -= Math.min(20, checks.touchTargets.smallTargets * 2);
      }
  
      // Font size deductions
      if (checks.fontSize.hasSmallFonts) {
        score -= Math.min(10, checks.fontSize.smallFontsCount);
      }
  
      return Math.max(0, Math.round(score));
    },
  
    generateRecommendations(checks) {
      const recommendations = [];
  
      if (!checks.viewport.exists) {
        recommendations.push({
          type: 'error',
          message: 'Add a viewport meta tag to optimize for mobile devices',
          priority: 'high'
        });
      }
  
      if (checks.responsiveImages.total > checks.responsiveImages.responsive) {
        recommendations.push({
          type: 'warning',
          message: `Make ${checks.responsiveImages.total - checks.responsiveImages.responsive} images responsive using srcset or picture elements`,
          priority: 'medium'
        });
      }
  
      if (!checks.mediaQueries.exists) {
        recommendations.push({
          type: 'error',
          message: 'Add media queries to make the layout responsive',
          priority: 'high'
        });
      }
  
      if (checks.touchTargets.smallTargets > 0) {
        recommendations.push({
          type: 'warning',
          message: `Increase size of ${checks.touchTargets.smallTargets} touch targets to at least 44x44px`,
          priority: 'medium'
        });
      }
  
      if (checks.fontSize.hasSmallFonts) {
        recommendations.push({
          type: 'warning',
          message: `Increase font size for ${checks.fontSize.smallFontsCount} elements to at least 16px`,
          priority: 'medium'
        });
      }
  
      return recommendations;
    }
  };
  
  module.exports = mobileAnalyzer;