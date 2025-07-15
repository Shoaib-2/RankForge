// Re-enabled rate limiting for production use
const rateLimit = require('express-rate-limit');
const slowDown = require('express-slow-down');
const NodeCache = require('node-cache');

// Cache to track email-based requests
const emailCache = new NodeCache({ stdTTL: 3600 }); // 1 hour cache

// General rate limiter for all requests
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Support both IPv4 and IPv6
  keyGenerator: (req) => {
    const forwarded = req.headers['x-forwarded-for'];
    const ip = forwarded ? forwarded.split(',')[0] : req.connection.remoteAddress;
    return ip;
  }
});

// Auth rate limiter for login/register endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 auth requests per windowMs
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    const forwarded = req.headers['x-forwarded-for'];
    const ip = forwarded ? forwarded.split(',')[0] : req.connection.remoteAddress;
    return ip;
  }
});

// Speed limiter for progressive delays
const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000, // 15 minutes
  delayAfter: 500, // Allow first 500 requests per 15 minutes at full speed
  delayMs: () => 500, // Fixed delay of 500ms per request after delayAfter (new v2 syntax)
  maxDelayMs: 20000, // Maximum delay of 20 seconds
  validate: {
    delayMs: false // Disable the warning message
  },
  keyGenerator: (req) => {
    const forwarded = req.headers['x-forwarded-for'];
    const ip = forwarded ? forwarded.split(',')[0] : req.connection.remoteAddress;
    return ip;
  }
});

// SEO analysis rate limiter with user tracking
const seoAnalysisLimiter = (req, res, next) => {
  const userId = req.userId; // Assuming auth middleware sets this
  const email = req.user?.email; // Backup identifier
  
  if (!userId && !email) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  const userKey = `seo_${userId || email}`;
  const currentCount = emailCache.get(userKey) || 0;
  
  // Free users: 3 requests per day
  const dailyLimit = 3;
  
  if (currentCount >= dailyLimit) {
    return res.status(429).json({
      success: false,
      message: `Daily SEO analysis limit reached (${dailyLimit} analyses per day). Upgrade to premium for unlimited access.`,
      limit: dailyLimit,
      remaining: 0
    });
  }
  
  // Set with 24-hour expiry for daily limits
  emailCache.set(userKey, currentCount + 1, 86400); // 24 hours
  
  // Add remaining count to response headers
  res.setHeader('X-RateLimit-Remaining', dailyLimit - currentCount - 1);
  res.setHeader('X-RateLimit-Limit', dailyLimit);
  
  next();
};

// Email-based rate limiter for auth endpoints
const emailRateLimiter = (req, res, next) => {
  const email = req.body.email;
  
  if (!email) {
    return next();
  }

  const emailKey = `email_${email.toLowerCase()}`;
  const currentCount = emailCache.get(emailKey) || 0;
  
  // Allow 5 requests per hour per email
  if (currentCount >= 5) {
    return res.status(429).json({
      success: false,
      message: 'Too many requests for this email. Please try again later.'
    });
  }
  
  emailCache.set(emailKey, currentCount + 1);
  next();
};

module.exports = {
  generalLimiter,
  authLimiter,
  speedLimiter,
  seoAnalysisLimiter,
  emailRateLimiter
};
