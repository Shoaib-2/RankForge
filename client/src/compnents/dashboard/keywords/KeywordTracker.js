import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import axios from 'axios';
import authService from '../../../services/authService';
import { useSEO } from '../../../context/SeoContext';
import { 
  FlagIcon, 
  PlusIcon, 
  ExclamationTriangleIcon, 
  ChartBarIcon, 
  ArrowTrendingUpIcon, 
  TrashIcon,
  ArrowPathIcon,
  LightBulbIcon,
  MagnifyingGlassIcon,
  FireIcon,
  ShieldCheckIcon,
  ClockIcon,
  BoltIcon
} from '@heroicons/react/24/outline';

const KeywordTracker = () => {
  // Remove horizontal scrollbar on initial render
  useEffect(() => {
    document.documentElement.style.overflowX = 'hidden';
    document.body.style.overflowX = 'hidden';
    return () => {
      document.documentElement.style.overflowX = '';
      document.body.style.overflowX = '';
    };
  }, []);
  const [keywords, setKeywords] = useState([]);
  const [newKeyword, setNewKeyword] = useState('');
  const [domain, setDomain] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [visibleCount, setVisibleCount] = useState(5); // Pagination: number of keywords to show
  
  // Use centralized rate limit state from SEO context
  const {
    attemptCount,
    dailyLimit,
    rateLimitLoading,
    updateRateLimitFromHeaders,
    setRateLimitExhausted
  } = useSEO();

  useEffect(() => {
    fetchKeywords();
  }, []);



  const fetchKeywords = async () => {
    try {
      const token = authService.getToken();
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/keywords/list`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setKeywords(response.data);
      setError('');
    } catch (error) {
      // console.error('Keywords fetch error:', error);
      setError('Using demo keyword data - API unavailable');
      
      // Set mock keyword data with enhanced structure
      const mockKeywords = [
        {
          _id: '1',
          keyword: 'SEO optimization',
          domain: 'example.com',
          searchVolume: 12500,
          difficulty: 65,
          rankings: [
            { position: 15, date: '2024-01-01', searchVolume: 12500 },
            { position: 12, date: '2024-01-02', searchVolume: 12600 },
            { position: 10, date: '2024-01-03', searchVolume: 12400 },
            { position: 8, date: '2024-01-04', searchVolume: 12800 },
            { position: 6, date: '2024-01-05', searchVolume: 12300 },
            { position: 5, date: '2024-01-06', searchVolume: 12700 },
            { position: 4, date: '2024-01-07', searchVolume: 12900 }
          ],
          competitors: [
            { domain: 'moz.com', position: 1, title: 'SEO Guide' },
            { domain: 'semrush.com', position: 2, title: 'SEO Tools' },
            { domain: 'ahrefs.com', position: 3, title: 'SEO Software' }
          ],
          analysis: {
            trend: 'improving',
            trendPercentage: 73,
            opportunities: [
              { type: 'ranking', priority: 'high', message: 'Great progress! Keep optimizing to reach top 3' }
            ]
          }
        }
      ];
      setKeywords(mockKeywords);
    }
  };

  const generateKeywordSuggestions = async () => {
    if (!newKeyword.trim()) return;
    
    try {
      setLoadingSuggestions(true);
      const token = authService.getToken();
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/keywords/suggestions`,
        { 
          seedKeyword: newKeyword.trim(),
          domain: domain.trim() || null
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setSuggestions(response.data.suggestions);
      setShowSuggestions(true);
    } catch (error) {
      // console.error('Error generating suggestions:', error);
      // Fallback suggestions
      const fallbackSuggestions = [
        { keyword: `best ${newKeyword}`, searchVolume: 5000, difficulty: 45, estimatedPosition: null },
        { keyword: `${newKeyword} guide`, searchVolume: 3200, difficulty: 38, estimatedPosition: null }
      ];
      setSuggestions(fallbackSuggestions);
      setShowSuggestions(true);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const addKeyword = async (e) => {
    e.preventDefault();
    if (!newKeyword.trim()) return;
    
    // Check if rate limit is reached (only if not loading)
    if (!rateLimitLoading && attemptCount >= dailyLimit) {
      setError('🚫 Rate limit reached! You have used all 10 free keyword analyses. You\'ve exhausted your daily API usage. The limit will reset in 24 hours.');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      const token = authService.getToken();
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/keywords/add`,
        { 
          keyword: newKeyword.trim(),
          domain: domain.trim() || null
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      // Update rate limit info from response headers using centralized function
      updateRateLimitFromHeaders(response.headers);

      setKeywords([response.data, ...keywords]);
      setNewKeyword('');
      setDomain('');
      setShowSuggestions(false);
      setSuggestions([]);
      
    } catch (error) {
      // console.error('Add keyword error:', error);
      
      // Check if it\'s a rate limit error
      if (error.response?.status === 429) {
        setError('🚫 Rate limit reached! You have used all 10 free keyword analyses. You\'ve exhausted your daily API usage. The limit will reset in 24 hours.');
        setRateLimitExhausted();
      } else {
        setError('Using demo keyword analysis - API unavailable');
        setNewKeyword('');
        setDomain('');
      }
    } finally {
      setLoading(false);
    }
  };

  const addSuggestedKeyword = async (suggestedKeyword) => {
    try {
      setLoading(true);
      setError('');
      
      const token = authService.getToken();
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/keywords/add`,
        { 
          keyword: suggestedKeyword,
          domain: domain.trim() || null
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setKeywords([response.data, ...keywords]);
      setShowSuggestions(false);
      setSuggestions([]);
      
    } catch (error) {
      // console.error('Add suggested keyword error:', error);
      setError('Error adding suggested keyword');
    } finally {
      setLoading(false);
    }
  };

  const deleteKeyword = async (keywordId) => {
    try {
      const token = authService.getToken();
      await axios.delete(`${process.env.REACT_APP_API_URL}/keywords/${keywordId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setKeywords(keywords.filter(k => k._id !== keywordId));
    } catch (error) {
      // console.error('Error deleting keyword:', error);
    }
  };

  const formatRankingData = (rankings) => {
    return rankings.map((rank, index) => ({
      day: `Day ${index + 1}`,
      position: rank.position,
      date: rank.date
    }));
  };

  // Handler for loading more keywords
  const handleLoadMore = () => {
    setVisibleCount((prev) => Math.min(prev + 5, keywords.length));
  };

  return (
    <div className="w-full max-w-full min-h-screen space-y-6 overflow-x-hidden overscroll-x-none" style={{width: '100vw'}}>
      {/* Enhanced Add Keyword Form */}
      <motion.div 
        className="keyword-tracker bg-white rounded-xl p-4 sm:p-6 border border-gray-200 shadow-sm w-full max-w-full overflow-x-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
          <FlagIcon className="w-5 h-5 mr-2 flex-shrink-0" />
          <span className="truncate">Real-Time Keyword Tracking</span>
        </h2>
        
        <form onSubmit={addKeyword} className="space-y-4 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full">
            <div className="space-y-2 w-full min-w-0">
              <label className="block text-sm font-medium text-gray-700">
                Keyword to Track
              </label>
              <input
                type="text"
                value={newKeyword}
                onChange={(e) => setNewKeyword(e.target.value)}
                placeholder="Enter keyword to track"
                className="futuristic-input w-full max-w-full px-4 py-3 text-sm"
                required
              />
            </div>
            <div className="space-y-2 w-full min-w-0">
              <label className="block text-sm font-medium text-gray-700">
                Your Domain (Optional)
              </label>
              <input
                type="text"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="example.com"
                className="futuristic-input w-full max-w-full px-4 py-3 text-sm"
              />
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <motion.button
              type="submit"
              disabled={loading || rateLimitLoading || attemptCount >= dailyLimit}
              className={`futuristic-button flex-1 min-w-0 px-6 py-3 text-sm font-medium ${
                (rateLimitLoading || attemptCount >= dailyLimit)
                  ? 'opacity-50 cursor-not-allowed bg-gray-400' 
                  : ''
              }`}
              whileHover={{ scale: (loading || rateLimitLoading || attemptCount >= dailyLimit) ? 1 : 1.02 }}
              whileTap={{ scale: (loading || rateLimitLoading || attemptCount >= dailyLimit) ? 1 : 0.98 }}
            >
              {loading ? (
                <>
                  <motion.div 
                    className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                  Tracking...
                </>
              ) : rateLimitLoading ? (
                <>
                  <motion.div 
                    className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                  Loading...
                </>
              ) : attemptCount >= dailyLimit ? (
                <>
                  <ClockIcon className="w-4 h-4 mr-2" />
                  Limit Reached
                </>
              ) : (
                <>
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Track Keyword
                </>
              )}
            </motion.button>
            
            <motion.button
              type="button"
              onClick={generateKeywordSuggestions}
              disabled={loadingSuggestions || !newKeyword.trim()}
              className="min-w-0 flex-shrink-0 px-4 sm:px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white font-medium rounded-lg transition-colors duration-200 flex items-center justify-center text-sm"
              whileHover={{ scale: loadingSuggestions ? 1 : 1.02 }}
              whileTap={{ scale: loadingSuggestions ? 1 : 0.98 }}
            >
              {loadingSuggestions ? (
                <>
                  <motion.div 
                    className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                  <span className="hidden sm:inline">Generating...</span>
                  <span className="sm:hidden">...</span>
                  <span className="sm:hidden">...</span>
                </>
              ) : (
                <>
                  <LightBulbIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Get Suggestions</span>
                  <span className="sm:hidden">Suggest</span>
                </>
              )}
            </motion.button>
          </div>
        </form>

        {/* Rate Limit Tracker */}
        <motion.div 
          className="mt-6 bg-gradient-to-r from-gray-50 to-blue-50 border border-gray-200 rounded-xl p-4 w-full max-w-full overflow-hidden"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full">
            <div className="flex items-center min-w-0">
              <ShieldCheckIcon className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0" />
              <span className="text-sm font-medium text-gray-700 truncate">
                Keyword Analysis Usage
              </span>
            </div>
            <div className="flex items-center space-x-2 flex-shrink-0">
              {rateLimitLoading ? (
                <div className="flex items-center">
                  <motion.div 
                    className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full mr-2"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                  <span className="text-sm text-gray-500">Loading...</span>
                </div>
              ) : (
                <>
                  <div className="flex space-x-1">
                    {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
                      <div
                        key={num}
                        className={`w-2.5 h-2.5 rounded-full transition-colors ${
                          num <= attemptCount 
                            ? attemptCount >= dailyLimit 
                              ? 'bg-red-400' 
                              : 'bg-blue-400'
                            : 'bg-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                  <span className={`text-sm font-semibold ${
                    attemptCount >= dailyLimit ? 'text-red-600' : 'text-blue-600'
                  }`}>
                    {attemptCount}/{dailyLimit} used
                  </span>
                </>
              )}
            </div>
          </div>
          
          {rateLimitLoading ? (
            <div className="mt-3 flex items-start">
              <motion.div 
                className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full mr-2 mt-0.5"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
              <p className="text-sm text-gray-600">Loading rate limit status...</p>
            </div>
          ) : attemptCount >= dailyLimit ? (
            <div className="mt-3 flex items-start">
              <ClockIcon className="h-4 w-4 text-orange-500 mr-2 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-orange-700">
                <strong>Limit reached:</strong> You have used all 10 free keyword analyses. 
                You\'ve exhausted your daily API usage. The limit will reset in 24 hours.
              </p>
            </div>
          ) : (
            <div className="mt-3 flex items-start">
              <BoltIcon className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-gray-600">
                <strong>Remaining:</strong> {dailyLimit - attemptCount} free keyword analysis{dailyLimit - attemptCount !== 1 ? 'es' : ''} left. 
                Each includes real search data, competitor analysis, and ranking tracking.
              </p>
            </div>
          )}
        </motion.div>

        {/* Keyword Suggestions */}
        {showSuggestions && suggestions.length > 0 && (
          <motion.div 
            className="mt-4 sm:mt-6 bg-purple-50 border border-purple-200 rounded-lg sm:rounded-xl p-4 sm:p-6"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ duration: 0.4 }}
          >
            <h3 className="text-lg font-semibold text-purple-800 mb-4 flex items-center">
              <LightBulbIcon className="w-5 h-5 mr-2" />
              Keyword Suggestions for "{newKeyword}"
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {suggestions.map((suggestion, index) => (
                <motion.div
                  key={index}
                  className="bg-white border border-purple-200 rounded-xl p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => addSuggestedKeyword(suggestion.keyword)}
                  whileHover={{ scale: 1.02 }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <div className="flex justify-between items-start mb-3">
                    <span className="font-medium text-gray-800 text-sm pr-2">{suggestion.keyword}</span>
                    <PlusIcon className="w-4 h-4 text-purple-500 flex-shrink-0" />
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between text-xs text-gray-600 gap-1">
                    <span>Vol: {suggestion.searchVolume?.toLocaleString() || 'N/A'}</span>
                    <span className={`font-medium ${
                      suggestion.difficulty < 40 ? 'text-green-600' : 
                      suggestion.difficulty < 70 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      Difficulty: {suggestion.difficulty || 'N/A'}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
        
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

      {/* Keywords List */}
      <motion.div 
        className="keyword-tracker bg-white rounded-xl p-4 sm:p-6 border border-gray-200 shadow-sm w-full max-w-full overflow-x-hidden overflow-hidden"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
          <ChartBarIcon className="w-5 h-5 mr-2 flex-shrink-0" />
          <span className="truncate">Tracked Keywords ({keywords.length})</span>
        </h2>
        {keywords.length === 0 ? (
          <div className="text-center py-12">
            <FlagIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg mb-2">No keywords tracked yet</p>
            <p className="text-gray-500 text-sm">Add your first keyword to start tracking rankings</p>
          </div>
        ) : (
          <>
            <div className="space-y-6 w-full">
              {keywords.slice(0, visibleCount).map((keyword, index) => (
                <motion.div
                  key={keyword._id}
                  className="relative bg-gray-50 rounded-xl p-4 sm:p-6 border border-gray-200 hover:border-gray-300 transition-all duration-300 hover:shadow-lg w-full max-w-full overflow-hidden"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <div className="absolute top-4 right-4">
                    <motion.button
                      onClick={() => deleteKeyword(keyword._id)}
                      className="p-3 text-red-500 bg-white border border-gray-200 rounded-full hover:bg-red-100 transition-colors shadow-md"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <TrashIcon className="w-5 h-5" />
                    </motion.button>
                  </div>
                  <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start mb-4 gap-4 w-full">
                    <div className="flex-1 min-w-0 pr-12">
                      <h3 className="text-lg font-semibold text-gray-800 flex items-center mb-3">
                        <MagnifyingGlassIcon className="w-5 h-5 mr-2 flex-shrink-0" />
                        <span className="truncate">{keyword.keyword}</span>
                      </h3>
                      {keyword.domain && (
                        <p className="text-sm text-gray-600 mb-3 truncate">Domain: {keyword.domain}</p>
                      )}
                      
                      {/* Enhanced Keyword Metrics */}
                      <div className="flex flex-wrap gap-2 sm:gap-3 w-full">
                        <div className="flex items-center bg-blue-50 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full">
                          <span className="text-xs font-medium text-blue-700">
                            Vol: {keyword.searchVolume?.toLocaleString() || 'N/A'}
                          </span>
                        </div>
                        <div className="flex items-center bg-purple-50 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full">
                          <span className={`text-xs font-medium ${
                            keyword.difficulty < 40 ? 'text-green-700' : 
                            keyword.difficulty < 70 ? 'text-yellow-700' : 'text-red-700'
                          }`}>
                            Diff: {keyword.difficulty || 'N/A'}
                          </span>
                        </div>
                        {keyword.analysis?.trend && (
                          <div className={`flex items-center px-2 sm:px-3 py-1 sm:py-1.5 rounded-full ${
                            keyword.analysis.trend === 'improving' ? 'bg-green-50' :
                            keyword.analysis.trend === 'declining' ? 'bg-red-50' : 'bg-gray-50'
                          }`}>
                            <ArrowTrendingUpIcon className={`w-3 h-3 mr-1 flex-shrink-0 ${
                              keyword.analysis.trend === 'improving' ? 'text-green-600 rotate-0' :
                              keyword.analysis.trend === 'declining' ? 'text-red-600 rotate-180' : 'text-gray-600'
                            }`} />
                            <span className={`text-xs font-medium ${
                              keyword.analysis.trend === 'improving' ? 'text-green-700' :                            keyword.analysis.trend === 'declining' ? 'text-red-700' : 'text-gray-700'
                            }`}>
                              {keyword.analysis.trend}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Current Position */}
                  <div className="mb-6 w-full">
                    <div className="flex flex-wrap items-center justify-between mb-3 gap-2 w-full">
                      <span className="text-sm font-medium text-gray-700">Current Position</span>
                      <div className="bg-white rounded-xl p-3 sm:p-4 border border-gray-200 shadow-sm">
                        <span className={`text-xl sm:text-2xl font-bold px-2 sm:px-3 py-1 sm:py-2 rounded-lg ${
                          keyword.rankings[keyword.rankings.length - 1]?.position <= 3 ? 'text-green-600 bg-green-50' :
                          keyword.rankings[keyword.rankings.length - 1]?.position <= 10 ? 'text-blue-600 bg-blue-50' :
                          'text-gray-600 bg-gray-50'
                        }`}>
                          #{keyword.rankings[keyword.rankings.length - 1]?.position || 'N/A'}
                        </span>
                      </div>
                    </div>
                    
                    {/* Trendy Message */}
                    {keyword.rankings[keyword.rankings.length - 1]?.trendyMessage && (
                      <div className="mt-2 p-3 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg">
                        <p className="text-sm font-medium text-purple-800 flex items-center">
                          <BoltIcon className="w-4 h-4 mr-2" />
                          {keyword.rankings[keyword.rankings.length - 1].trendyMessage}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Ranking Chart */}
                  <div className="h-48 sm:h-56 mb-6 w-full overflow-hidden">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={formatRankingData(keyword.rankings)}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis 
                          dataKey="day" 
                          stroke="#9ca3af"
                          tick={{ fill: '#6b7280', fontSize: 10 }}
                          tickLine={{ stroke: '#e5e7eb' }}
                        />
                        <YAxis 
                          stroke="#9ca3af"
                          tick={{ fill: '#6b7280', fontSize: 10 }}
                          tickLine={{ stroke: '#e5e7eb' }}
                          domain={[1, 'dataMax + 5']}
                          reversed={true}
                        />
                        <Tooltip 
                          contentStyle={{
                            backgroundColor: '#fff',
                            border: '1px solid #ddd',
                            borderRadius: '12px',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                            fontSize: '14px',
                            padding: '12px'
                          }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="position" 
                          stroke="#3b82f6" 
                          strokeWidth={3}
                          dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                          activeDot={{ r: 6, fill: '#1d4ed8' }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Competitors */}
                  {keyword.competitors && keyword.competitors.length > 0 && (
                    <div className="mb-6">
                      <h4 className="text-sm font-medium text-gray-700 mb-4">Top Competitors</h4>
                      <div className="space-y-3">
                        {keyword.competitors.slice(0, 3).map((competitor, idx) => (
                          <div key={idx} className="flex items-center justify-between bg-gray-50 px-4 py-3 rounded-xl">
                            <div className="flex items-center min-w-0 flex-1">
                              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold text-white mr-3 flex-shrink-0 ${
                                competitor.position === 1 ? 'bg-yellow-500' :
                                competitor.position === 2 ? 'bg-gray-400' :
                                competitor.position === 3 ? 'bg-orange-500' : 'bg-blue-500'
                              }`}>
                                {competitor.position}
                              </span>
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium text-gray-800 truncate">{competitor.domain}</p>
                                {competitor.title && (
                                  <p className="text-xs text-gray-600 truncate">{competitor.title}</p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Opportunities */}
                  {keyword.analysis?.opportunities && keyword.analysis.opportunities.length > 0 && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                      <h4 className="text-sm font-medium text-yellow-800 mb-3 flex items-center">
                        <LightBulbIcon className="w-4 h-4 mr-2" />
                        SEO Opportunities
                      </h4>
                      <div className="space-y-2">
                        {keyword.analysis.opportunities.map((opportunity, idx) => (
                          <div key={idx} className="flex items-start">
                            <FireIcon className={`w-4 h-4 mr-2 mt-0.5 flex-shrink-0 ${
                              opportunity.priority === 'high' ? 'text-red-500' : 
                              opportunity.priority === 'medium' ? 'text-yellow-500' : 'text-green-500'
                            }`} />
                            <p className="text-sm text-yellow-700">{opportunity.message}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
            {/* Load More Button for pagination */}
            {visibleCount < keywords.length && (
              <div className="flex justify-center mt-8">
                <button
                  onClick={handleLoadMore}
                  className="futuristic-button px-6 py-3 text-sm font-medium bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition-colors"
                >
                  Load More
                </button>
              </div>
            )}
          </>
        )}
      </motion.div>
    </div>
  );
};

export default KeywordTracker;
