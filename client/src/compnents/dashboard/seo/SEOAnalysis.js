import { useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useSEO } from '../../../context/SeoContext';
import authService from '../../../services/authService';
import AIInsights from './AIInsights';
import AIUsageTracker from './AIUsageTracker';
import PageSpeedInsights from './PageSpeedInsights';
import ExportOptions from '../export/ExportOptions';
import { 
  ExclamationTriangleIcon, 
  ArrowPathIcon,
  SparklesIcon,
  LightBulbIcon, 
  FireIcon,
  BoltIcon,
  ClockIcon,
  ChartBarIcon,
  CheckCircleIcon
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
        'http://localhost:5000/api/seo/analyze',
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
        `http://localhost:5000/api/seo/ai/insights/${analysisId}`,
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
    if (score >= 80) return 'score-excellent';
    if (score >= 60) return 'score-good';
    return 'score-poor';
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low':
        return 'text-green-600 bg-green-50 border-green-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
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
    <div className="dashboard-container">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            SEO Analysis Tool
          </h1>
          <p className="text-gray-600 text-base sm:text-lg">
            Analyze your website's SEO performance and get AI-powered insights
          </p>
        </div>

        {/* Rate Limit Display */}
        <AIUsageTracker />

        {/* URL Input Form */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="seo-analysis-section"
        >
          <form onSubmit={handleAnalysis} className="flex flex-col gap-4">
            <div className="flex-1">
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Enter website URL (e.g., https://example.com)"
                className="w-full px-4 py-3 rounded-lg bg-white border border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                required
                disabled={loading}
              />
            </div>
            <div className="flex justify-center items-center w-full mt-2">
              {!loading ? (
                <button
                  type="submit"
                  disabled={loading || !url.trim()}
                  className="export-button px-8 py-3 rounded-lg flex items-center justify-center"
                  style={{ margin: '0 auto' }}
                >
                  <SparklesIcon className="w-5 h-5 mr-2" />
                  Analyze
                </button>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.5 }}
                  className="flex flex-col items-center justify-center w-full"
                >
                  <motion.div
                    initial={{ rotate: 0 }}
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                    className="mb-2"
                  >
                    <ArrowPathIcon className="w-8 h-8 text-blue-500" />
                  </motion.div>
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.7 }}
                    className="text-blue-600 font-semibold text-base"
                  >
                    Analyzing...
                  </motion.span>
                </motion.div>
              )}
              {results && !loading && (
                <button
                  type="button"
                  onClick={clearAnalysis}
                  className="export-button ml-4 px-8 py-3 rounded-lg"
                  style={{ background: 'linear-gradient(135deg, #6b7280, #4b5563)' }}
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
            className="alert alert-error"
          >
            <div className="flex items-center gap-2">
              <ExclamationTriangleIcon className="w-5 h-5" />
              <p>{error}</p>
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
            <div className="seo-analysis-section">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 lg:mb-8 gap-4">
                <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-800 flex items-center">
                  <ChartBarIcon className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 mr-2 sm:mr-3" />
                  SEO Score
                </h2>
                {results.score && (
                  <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-center gap-2 sm:gap-3">
                      <div className={`score-badge ${getScoreColor(results.score).replace('text-', 'score-').replace('-600', '')} text-xl sm:text-2xl lg:text-3xl font-bold px-3 sm:px-4 py-2 sm:py-3`}>
                        {results.score}
                      </div>
                      <span className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800">
                        / 100
                      </span>
                    </div>
                    <div className="mt-2 sm:mt-3 text-center">
                      <span className={`text-xs sm:text-sm lg:text-base font-medium ${getScoreColor(results.score)}`}>
                        {results.score >= 80 ? 'Excellent' : 
                         results.score >= 60 ? 'Good' : 
                         results.score >= 40 ? 'Needs Improvement' : 'Poor'}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Recommendations */}
            {results.recommendations && results.recommendations.length > 0 && (
              <div className="seo-analysis-section">
                <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-800 mb-4 sm:mb-6 flex items-center">
                  <LightBulbIcon className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 mr-2 sm:mr-3" />
                  Recommendations
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                  {results.recommendations.map((rec) => {
                    const IconComponent = getPriorityIcon(rec.priority);
                    return (
                      <motion.div
                        key={rec.id}
                        className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 border border-gray-200 hover:border-gray-300 transition-all duration-300 hover:shadow-lg"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: rec.id * 0.1 }}
                        whileHover={{ scale: 1.02 }}
                      >
                        <div className="flex flex-col space-y-3 sm:space-y-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-2 sm:gap-3">
                              <div className="p-2 sm:p-3 rounded-lg bg-gray-50">
                                <IconComponent className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 flex-shrink-0" />
                              </div>
                              <span className="font-semibold text-sm sm:text-base lg:text-lg text-gray-800">{rec.type}</span>
                            </div>
                            <span className={`text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-1.5 rounded-full font-medium whitespace-nowrap ${getPriorityColor(rec.priority)}`}>
                              {rec.priority}
                            </span>
                          </div>
                          <p className="text-gray-700 text-sm sm:text-base lg:text-lg leading-relaxed">{rec.description}</p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* PageSpeed Insights */}
            {results.analysis?.technical?.pageSpeed && (
              <PageSpeedInsights 
                pageSpeedData={{
                  mobile: results.analysis.technical.pageSpeed.mobile,
                  desktop: results.analysis.technical.pageSpeed.desktop
                }}
              />
            )}

            {/* AI Insights Section */}
            <div className="seo-analysis-section">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-4">
                <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-800 flex items-center">
                  <SparklesIcon className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 mr-2 sm:mr-3" />
                  AI-Powered Insights
                </h3>
                {!results.aiInsights && analysisId && (
                  <button
                    onClick={handleGetAIInsights}
                    disabled={aiInsightsLoading || (attemptCount >= dailyLimit && !rateLimitLoading)}
                    className="export-button w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base"
                    style={{ background: 'linear-gradient(135deg, #8b5cf6, #ec4899)' }}
                  >
                    {aiInsightsLoading ? (
                      <>
                        <ArrowPathIcon className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                        <span className="ml-2">Generating...</span>
                      </>
                    ) : (
                      <>
                        <BoltIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span className="ml-2">Get AI Insights</span>
                        {!rateLimitLoading && (
                          <span className="text-xs bg-white/20 px-2 py-1 rounded ml-2 sm:ml-3">
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
                <div className="text-center py-8 sm:py-12 lg:py-16">
                  <SparklesIcon className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 text-purple-500 mx-auto mb-4 sm:mb-6" />
                  <p className="text-gray-700 mb-4 text-sm sm:text-base lg:text-lg max-w-md mx-auto">
                    Get AI-powered insights and recommendations for your website
                  </p>
                  <p className="text-xs sm:text-sm lg:text-base text-gray-500 max-w-sm mx-auto">
                    Click "Get AI Insights" to generate personalized recommendations
                  </p>
                </div>
              ) : (
                <div className="text-center py-8 sm:py-12 lg:py-16">
                  <ClockIcon className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 text-gray-400 mx-auto mb-4 sm:mb-6" />
                  <p className="text-gray-500 text-sm sm:text-base lg:text-lg">
                    Run an SEO analysis first to get AI insights
                  </p>
                </div>
              )}
            </div>

            {/* Export Options */}
            <ExportOptions analysisData={results} />
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default SEOAnalysis;
