const fs = require('fs');
const path = require('path');

// Ensure logs directory exists
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Log levels
const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3
};

class Logger {
  constructor() {
    this.logLevel = process.env.LOG_LEVEL || 'WARN'; // Changed from 'INFO' to 'WARN'
  }

  formatMessage(level, message, meta = {}) {
    return JSON.stringify({
      timestamp: new Date().toISOString(),
      level,
      message,
      ...meta,
      pid: process.pid
    }) + '\n';
  }

  writeToFile(filename, message) {
    const filepath = path.join(logsDir, filename);
    fs.appendFileSync(filepath, message);
  }

  shouldLog(level) {
    return LOG_LEVELS[level] <= LOG_LEVELS[this.logLevel];
  }

  error(message, meta = {}) {
    if (!this.shouldLog('ERROR')) return;
    
    const logMessage = this.formatMessage('ERROR', message, meta);
    console.error(logMessage.trim());
    this.writeToFile('error.log', logMessage);
    this.writeToFile('combined.log', logMessage);
  }

  warn(message, meta = {}) {
    if (!this.shouldLog('WARN')) return;
    
    const logMessage = this.formatMessage('WARN', message, meta);
    console.warn(logMessage.trim());
    this.writeToFile('combined.log', logMessage);
  }

  info(message, meta = {}) {
    if (!this.shouldLog('INFO')) return;
    
    const logMessage = this.formatMessage('INFO', message, meta);
    console.log(logMessage.trim());
    this.writeToFile('combined.log', logMessage);
  }

  debug(message, meta = {}) {
    if (!this.shouldLog('DEBUG')) return;
    
    const logMessage = this.formatMessage('DEBUG', message, meta);
    console.log(logMessage.trim());
    this.writeToFile('debug.log', logMessage);
  }

  // Special methods for different log types
  apiRequest(req, res, responseTime) {
    this.info('API Request', {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      responseTime: `${responseTime}ms`,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      userId: req.userId || 'anonymous'
    });
  }

  apiError(error, req, meta = {}) {
    this.error('API Error', {
      message: error.message,
      stack: error.stack,
      url: req.originalUrl,
      method: req.method,
      ip: req.ip,
      userId: req.userId || 'anonymous',
      ...meta
    });
  }

  securityEvent(event, req, meta = {}) {
    const logMessage = this.formatMessage('SECURITY', event, {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      url: req.originalUrl,
      method: req.method,
      userId: req.userId || 'anonymous',
      ...meta
    });
    
    console.warn(logMessage.trim());
    this.writeToFile('security.log', logMessage);
    this.writeToFile('combined.log', logMessage);
  }

  performance(metric, value, meta = {}) {
    this.info('Performance Metric', {
      metric,
      value,
      unit: meta.unit || 'ms',
      ...meta
    });
  }

  database(operation, collection, meta = {}) {
    this.debug('Database Operation', {
      operation,
      collection,
      ...meta
    });
  }

  // Log rotation helper
  rotateLogs() {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    
    const logFiles = ['error.log', 'combined.log', 'debug.log', 'security.log'];
    
    logFiles.forEach(file => {
      const currentPath = path.join(logsDir, file);
      const archivePath = path.join(logsDir, `${dateStr}-${file}`);
      
      if (fs.existsSync(currentPath)) {
        fs.renameSync(currentPath, archivePath);
      }
    });
  }
}

// Middleware for request logging
const requestLogger = (logger) => {
  return (req, res, next) => {
    const start = Date.now();
    
    // Override res.end to capture response time
    const originalEnd = res.end;
    res.end = function(chunk, encoding) {
      const responseTime = Date.now() - start;
      logger.apiRequest(req, res, responseTime);
      originalEnd.call(this, chunk, encoding);
    };
    
    next();
  };
};

// Create singleton logger instance
const logger = new Logger();

module.exports = {
  Logger,
  logger,
  requestLogger
};
