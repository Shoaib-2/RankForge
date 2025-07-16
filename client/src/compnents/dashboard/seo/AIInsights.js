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
      className={`bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-200 ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6">
        <div className="flex items-center space-x-2">
          <SparklesIcon className="h-6 w-6 text-purple-600" />
          <h3 className="text-xl font-bold text-purple-900">AI Strategic Insights</h3>
        </div>
        <div className="flex items-center space-x-2 ml-auto">
          <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-sm text-purple-600">Powered by Gemini AI</span>
        </div>
      </div>

      {/* Executive Summary */}
      <motion.div 
        className="bg-white rounded-lg p-4 mb-6 border border-purple-100"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-start space-x-3">
          <LightBulbIcon className="h-6 w-6 text-amber-500 mt-1 flex-shrink-0" />
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Executive Summary</h4>
            <p className="text-gray-700 leading-relaxed">{insights.executiveSummary}</p>
          </div>
        </div>
      </motion.div>

      {/* Priority Actions */}
      <motion.div 
        className="mb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
          <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
          Priority Actions
        </h4>
        <div className="space-y-3">
          {insights.priorityActions?.map((action, index) => (
            <motion.div 
              key={index}
              className="bg-white rounded-lg p-4 border border-gray-200"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getImpactColor(action.impact)}`}>
                      {action.impact} Impact
                    </span>
                    <span className="text-sm text-gray-500 flex items-center">
                      <ClockIcon className="h-4 w-4 mr-1" />
                      {action.timeframe}
                    </span>
                  </div>
                  <h5 className="font-medium text-gray-900 mb-1">{action.action}</h5>
                  <p className="text-gray-600 text-sm">{action.reasoning}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Competitive Advantage */}
      <motion.div 
        className="bg-white rounded-lg p-4 mb-6 border border-gray-200"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
          <ArrowTrendingUpIcon className="h-5 w-5 text-blue-500 mr-2" />
          Competitive Advantage
        </h4>
        <p className="text-gray-700">{insights.competitiveAdvantage}</p>
      </motion.div>

      {/* Expected Outcomes */}
      <motion.div 
        className="grid md:grid-cols-2 gap-4 mb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
      >
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <h5 className="font-medium text-gray-900 mb-2">Short-term (1-3 months)</h5>
          <p className="text-gray-600 text-sm">{insights.expectedOutcomes?.shortTerm}</p>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <h5 className="font-medium text-gray-900 mb-2">Long-term (6-12 months)</h5>
          <p className="text-gray-600 text-sm">{insights.expectedOutcomes?.longTerm}</p>
        </div>
      </motion.div>

      {/* Industry Insights & Risk Assessment */}
      <motion.div 
        className="grid md:grid-cols-2 gap-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <h5 className="font-medium text-gray-900 mb-2">Industry Insights</h5>
          <p className="text-gray-600 text-sm">{insights.industryInsights}</p>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <h5 className="font-medium text-gray-900 mb-2 flex items-center">
            <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
            Risk Assessment
          </h5>
          <span className={`text-sm font-medium ${getRiskColor(insights.riskAssessment)}`}>
            {insights.riskAssessment} Risk
          </span>
        </div>
      </motion.div>

      {/* Confidence Indicator */}
      {insights.confidence && (
        <motion.div 
          className="mt-4 pt-4 border-t border-purple-200"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
        >
          <div className="flex items-center justify-between text-sm">
            <span className="text-purple-600">AI Confidence</span>
            <div className="flex items-center space-x-2">
              <div className="w-20 bg-purple-200 rounded-full h-2">
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
