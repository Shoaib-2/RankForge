import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import axios from 'axios';
import authService from '../../../services/authService';
import { 
  FlagIcon, 
  PlusIcon, 
  ExclamationTriangleIcon, 
  ChartBarIcon, 
  ArrowTrendingUpIcon, 
  TrashIcon 
} from '@heroicons/react/24/outline';

const KeywordTracker = () => {
  const [keywords, setKeywords] = useState([]);
  const [newKeyword, setNewKeyword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Load demo data immediately, then try to fetch real data
    const mockKeywords = [
      {
        _id: '1',
        keyword: 'SEO optimization',
        rankings: [
          { position: 15, date: '2024-01-01' },
          { position: 12, date: '2024-01-02' },
          { position: 10, date: '2024-01-03' },
          { position: 8, date: '2024-01-04' },
          { position: 6, date: '2024-01-05' },
          { position: 5, date: '2024-01-06' },
          { position: 4, date: '2024-01-07' }
        ]
      },
      {
        _id: '2',
        keyword: 'digital marketing',
        rankings: [
          { position: 25, date: '2024-01-01' },
          { position: 23, date: '2024-01-02' },
          { position: 20, date: '2024-01-03' },
          { position: 18, date: '2024-01-04' },
          { position: 16, date: '2024-01-05' },
          { position: 14, date: '2024-01-06' },
          { position: 12, date: '2024-01-07' }
        ]
      },
      {
        _id: '3',
        keyword: 'website analysis',
        rankings: [
          { position: 8, date: '2024-01-01' },
          { position: 7, date: '2024-01-02' },
          { position: 6, date: '2024-01-03' },
          { position: 5, date: '2024-01-04' },
          { position: 3, date: '2024-01-05' },
          { position: 2, date: '2024-01-06' },
          { position: 1, date: '2024-01-07' }
        ]
      }
    ];
    
    // Set demo data first
    setKeywords(mockKeywords);
    setError('Demo data loaded - API connection may be unavailable');
    
    // Then try to fetch real data
    fetchKeywords();
  }, []);

  const fetchKeywords = async () => {
    try {
      const token = authService.getToken();
      const response = await axios.get('http://localhost:5000/api/keywords/list', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setKeywords(response.data);
      setError('');
    } catch (error) {
      console.error('Keywords fetch error:', error);
      setError('Using demo keyword data - API unavailable');
      // Set mock keyword data
      const mockKeywords = [
        {
          _id: '1',
          keyword: 'SEO optimization',
          rankings: [
            { position: 15, date: '2024-01-01' },
            { position: 12, date: '2024-01-02' },
            { position: 10, date: '2024-01-03' },
            { position: 8, date: '2024-01-04' },
            { position: 6, date: '2024-01-05' },
            { position: 5, date: '2024-01-06' },
            { position: 4, date: '2024-01-07' }
          ]
        },
        {
          _id: '2',
          keyword: 'digital marketing',
          rankings: [
            { position: 25, date: '2024-01-01' },
            { position: 23, date: '2024-01-02' },
            { position: 20, date: '2024-01-03' },
            { position: 18, date: '2024-01-04' },
            { position: 16, date: '2024-01-05' },
            { position: 14, date: '2024-01-06' },
            { position: 12, date: '2024-01-07' }
          ]
        },
        {
          _id: '3',
          keyword: 'website analysis',
          rankings: [
            { position: 8, date: '2024-01-01' },
            { position: 7, date: '2024-01-02' },
            { position: 6, date: '2024-01-03' },
            { position: 5, date: '2024-01-04' },
            { position: 3, date: '2024-01-05' },
            { position: 2, date: '2024-01-06' },
            { position: 1, date: '2024-01-07' }
          ]
        }
      ];
      setKeywords(mockKeywords);
    }
  };

  const addKeyword = async (e) => {
    e.preventDefault();
    if (!newKeyword.trim()) return;
    
    try {
      setLoading(true);
      setError('');
      
      // Create a new keyword with mock ranking data
      const newKeywordData = {
        _id: Date.now().toString(),
        keyword: newKeyword.trim(),
        rankings: [
          { position: Math.floor(Math.random() * 50) + 1, date: '2024-01-01' },
          { position: Math.floor(Math.random() * 45) + 1, date: '2024-01-02' },
          { position: Math.floor(Math.random() * 40) + 1, date: '2024-01-03' },
          { position: Math.floor(Math.random() * 35) + 1, date: '2024-01-04' },
          { position: Math.floor(Math.random() * 30) + 1, date: '2024-01-05' }
        ]
      };
      
      // Try to add via API first
      try {
        const token = authService.getToken();
        await axios.post('http://localhost:5000/api/keywords/add', 
          { keyword: newKeyword },
          { headers: { Authorization: `Bearer ${token}` }}
        );
        // If API succeeds, fetch updated list
        fetchKeywords();
      } catch (apiError) {
        // If API fails, add to local state
        console.log('API unavailable, adding locally:', apiError);
        setKeywords(prev => [...prev, newKeywordData]);
        setError('Keyword added locally - API unavailable');
      }
      
      setNewKeyword('');
    } catch (error) {
      console.error('Error adding keyword:', error);
      setError('Error adding keyword');
    } finally {
      setLoading(false);
    }
  };

  const deleteKeyword = async (keywordId) => {
    try {
      // Try API delete first
      try {
        const token = authService.getToken();
        await axios.delete(`http://localhost:5000/api/keywords/${keywordId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchKeywords();
      } catch (apiError) {
        // If API fails, remove from local state
        console.log('API unavailable, deleting locally:', apiError);
        setKeywords(prev => prev.filter(k => k._id !== keywordId));
        setError('Keyword deleted locally - API unavailable');
      }
    } catch (error) {
      console.error('Error deleting keyword:', error);
      setError('Error deleting keyword');
    }
  };

  const formatChartData = (rankings) => {
    return rankings.map((rank, index) => ({
      name: `Day ${index + 1}`,
      date: rank.date,
      position: rank.position
    }));
  };

  return (
    <div className="space-y-6">
      {/* Add Keyword Form */}
      <motion.div 
        className="keyword-tracker"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
          <FlagIcon className="w-6 h-6 mr-2" />
          Track New Keyword
        </h2>
        <form onSubmit={addKeyword} className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            value={newKeyword}
            onChange={(e) => setNewKeyword(e.target.value)}
            placeholder="Enter keyword to track"
            className="futuristic-input flex-1"
            required
          />
          <motion.button
            type="submit"
            disabled={loading}
            className="futuristic-button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? (
              <>
                <motion.div 
                  className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
                Adding...
              </>
            ) : (
              <>
                <PlusIcon className="w-4 h-4 mr-2" />
                Add Keyword
              </>
            )}
          </motion.button>
        </form>
        {error && (
          <motion.div 
            className="alert alert-error mt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <ExclamationTriangleIcon className="w-5 h-5 mr-2 text-red-500" />
            {error}
          </motion.div>
        )}
      </motion.div>

      {/* Keywords List */}
      <motion.div 
        className="keyword-tracker"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
          <ChartBarIcon className="w-6 h-6 mr-2" />
          Tracked Keywords ({keywords.length})
        </h2>
        <div className="keyword-list">
          {keywords.map((keyword, index) => (
            <motion.div 
              key={keyword._id} 
              className="keyword-item"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              layout
            >
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4 gap-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">{keyword.keyword}</h3>
                <div className="keyword-stats">
                  <span className="text-sm text-gray-600">
                    Latest Position: 
                    <span className={`ml-1 px-2 py-1 rounded-full text-xs font-bold ${
                      keyword.rankings[keyword.rankings.length - 1]?.position <= 10 
                        ? 'bg-green-100 text-green-700' 
                        : keyword.rankings[keyword.rankings.length - 1]?.position <= 50 
                          ? 'bg-yellow-100 text-yellow-700' 
                          : 'bg-red-100 text-red-700'
                    }`}>
                      #{keyword.rankings[keyword.rankings.length - 1]?.position || 'N/A'}
                    </span>
                  </span>
                  <span className="text-xs text-gray-500">
                    <ArrowTrendingUpIcon className="w-4 h-4 mr-1" /> {keyword.rankings.length} data points
                  </span>
                </div>
                </div>
                <motion.button
                  onClick={() => deleteKeyword(keyword._id)}
                  className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-colors duration-200 text-sm flex items-center gap-1 self-start"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <TrashIcon className="w-4 h-4" />
                  <span className="hidden sm:inline">Delete</span>
                </motion.button>
              </div>

              {keyword.rankings && keyword.rankings.length > 0 ? (
                <div className="keyword-chart-container">
                  <h4 className="text-sm font-medium text-gray-600 mb-3 flex items-center">
                    <ChartBarIcon className="w-4 h-4 mr-2" />
                    Ranking History - {keyword.keyword}
                  </h4>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart 
                        data={formatChartData(keyword.rankings)} 
                        margin={{ top: 10, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(74, 144, 226, 0.1)" />
                        <XAxis 
                          dataKey="name" 
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: '#666', fontSize: 12 }}
                        />
                        <YAxis 
                          reversed 
                          domain={[1, 'dataMax + 5']} 
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: '#666', fontSize: 12 }}
                          label={{ value: 'Position', angle: -90, position: 'insideLeft' }}
                        />
                        <Tooltip 
                          labelFormatter={(value) => `${value}`}
                          formatter={(value) => [`Position #${value}`, 'Ranking']}
                          contentStyle={{
                            backgroundColor: 'rgba(255, 255, 255, 0.98)',
                            border: '1px solid rgba(74, 144, 226, 0.2)',
                            borderRadius: '8px',
                            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                            fontSize: '14px'
                          }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="position" 
                          stroke="#4a90e2" 
                          strokeWidth={3}
                          dot={{ fill: '#4a90e2', strokeWidth: 2, r: 5 }}
                          activeDot={{ r: 7, stroke: '#4a90e2', strokeWidth: 2, fill: '#ffffff' }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              ) : (
                <div className="h-32 mt-4 bg-gray-50 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-2xl mb-2">
                      <ArrowTrendingUpIcon className="w-8 h-8 mx-auto text-blue-500" />
                    </div>
                    <p className="text-sm text-gray-500">No ranking data available yet</p>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
          
          {keywords.length === 0 && (
            <motion.div 
              className="text-center py-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <div className="text-6xl mb-4">
                <FlagIcon className="w-16 h-16 mx-auto text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No Keywords Tracked Yet</h3>
              <p className="text-gray-500">Add your first keyword above to start tracking your SEO performance!</p>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default KeywordTracker;