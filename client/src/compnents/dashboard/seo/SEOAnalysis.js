import React from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import authService from '../../../services/authService';
import PageSpeedInsights from './PageSpeedInsights';
import ExportOptions from '../export/ExportOptions';
import  { useSEO }  from '../../../context/SeoContext';
import { 
  MagnifyingGlassIcon, 
  TrashIcon, 
  SparklesIcon, 
  ExclamationTriangleIcon, 
  ChartBarIcon, 
  CheckCircleIcon, 
  XCircleIcon, 
  HandThumbUpIcon, 
  WrenchScrewdriverIcon, 
  LightBulbIcon, 
  FireIcon,
  BoltIcon,
  ShieldCheckIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

const SEOAnalysis = () => {
  const {
    url,
    setUrl,
    results,
    setResults,
    loading,
    setLoading,
    error,
    setError,
    clearAnalysis
  } = useSEO();

  // Track rate limit attempts (you could make this more sophisticated with API calls)
  const [attemptCount, setAttemptCount] = React.useState(() => {
    return parseInt(localStorage.getItem('seo_analysis_attempts') || '0');
  });

  const handleAnalysis = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = authService.getToken();
      const response = await axios.post(
        'http://localhost:5000/api/seo/analyze',
        { url },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      // Success - increment attempt counter
      const newCount = attemptCount + 1;
      setAttemptCount(newCount);
      localStorage.setItem('seo_analysis_attempts', newCount.toString());

      const analysisData = response.data.data;
      setResults({
        score: analysisData.score,
        analysis: analysisData.analysis,
        recommendations: analysisData.recommendations.map((rec, index) => ({
          id: index + 1,
          type: rec.category,
          description: rec.message,
          priority: rec.priority
        }))
      });
    } catch (error) {
      console.error('Analysis error:', error);
      
      // Check if it's a rate limit error
      if (error.response?.status === 429) {
        setError('🚫 Rate limit reached! You have used all 3 free analyses. The limit resets periodically to ensure fair usage for all users.');
      } else {
        // Increment attempt counter even for other errors (API calls were made)
        const newCount = attemptCount + 1;
        setAttemptCount(newCount);
        localStorage.setItem('seo_analysis_attempts', newCount.toString());
        
        setError('Using demo SEO analysis - API unavailable');
      }
      // Set mock SEO analysis results
      setResults({
        score: 78,
        analysis: {
          technicalAnalysis: {
            pageSpeed: {
              score: 85,
              metrics: {
                firstContentfulPaint: { value: 1.2, score: 0.9 },
                speedIndex: { value: 2.1, score: 0.8 },
                largestContentfulPaint: { value: 2.5, score: 0.7 },
                timeToInteractive: { value: 3.1, score: 0.6 },
                totalBlockingTime: { value: 150, score: 0.8 },
                cumulativeLayoutShift: { value: 0.05, score: 0.9 }
              },
              recommendations: [
                { priority: 'high', message: 'Optimize images to reduce load times' },
                { priority: 'medium', message: 'Minify CSS and JavaScript files' },
                { priority: 'low', message: 'Enable browser caching' }
              ]
            }
          }
        },
        recommendations: [
          {
            id: 1,
            type: 'Meta Description',
            description: 'Add meta descriptions to improve click-through rates',
            priority: 'high'
          },
          {
            id: 2,
            type: 'Image Alt Tags',
            description: 'Add alt tags to all images for better accessibility',
            priority: 'medium'
          },
          {
            id: 3,
            type: 'Page Speed',
            description: 'Optimize images and enable compression',
            priority: 'high'
          },
          {
            id: 4,
            type: 'Internal Linking',
            description: 'Improve internal link structure',
            priority: 'low'
          }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Analysis Form */}
      <motion.div 
        className="seo-analysis-section"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center">
            <MagnifyingGlassIcon className="w-6 h-6 mr-2" />
            SEO Analysis
          </h2>
          {results && (
            <motion.button
              onClick={clearAnalysis}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-colors duration-200"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <TrashIcon className="w-4 h-4 mr-2" /> Clear Analysis
            </motion.button>
          )}
        </div>
        
        <form onSubmit={handleAnalysis}>
          <div className="flex flex-col md:flex-row md:items-end gap-4">
            <div className="flex-grow">
              <label htmlFor="url" className="block text-sm font-semibold text-gray-700 mb-2">
                Website URL
              </label>
              <input
                type="url"
                name="url"
                id="url"
                className="futuristic-input w-full"
                placeholder="Enter website URL to analyze"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                required
              />
            </div>
            <motion.button
              type="submit"
              className="futuristic-button w-full md:w-auto"
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
            >
              {loading ? (
                <>
                  <motion.div 
                    className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                  Analyzing...
                </>
              ) : (
                <>
                  <SparklesIcon className="w-4 h-4 mr-2" />
                  Analyze
                </>
              )}
            </motion.button>
          </div>
        </form>
        
        {/* Rate Limit Tracker */}
        <motion.div 
          className="mt-4 bg-gradient-to-r from-gray-50 to-blue-50 border border-gray-200 rounded-lg p-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <ShieldCheckIcon className="h-5 w-5 text-blue-500 mr-2" />
              <span className="text-sm font-medium text-gray-700">
                Analysis Usage
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex space-x-1">
                {[1, 2, 3].map((num) => (
                  <div
                    key={num}
                    className={`w-3 h-3 rounded-full transition-colors ${
                      num <= attemptCount 
                        ? attemptCount >= 3 
                          ? 'bg-red-400' 
                          : 'bg-blue-400'
                        : 'bg-gray-200'
                    }`}
                  />
                ))}
              </div>
              <span className={`text-sm font-semibold ${
                attemptCount >= 3 ? 'text-red-600' : 'text-blue-600'
              }`}>
                {attemptCount}/3 used
              </span>
            </div>
          </div>
          
          {attemptCount >= 3 ? (
            <div className="mt-2 flex items-start">
              <ClockIcon className="h-4 w-4 text-orange-500 mr-2 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-orange-700">
                <strong>Limit reached:</strong> You've used all 3 free analyses. 
                The rate limit helps ensure fair API usage and prevents abuse. 
                Limits reset automatically to allow continued access.
              </p>
            </div>
          ) : (
            <div className="mt-2 flex items-start">
              <BoltIcon className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-gray-600">
                <strong>Remaining:</strong> {3 - attemptCount} free analysis{3 - attemptCount !== 1 ? 'es' : ''} left. 
                Each analysis includes real Google PageSpeed data and comprehensive SEO scoring.
              </p>
            </div>
          )}
        </motion.div>
        
        {error && (
          <motion.div 
            className="alert alert-error mt-4"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
          >
            <div className="flex items-center">
              <ExclamationTriangleIcon className="w-5 h-5 mr-3 text-amber-500" />
              <p className="font-medium">{error}</p>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Results Section */}
      {results && (
        <>
          {/* Score Section */}
          <motion.div 
            className="seo-analysis-section"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
              <ChartBarIcon className="w-5 h-5 mr-2" />
              Analysis Results
            </h3>
            <div className="flex items-center justify-center md:justify-start">
              <div className="relative">
                <motion.div 
                  className={`w-32 h-32 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-2xl ${
                    results.score > 70 ? 'score-excellent' : results.score > 50 ? 'score-good' : 'score-poor'
                  }`}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.8, type: "spring", bounce: 0.3 }}
                >
                  {results.score}
                </motion.div>
                <motion.div 
                  className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                >
                  {results.score > 70 ? <CheckCircleIcon className="w-5 h-5 text-green-500" /> : results.score > 50 ? <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500" /> : <XCircleIcon className="w-5 h-5 text-red-500" />}
                </motion.div>
              </div>
              <div className="ml-8">
                <h4 className="text-2xl font-bold text-gray-800">SEO Score</h4>
                <p className="text-gray-600 mt-1 text-lg">
                  {results.score > 70 
                    ? (<><SparklesIcon className="w-5 h-5 inline mr-1" />Excellent SEO Performance!</>) 
                    : results.score > 50 
                    ? (<><HandThumbUpIcon className="w-5 h-5 inline mr-1" />Good SEO Performance</>) 
                    : (<><WrenchScrewdriverIcon className="w-5 h-5 inline mr-1" />Needs Improvement</>)}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Recommendations Section */}
          <motion.div 
            className="seo-analysis-section"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
              <LightBulbIcon className="w-5 h-5 mr-2" />
              Recommendations ({results.recommendations.length})
            </h3>
            <div className="analysis-results">
              {results.recommendations.map((rec, index) => (
                <motion.div
                  key={rec.id}
                  className="analysis-item"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-start">
                    <div className={`score-badge ${
                      rec.priority === 'high' ? 'score-poor' : 'score-good'
                    }`}>
                      {rec.priority === 'high' ? <FireIcon className="w-5 h-5 text-red-500" /> : <BoltIcon className="w-5 h-5 text-yellow-500" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-gray-800">{rec.type}</h4>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          rec.priority === 'high' 
                            ? 'bg-red-100 text-red-700' 
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {rec.priority.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-gray-600">{rec.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Page Speed Insights */}
          {results.analysis.technicalAnalysis?.pageSpeed && (
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <PageSpeedInsights pageSpeedData={results.analysis.technicalAnalysis.pageSpeed} />
            </motion.div>
          )}

          {/* Export Options */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <ExportOptions 
              analysisData={{
                score: results.score,
                analysis: results.analysis,
                recommendations: results.recommendations
              }} 
            />
          </motion.div>
        </>
      )}
    </div>
  );
};

export default SEOAnalysis;