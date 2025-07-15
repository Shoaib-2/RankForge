const NodeCache = require('node-cache');

class CacheService {
  constructor() {
    // Create cache instances with different TTL
    this.seoCache = new NodeCache({ 
      stdTTL: 3600, // 1 hour
      checkperiod: 600, // Check for expired keys every 10 minutes
      maxKeys: 1000 // Maximum number of keys
    });
    
    this.pageSpeedCache = new NodeCache({ 
      stdTTL: 1800, // 30 minutes for PageSpeed data
      checkperiod: 300,
      maxKeys: 500
    });
    
    this.generalCache = new NodeCache({ 
      stdTTL: 600, // 10 minutes for general data
      checkperiod: 120,
      maxKeys: 200
    });
  }

  // SEO Analysis caching
  getSeoAnalysis(url) {
    const key = this.generateKey('seo', url);
    return this.seoCache.get(key);
  }

  setSeoAnalysis(url, data) {
    const key = this.generateKey('seo', url);
    return this.seoCache.set(key, data);
  }

  // PageSpeed caching
  getPageSpeed(url) {
    const key = this.generateKey('pagespeed', url);
    return this.pageSpeedCache.get(key);
  }

  setPageSpeed(url, data) {
    const key = this.generateKey('pagespeed', url);
    return this.pageSpeedCache.set(key, data);
  }

  // General purpose caching
  get(key) {
    return this.generalCache.get(key);
  }

  set(key, value, ttl = null) {
    if (ttl) {
      return this.generalCache.set(key, value, ttl);
    }
    return this.generalCache.set(key, value);
  }

  // Delete specific cache entry
  delete(key) {
    this.seoCache.del(key);
    this.pageSpeedCache.del(key);
    this.generalCache.del(key);
  }

  // Clear all caches
  clearAll() {
    this.seoCache.flushAll();
    this.pageSpeedCache.flushAll();
    this.generalCache.flushAll();
  }

  // Get cache statistics
  getStats() {
    return {
      seo: this.seoCache.getStats(),
      pageSpeed: this.pageSpeedCache.getStats(),
      general: this.generalCache.getStats()
    };
  }

  // Generate cache key
  generateKey(prefix, url) {
    // Normalize URL for consistent caching
    try {
      const normalizedUrl = new URL(url).href.toLowerCase();
      return `${prefix}:${Buffer.from(normalizedUrl).toString('base64')}`;
    } catch (error) {
      return `${prefix}:${Buffer.from(url).toString('base64')}`;
    }
  }

  // Check if URL should be cached (avoid caching localhost, etc.)
  shouldCache(url) {
    try {
      const urlObj = new URL(url);
      const hostname = urlObj.hostname.toLowerCase();
      
      // Don't cache localhost or internal networks
      const noCachePatterns = [
        /^localhost$/,
        /^127\./,
        /^192\.168\./,
        /^10\./,
        /^172\.(1[6-9]|2[0-9]|3[0-1])\./
      ];
      
      return !noCachePatterns.some(pattern => pattern.test(hostname));
    } catch {
      return false;
    }
  }
}

// Create singleton instance
const cacheService = new CacheService();

module.exports = cacheService;
