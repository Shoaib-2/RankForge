import React from 'react';
import { motion } from 'framer-motion';
import { 
  SparklesIcon, 
  ClockIcon,
  ChartBarIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const AIUsageTracker = ({ aiUsage, className = '' }) => {
  if (!aiUsage) return null;

  const {
    available,
    remainingRequests = 0,
    requestCount = 0,
    resetTime,
    error,
    cached
  } = aiUsage;

  const usagePercentage = ((requestCount / 10) * 100);
  const isLimitReached = requestCount >= 10;
  
  const getStatusColor = () => {
    if (isLimitReached) return 'text-red-600';
    if (remainingRequests <= 2) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getProgressBarColor = () => {
    if (isLimitReached) return 'bg-red-500';
    if (remainingRequests <= 2) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const formatTimeUntilReset = () => {
    if (!resetTime) return 'Unknown';
    
    const now = new Date();
    const reset = new Date(resetTime);
    const diff = reset.getTime() - now.getTime();
    
    if (diff <= 0) return 'Resetting soon...';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  return (
    <motion.div 
      className={`bg-white rounded-lg border border-gray-200 p-4 ${className}`}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <SparklesIcon className="h-5 w-5 text-purple-600" />
          <span className="font-medium text-gray-900">AI Analysis Usage</span>
        </div>
        {cached && (
          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
            Cached
          </span>
        )}
      </div>

      {/* Usage Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className={`font-medium ${getStatusColor()}`}>
            {requestCount}/10 requests used today
          </span>
          <span className="text-gray-500">
            {remainingRequests} remaining
          </span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <motion.div 
            className={`h-3 rounded-full transition-all duration-500 ${getProgressBarColor()}`}
            initial={{ width: 0 }}
            animate={{ width: `${usagePercentage}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>
        
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>0</span>
          <span>5</span>
          <span>10</span>
        </div>
      </div>

      {/* Status Information */}
      <div className="space-y-2">
        {/* Current Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className={`h-2 w-2 rounded-full ${available ? 'bg-green-400' : 'bg-red-400'}`}></div>
            <span className="text-sm text-gray-700">
              {available ? 'AI Available' : 'Limit Reached'}
            </span>
          </div>
          {isLimitReached && (
            <div className="flex items-center space-x-1 text-xs text-red-600">
              <ExclamationTriangleIcon className="h-4 w-4" />
              <span>Daily limit reached</span>
            </div>
          )}
        </div>

        {/* Reset Time */}
        {resetTime && (
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2 text-gray-600">
              <ClockIcon className="h-4 w-4" />
              <span>Resets in:</span>
            </div>
            <span className="font-mono text-gray-900">
              {formatTimeUntilReset()}
            </span>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-2">
            <div className="flex items-start space-x-2">
              <ExclamationTriangleIcon className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-red-700">{error}</span>
            </div>
          </div>
        )}

        {/* Upgrade Hint for Portfolio Demo */}
        {remainingRequests <= 2 && !isLimitReached && (
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-md p-3 mt-3">
            <div className="flex items-start space-x-2">
              <ChartBarIcon className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="text-purple-800 font-medium">Running low on AI insights</p>
                <p className="text-purple-600 text-xs mt-1">
                  In production: Upgrade to Pro for unlimited AI analysis
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Portfolio Note */}
        <div className="mt-3 pt-2 border-t border-gray-100">
          <p className="text-xs text-gray-500 text-center">
            Portfolio Demo • Free tier with daily limits
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default AIUsageTracker;
