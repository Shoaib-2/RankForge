const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Enhanced JWT authentication middleware
const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    // console.log('Auth middleware - Authorization header:', authHeader ? 'Present' : 'Missing');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // console.log('Auth middleware - Invalid or missing Bearer token');
      return res.status(401).json({ 
        success: false,
        message: 'Authentication required. Please provide a valid token.' 
      });
    }

    const token = authHeader.split(' ')[1];
    
    if (!token) {
      // console.log('Auth middleware - Token extraction failed');
      return res.status(401).json({ 
        success: false,
        message: 'Authentication token not found' 
      });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // console.log('Auth middleware - Token decoded successfully for user:', decoded.userId);
    
    // Additional security: Check if user still exists and token version matches
    const user = await User.findById(decoded.userId).select('-password -refreshToken');
    
    if (!user) {
      // console.log('Auth middleware - User not found:', decoded.userId);
      return res.status(401).json({ 
        success: false,
        message: 'User account no longer exists' 
      });
    }

    // Check token version for security (allows invalidating all tokens)
    if (decoded.tokenVersion !== user.tokenVersion) {
      // console.log('Auth middleware - Token version mismatch. Expected:', user.tokenVersion, 'Got:', decoded.tokenVersion);
      return res.status(401).json({ 
        success: false,
        message: 'Token is no longer valid. Please login again.' 
      });
    }

    // console.log('Auth middleware - Authentication successful for user:', user.email);
    // Add user info to request
    req.userId = decoded.userId;
    req.user = user;
    
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid authentication token' 
      });
    } else if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false,
        message: 'Authentication token has expired. Please login again.',
        expired: true
      });
    } else {
      console.error('Auth middleware error:', error);
      return res.status(500).json({ 
        success: false,
        message: 'Authentication verification failed' 
      });
    }
  }
};

// Optional authentication (for public endpoints that can benefit from user context)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(); // Continue without authentication
    }

    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return next(); // Continue without authentication
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password -refreshToken');
    
    if (user && decoded.tokenVersion === user.tokenVersion) {
      req.userId = decoded.userId;
      req.user = user;
    }
    
    next();
  } catch (error) {
    // Silently continue without authentication for optional auth
    next();
  }
};

// Generate JWT tokens
const generateTokens = (userId, tokenVersion = 0) => {
  const accessToken = jwt.sign(
    { 
      userId, 
      tokenVersion,
      type: 'access'
    },
    process.env.JWT_SECRET,
    { expiresIn: '15m' } // Short-lived access token
  );

  const refreshToken = jwt.sign(
    { 
      userId, 
      tokenVersion,
      type: 'refresh'
    },
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
    { expiresIn: '7d' } // Longer-lived refresh token
  );

  return { accessToken, refreshToken };
};

// Verify refresh token
const verifyRefreshToken = (token) => {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET);
};

module.exports = {
  authMiddleware,
  optionalAuth,
  generateTokens,
  verifyRefreshToken
};