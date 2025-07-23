import React, { useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useSEO } from '../../../context/SeoContext';
import { authService } from '../../../services/authService';
import AIInsights from './AIInsights';
import AIUsageTracker from './AIUsageTracker';
import { 
  CheckCircleIcon, 
  ExclamationTriangleIcon, 
  XCircleIcon,
  ArrowPathIcon,
  SparklesIcon,
  LightBulbIcon, 
  FireIcon,
  BoltIcon,
  ShieldCheckIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

const SEOAnalysis = () => {
  const [aiInsightsLoading, setAiInsightsLoading] = useState(false);
  const [analysisId, setAnalysisId] = useState(null);
  const {
    url,
    setUrl,
    results,
    setResults,
    loading,
    setLoading,
    error,
    setError,
    clearAnalysis,
    // Use centralized rate limit state
    attemptCount,
    dailyLimit,
    rateLimitLoading,
    updateRateLimitFromHeaders,
    updateRateLimitFromResponse,
    setRateLimitExhausted,
    refreshRateLimit
  } = useSEO();

  const handleAnalysis = async (e) => {
    e.preventDefault();
    
    // Basic SEO analysis doesn't check AI rate limits anymore
    setLoading(true);
    setError('');
    setAnalysisId(null);

    try {
      const token = authService.getToken();
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/seo/analyze`,
        { url },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      // Update rate limit info and refresh status
      updateRateLimitFromHeaders(response.headers);
      await refreshRateLimit(); // Refresh the actual rate limit status

      const analysisData = response.data.data;
      const analysisId = response.data.analysisId;
      
      setResults({
        score: analysisData.score,
        analysis: analysisData.analysis,
        recommendations: analysisData.recommendations.map((rec, index) => ({
          id: index + 1,
          type: rec.category,
          description: rec.message,
          priority: rec.priority
        })),
        // No AI insights initially
        aiInsights: null,
        aiUsage: null
      });
      
      setAnalysisId(analysisId);

    } catch (error) {
      console.error('Analysis error:', error);
      setError('Error analyzing website. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // New function to handle AI insights request
  const handleGetAIInsights = async () => {
    if (!analysisId) {
      setError('No analysis available for AI insights');
      return;
    }

    // Check if rate limit is reached for AI insights
    if (!rateLimitLoading && attemptCount >= dailyLimit) {
      setError('🚫 Rate limit reached! You have used all 10 free AI analyses. The limit will reset in 24 hours.');
      return;
    }

    setAiInsightsLoading(true);
    setError('');

    try {
      const token = authService.getToken();
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/seo/ai/insights/${analysisId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      // Update rate limit info from response
      updateRateLimitFromResponse(response.data);
      await refreshRateLimit();

      // Update results with AI insights
      setResults(prev => ({
        ...prev,
        aiInsights: response.data.data.aiInsights,
        aiUsage: response.data.aiUsage
      }));

    } catch (error) {
      console.error('AI Insights error:', error);
      
      if (error.response?.status === 429) {
        setError('🚫 Rate limit reached! You have used all 10 free AI analyses. The limit will reset in 24 hours.');
        setRateLimitExhausted();
      } else {
        setError('Error generating AI insights. Please try again.');
      }
    } finally {
      setAiInsightsLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreIcon = (score) => {
    if (score >= 80) return CheckCircleIcon;
    if (score >= 60) return ExclamationTriangleIcon;
    return XCircleIcon;
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'text-red-400 bg-red-900/20 border-red-500/30';
      case 'medium':
        return 'text-yellow-400 bg-yellow-900/20 border-yellow-500/30';
      case 'low':
        return 'text-green-400 bg-green-900/20 border-green-500/30';
      default:
        return 'text-gray-400 bg-gray-900/20 border-gray-500/30';
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'high':
        return FireIcon;
      case 'medium':
        return ExclamationTriangleIcon;
      case 'low':
        return CheckCircleIcon;
      default:
        return LightBulbIcon;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-4">
            SEO Analysis Tool
          </h1>
          <p className="text-gray-300 text-lg">
            Analyze your website's SEO performance and get AI-powered insights
          </p>
        </div>

        {/* Rate Limit Display */}
        <AIUsageTracker />

        {/* URL Input Form */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 mb-8"
        >
          <form onSubmit={handleAnalysis} className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Enter website URL (e.g., https://example.com)"
                className="w-full px-4 py-3 rounded-lg bg-gray-800/50 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                disabled={loading}
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={loading || !url.trim()}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-purple-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <ArrowPathIcon className="w-5 h-5 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <SparklesIcon className="w-5 h-5" />
                    Analyze
                  </>
                )}
              </button>
              {results && (
                <button
                  type="button"
                  onClick={clearAnalysis}
                  className="px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
          </form>
        </motion.div>

        {/* Error Display */}
        {error && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-6"
          >
            <div className="flex items-center gap-2">
              <ExclamationTriangleIcon className="w-5 h-5 text-red-400" />
              <p className="text-red-200">{error}</p>
            </div>
          </motion.div>
        )}

        {/* Results Display */}
        {results && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* SEO Score */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-white">SEO Score</h2>
                {results.score && (
                  <div className="flex items-center gap-2">
                    {React.createElement(getScoreIcon(results.score), {
                      className: `w-8 h-8 ${getScoreColor(results.score)}`
                    })}
                    <span className={`text-3xl font-bold ${getScoreColor(results.score)}`}>
                      {results.score}/100
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Recommendations */}
            {results.recommendations && results.recommendations.length > 0 && (
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <LightBulbIcon className="w-6 h-6 text-yellow-400" />
                  Recommendations
                </h3>
                <div className="space-y-3">
                  {results.recommendations.map((rec) => {
                    const IconComponent = getPriorityIcon(rec.priority);
                    return (
                      <div
                        key={rec.id}
                        className={`p-4 rounded-lg border ${getPriorityColor(rec.priority)}`}
                      >
                        <div className="flex items-start gap-3">
                          <IconComponent className="w-5 h-5 mt-0.5 flex-shrink-0" />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold">{rec.type}</span>
                              <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(rec.priority)}`}>
                                {rec.priority}
                              </span>
                            </div>
                            <p className="text-gray-300">{rec.description}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* AI Insights Section */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <SparklesIcon className="w-6 h-6 text-purple-400" />
                  AI-Powered Insights
                </h3>
                {!results.aiInsights && analysisId && (
                  <button
                    onClick={handleGetAIInsights}
                    disabled={aiInsightsLoading || (attemptCount >= dailyLimit && !rateLimitLoading)}
                    className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {aiInsightsLoading ? (
                      <>
                        <ArrowPathIcon className="w-4 h-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <BoltIcon className="w-4 h-4" />
                        Get AI Insights
                        {!rateLimitLoading && (
                          <span className="text-xs bg-white/20 px-2 py-1 rounded">
                            {dailyLimit - attemptCount} left
                          </span>
                        )}
                      </>
                    )}
                  </button>
                )}
              </div>

              {results.aiInsights ? (
                <AIInsights insights={results.aiInsights} />
              ) : analysisId ? (
                <div className="text-center py-8">
                  <SparklesIcon className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                  <p className="text-gray-300 mb-4">
                    Get AI-powered insights and recommendations for your website
                  </p>
                  <p className="text-sm text-gray-400">
                    Click "Get AI Insights" to generate personalized recommendations
                  </p>
                </div>
              ) : (
                <div className="text-center py-8">
                  <ClockIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-400">
                    Run an SEO analysis first to get AI insights
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default SEOAnalysis;
