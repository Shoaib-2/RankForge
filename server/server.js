const express = require('express');
const mongoose = require('mongoose');
const { MongoClient, ServerApiVersion } = require('mongodb');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { generalLimiter, speedLimiter } = require('./middleware/rateLimiter');
const { sanitizeInput } = require('./middleware/validation');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const { logger, requestLogger } = require('./utils/logger');
const RateLimitCleanup = require('./utils/rateLimitCleanup');
require('dotenv').config();

const app = express();

// Start rate limit cleanup scheduler
RateLimitCleanup.startScheduler();

// CORS configuration to allow frontend to communicate with backend
const corsOptions = {
  origin: [
    process.env.FRONTEND_URL,
  ],
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With',
    'Accept',
    'Origin'
  ],
  exposedHeaders: ['X-Total-Count'],
  preflightContinue: false
};

// Middleware - CORS must be first
app.use(cors(corsOptions)); // Apply CORS configuration first

// Handle preflight requests for all routes
app.options('*', cors(corsOptions));

// Debug middleware to log requests (disabled for production)
// app.use(requestLogger(logger));

// Security and rate limiting middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
})); // Security headers with CORS support
// app.use(morgan('dev')); // Request logging disabled for cleaner output
app.use(generalLimiter); // General rate limiting
app.use(speedLimiter); // Progressive delay
app.use(express.json({ limit: '10mb' })); // Parse JSON bodies with size limit
app.use(sanitizeInput); // Input sanitization

// Routes
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

const seoRoutes = require('./routes/seo');
app.use('/api/seo', seoRoutes);

const keywordRoutes = require('./routes/keywords');
app.use('/api/keywords', keywordRoutes);

const analyticsRoutes = require('./routes/analytics');
app.use('/api/analytics', analyticsRoutes);

const exportRoutes = require('./routes/export');
app.use('/api/export', exportRoutes);

const dashboardRoutes = require('./routes/dashboard');
app.use('/api/dashboard', dashboardRoutes);

const adminRoutes = require('./routes/admin');
app.use('/api/admin', adminRoutes);

// Basic route
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || '1.0.0'
  });
});

// 404 handler for unmatched routes
app.use(notFoundHandler);

// Global error handler (must be last)
app.use(errorHandler);

// MongoDB Connection
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true
  }
});

async function connectToMongoDB() {
  try {
    // Connect using Mongoose with proper options
    await mongoose.connect(uri, {
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      bufferCommands: false // Disable mongoose buffering
    });
    console.log('✅ Connected to MongoDB');

    // Set up connection event listeners
    mongoose.connection.on('connected', () => {
      console.log('✅ Mongoose connected to MongoDB');
    });

    mongoose.connection.on('error', (err) => {
      console.error('❌ Mongoose connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ Mongoose disconnected');
    });

    // Also connect using MongoClient for ping test
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log('✅ Database connection verified');
  } catch (err) {
    logger.error('MongoDB connection error:', { error: err.message, stack: err.stack });
    process.exit(1);
  }
}

// Initialize server and database connection
const PORT = process.env.PORT || 5000;

connectToMongoDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 SEO Tool Server running on port ${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 Health check: ${process.env.BACKEND_URL}/api/health`);
  });
}).catch((err) => {
  logger.error('Failed to start server:', { error: err.message, stack: err.stack });
  process.exit(1);
});

// Handle process termination
process.on('SIGINT', async () => {
  try {
    logger.info('Gracefully shutting down server...');
    await client.close();
    await mongoose.connection.close();
    logger.info('MongoDB connections closed.');
    process.exit(0);
  } catch (err) {
    logger.error('Error during cleanup:', { error: err.message, stack: err.stack });
    process.exit(1);
  }
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', { error: err.message, stack: err.stack });
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection:', { reason, promise });
  process.exit(1);
});