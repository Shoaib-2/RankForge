import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import axios from 'axios';
import authService from '../../../services/authService';

const KeywordTracker = () => {
  const [keywords, setKeywords] = useState([]);
  const [newKeyword, setNewKeyword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchKeywords();
  }, []);

  const fetchKeywords = async () => {
    try {
      const token = authService.getToken();
      const response = await axios.get('http://localhost:5000/api/keywords/list', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setKeywords(response.data);
    } catch (error) {
      setError('Error fetching keywords');
    }
  };

  const addKeyword = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const token = authService.getToken();
      await axios.post('http://localhost:5000/api/keywords/add', 
        { keyword: newKeyword },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      setNewKeyword('');
      fetchKeywords();
    } catch (error) {
      setError('Error adding keyword');
    } finally {
      setLoading(false);
    }
  };

  const deleteKeyword = async (keywordId) => {
    try {
      const token = authService.getToken();
      await axios.delete(`http://localhost:5000/api/keywords/${keywordId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchKeywords();
    } catch (error) {
      setError('Error deleting keyword');
    }
  };

  const formatChartData = (rankings) => {
    return rankings.map((rank, index) => ({
      name: `Day ${index + 1}`,
      position: rank.position
    }));
  };

  return (
    <div className="space-y-6">
      {/* Add Keyword Form */}
      <div className="bg-white shadow-sm rounded-lg p-6">
        <h2 className="text-xl font-semibold text-blue-500 mb-4">Track New Keyword</h2>
        <form onSubmit={addKeyword} className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            value={newKeyword}
            onChange={(e) => setNewKeyword(e.target.value)}
            placeholder="Enter keyword to track"
            className="flex-1 rounded-md border border-gray-300 shadow-sm px-4 py-2 focus:ring-indigo-500 focus:border-indigo-500"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-md shadow-sm transition duration-300"
          >
            {loading ? 'Adding...' : 'Add Keyword'}
          </button>
        </form>
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </div>

      {/* Keywords List */}
      <div className="bg-white shadow-sm rounded-lg p-6">
        <h2 className="text-xl font-semibold text-blue-500 mb-4">Tracked Keywords</h2>
        <div className="space-y-6">
          {keywords.map((keyword) => (
            <div key={keyword._id} className="border rounded-lg p-4">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-medium text-blue-500">{keyword.keyword}</h3>
                  <p className="text-sm text-gray-500">
                    Latest Position: {keyword.rankings[keyword.rankings.length - 1]?.position || 'N/A'}
                  </p>
                </div>
                <button
                  onClick={() => deleteKeyword(keyword._id)}
                  className="flex items-center px-4 py-2 bg-red-600 hover:bg-blue-500 text-white font-semibold rounded-md shadow-sm transition duration-300"
                >
                  Delete
                </button>
              </div>

              {keyword.rankings.length > 0 && (
                <div className="h-64 mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={formatChartData(keyword.rankings)} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis reversed domain={[1, 'auto']} />
                      <Tooltip />
                      <Line 
                        type="monotone" 
                        dataKey="position" 
                        stroke="#4F46E5" 
                        strokeWidth={2}
                        dot={{ r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default KeywordTracker;