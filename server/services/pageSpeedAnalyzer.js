const axios = require('axios');

class PageSpeedAnalyzer {
  async analyze(url) {
    try {
      const metrics = await this.getPerformanceMetrics(url);
      const recommendations = this.generateRecommendations(metrics);
      const score = this.calculateScore(metrics);

      return {
        score: Number(score),
        metrics,
        recommendations
      };
    } catch (error) {
      throw new Error(`Page Speed Analysis error: ${error.message}`);
    }
  }

  async getPerformanceMetrics(url) {
    // For demo purposes, returning mock data
    return {
      firstContentfulPaint: {
        value: Number(1.8),
        score: Number(0.9)
      },
      speedIndex: {
        value: Number(2.1),
        score: Number(0.85)
      },
      largestContentfulPaint: {
        value: Number(2.5),
        score: Number(0.8)
      },
      timeToInteractive: {
        value: Number(3.2),
        score: Number(0.75)
      },
      totalBlockingTime: {
        value: Number(150),
        score: Number(0.8)
      },
      cumulativeLayoutShift: {
        value: Number(0.12),
        score: Number(0.7)
      }
    };
  }

  calculateScore(metrics) {
    const weights = {
      firstContentfulPaint: 0.15,
      speedIndex: 0.15,
      largestContentfulPaint: 0.25,
      timeToInteractive: 0.15,
      totalBlockingTime: 0.2,
      cumulativeLayoutShift: 0.1
    };

    let totalScore = 0;
    for (const [metric, weight] of Object.entries(weights)) {
      totalScore += metrics[metric].score * weight;
    }

    return Number((totalScore * 100).toFixed(0));
  }

  generateRecommendations(metrics) {
    const recommendations = [];

    if (metrics.firstContentfulPaint.value > 1.5) {
      recommendations.push({
        type: 'warning',
        message: 'Optimize First Contentful Paint by reducing server response time'
      });
    }

    if (metrics.largestContentfulPaint.value > 2.5) {
      recommendations.push({
        type: 'warning',
        message: 'Improve Largest Contentful Paint by optimizing images'
      });
    }

    if (metrics.totalBlockingTime.value > 200) {
      recommendations.push({
        type: 'error',
        message: 'Reduce Total Blocking Time by minimizing main thread work'
      });
    }

    return recommendations;
  }
}

module.exports = new PageSpeedAnalyzer();