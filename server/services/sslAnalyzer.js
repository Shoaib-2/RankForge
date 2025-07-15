const axios = require('axios');
const cacheService = require('./cacheService');

class SSLAnalyzer {
  constructor() {
    // SSL Labs API (free)
    this.baseUrl = 'https://api.ssllabs.com/api/v3';
  }

  async analyzeSSL(url) {
    try {
      // Check cache first
      const cacheKey = `ssl:${url}`;
      const cachedResult = cacheService.get(cacheKey);
      if (cachedResult) {
        console.log('SSL cache hit for:', url);
        return cachedResult;
      }

      const hostname = new URL(url).hostname;
      
      // Start SSL analysis
      console.log('Starting SSL analysis for:', hostname);
      
      const startResponse = await axios.get(`${this.baseUrl}/analyze`, {
        params: {
          host: hostname,
          publish: 'off',
          startNew: 'on',
          all: 'done'
        },
        timeout: 10000
      });

      // Check if analysis is ready
      if (startResponse.data.status === 'READY') {
        const result = this.processSSLData(startResponse.data);
        
        // Cache the result for 24 hours
        cacheService.set(cacheKey, result, 86400);
        return result;
      }

      // If not ready, return basic SSL check
      return await this.basicSSLCheck(url);

    } catch (error) {
      console.error('SSL analysis error:', error.message);
      return await this.basicSSLCheck(url);
    }
  }

  async basicSSLCheck(url) {
    try {
      const urlObj = new URL(url);
      
      // Simple check if HTTPS is used
      const isHTTPS = urlObj.protocol === 'https:';
      
      if (!isHTTPS) {
        return {
          hasSSL: false,
          grade: 'F',
          issues: ['No SSL certificate found - site uses HTTP'],
          recommendations: ['Enable HTTPS for secure communication'],
          validFrom: null,
          validTo: null,
          issuer: null
        };
      }

      // Try to make a request to check if SSL works
      const response = await axios.get(url, {
        timeout: 10000,
        validateStatus: () => true // Accept any status
      });

      return {
        hasSSL: true,
        grade: 'B', // Conservative estimate for basic check
        issues: [],
        recommendations: ['SSL certificate appears to be working'],
        validFrom: null,
        validTo: null,
        issuer: 'Unknown (basic check)'
      };

    } catch (error) {
      return {
        hasSSL: false,
        grade: 'F',
        issues: ['SSL certificate error: ' + error.message],
        recommendations: ['Fix SSL certificate configuration'],
        validFrom: null,
        validTo: null,
        issuer: null
      };
    }
  }

  processSSLData(data) {
    try {
      const endpoints = data.endpoints || [];
      if (endpoints.length === 0) {
        return this.getDefaultSSLResult(false);
      }

      const endpoint = endpoints[0];
      const details = endpoint.details || {};
      const cert = details.cert || {};

      const grade = endpoint.grade || 'Unknown';
      const hasSSL = grade !== 'F' && grade !== 'T';

      // Extract certificate info
      const validFrom = cert.notBefore ? new Date(cert.notBefore) : null;
      const validTo = cert.notAfter ? new Date(cert.notAfter) : null;
      const issuer = cert.issuerLabel || 'Unknown';

      // Identify issues
      const issues = [];
      const recommendations = [];

      if (grade === 'F') {
        issues.push('SSL certificate has serious issues');
        recommendations.push('Fix SSL certificate configuration immediately');
      } else if (grade === 'C' || grade === 'D') {
        issues.push('SSL certificate has moderate security issues');
        recommendations.push('Improve SSL certificate configuration');
      }

      // Check for weak protocols
      if (details.protocols && details.protocols.some(p => p.version < 3.0)) {
        issues.push('Weak SSL/TLS protocols detected');
        recommendations.push('Disable weak SSL/TLS protocols (SSLv2, SSLv3)');
      }

      // Check certificate expiry
      if (validTo && validTo < new Date()) {
        issues.push('SSL certificate has expired');
        recommendations.push('Renew SSL certificate immediately');
      } else if (validTo && validTo < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)) {
        issues.push('SSL certificate expires soon');
        recommendations.push('Plan SSL certificate renewal');
      }

      return {
        hasSSL,
        grade,
        issues,
        recommendations,
        validFrom,
        validTo,
        issuer
      };

    } catch (error) {
      console.error('Error processing SSL data:', error);
      return this.getDefaultSSLResult(false);
    }
  }

  getDefaultSSLResult(hasSSL = false) {
    return {
      hasSSL,
      grade: hasSSL ? 'B' : 'F',
      issues: hasSSL ? [] : ['No SSL certificate detected'],
      recommendations: hasSSL ? 
        ['SSL certificate appears to be working'] : 
        ['Enable HTTPS with a valid SSL certificate'],
      validFrom: null,
      validTo: null,
      issuer: hasSSL ? 'Unknown' : null
    };
  }
}

module.exports = new SSLAnalyzer();
