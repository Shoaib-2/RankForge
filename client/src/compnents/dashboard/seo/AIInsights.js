import React from 'react';
import { motion } from 'framer-motion';
import { 
  SparklesIcon, 
  LightBulbIcon, 
  ArrowTrendingUpIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

const AIInsights = ({ insights, availability, className = '' }) => {
  if (!insights) {
    return (
      <motion.div 
        className={`bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-200 ${className}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-center space-x-3 text-purple-600">
          <SparklesIcon className="h-6 w-6" />
          <span className="text-lg font-medium">AI Insights Unavailable</span>
        </div>
        <p className="text-purple-700 text-center mt-2">
          {availability?.reason || 'AI analysis is currently unavailable'}
        </p>
        {availability?.resetTime && (
          <p className="text-purple-600 text-sm text-center mt-2">
            Resets: {new Date(availability.resetTime).toLocaleString()}
          </p>
        )}
      </motion.div>
    );
  }

  const getImpactColor = (impact) => {
    switch (impact?.toLowerCase()) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-blue-600 bg-blue-100';
    }
  };

  const getRiskColor = (risk) => {
    switch (risk?.toLowerCase()) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-blue-600';
    }
  };

  return (
    <motion.div 
      className={`bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-4 sm:p-6 lg:p-8 border border-purple-200 ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 mb-4 sm:mb-6 lg:mb-8">
        <div className="flex items-center space-x-2 sm:space-x-3">
          <SparklesIcon className="h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7 text-purple-600" />
          <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-purple-900">AI Strategic Insights</h3>
        </div>
        <div className="flex items-center space-x-2">
          <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-xs sm:text-sm lg:text-base text-purple-600">Powered by Gemini AI</span>
        </div>
      </div>

      {/* Executive Summary */}
      <motion.div 
        className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 lg:p-6 mb-4 sm:mb-6 lg:mb-8 border border-purple-100"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-start space-x-3 sm:space-x-4">
          <LightBulbIcon className="h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7 text-amber-500 mt-1 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-gray-900 mb-2 sm:mb-3 text-sm sm:text-base lg:text-lg">Executive Summary</h4>
            <p className="text-gray-700 leading-relaxed text-sm sm:text-base lg:text-lg">{insights.executiveSummary}</p>
          </div>
        </div>
      </motion.div>

      {/* Priority Actions */}
      <motion.div 
        className="mb-4 sm:mb-6 lg:mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <h4 className="font-semibold text-gray-900 mb-3 sm:mb-4 lg:mb-6 flex items-center text-sm sm:text-base lg:text-lg">
          <CheckCircleIcon className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-green-500 mr-2 sm:mr-3" />
          Priority Actions
        </h4>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
          {insights.priorityActions?.map((action, index) => (
            <motion.div 
              key={index}
              className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 lg:p-6 border border-gray-200 hover:border-gray-300 transition-all duration-300 hover:shadow-lg"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
            >
              <div className="space-y-3 sm:space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <span className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium w-fit ${getImpactColor(action.impact)}`}>
                    {action.impact} Impact
                  </span>
                  <span className="text-xs sm:text-sm lg:text-base text-gray-500 flex items-center">
                    <ClockIcon className="h-3 w-3 sm:h-4 sm:w-4 lg:w-5 lg:h-5 mr-1 sm:mr-2" />
                    {action.timeframe}
                  </span>
                </div>
                <div>
                  <h5 className="font-medium text-gray-900 mb-2 sm:mb-3 text-sm sm:text-base lg:text-lg">{action.action}</h5>
                  <p className="text-gray-600 text-xs sm:text-sm lg:text-base leading-relaxed">{action.reasoning}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Competitive Advantage */}
      <motion.div 
        className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 lg:p-6 mb-4 sm:mb-6 lg:mb-8 border border-gray-200"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <h4 className="font-semibold text-gray-900 mb-2 sm:mb-3 lg:mb-4 flex items-center text-sm sm:text-base lg:text-lg">
          <ArrowTrendingUpIcon className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-blue-500 mr-2 sm:mr-3" />
          Competitive Advantage
        </h4>
        <p className="text-gray-700 text-sm sm:text-base lg:text-lg leading-relaxed">{insights.competitiveAdvantage}</p>
      </motion.div>

      {/* Expected Outcomes */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6 lg:mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
      >
        <div className="bg-white rounded-lg p-3 sm:p-4 border border-gray-200">
          <h5 className="font-medium text-gray-900 mb-2 text-sm sm:text-base">Short-term (1-3 months)</h5>
          <p className="text-gray-600 text-xs sm:text-sm">{insights.expectedOutcomes?.shortTerm}</p>
        </div>
        <div className="bg-white rounded-lg p-3 sm:p-4 border border-gray-200">
          <h5 className="font-medium text-gray-900 mb-2 text-sm sm:text-base">Long-term (6-12 months)</h5>
          <p className="text-gray-600 text-xs sm:text-sm">{insights.expectedOutcomes?.longTerm}</p>
        </div>
      </motion.div>

      {/* Industry Insights & Risk Assessment */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <div className="bg-white rounded-lg p-3 sm:p-4 border border-gray-200">
          <h5 className="font-medium text-gray-900 mb-2 text-sm sm:text-base">Industry Insights</h5>
          <p className="text-gray-600 text-xs sm:text-sm">{insights.industryInsights}</p>
        </div>
        <div className="bg-white rounded-lg p-3 sm:p-4 border border-gray-200">
          <h5 className="font-medium text-gray-900 mb-2 flex items-center text-sm sm:text-base">
            <ExclamationTriangleIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
            Risk Assessment
          </h5>
          <span className={`text-xs sm:text-sm font-medium ${getRiskColor(insights.riskAssessment)}`}>
            {insights.riskAssessment} Risk
          </span>
        </div>
      </motion.div>

      {/* Confidence Indicator */}
      {insights.confidence && (
        <motion.div 
          className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-purple-200"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
        >
          <div className="flex items-center justify-between text-xs sm:text-sm">
            <span className="text-purple-600">AI Confidence</span>
            <div className="flex items-center space-x-2">
              <div className="w-16 sm:w-20 bg-purple-200 rounded-full h-2">
                <div 
                  className="bg-purple-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${(insights.confidence * 100)}%` }}
                ></div>
              </div>
              <span className="text-purple-700 font-medium">
                {Math.round(insights.confidence * 100)}%
              </span>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default AIInsights;
