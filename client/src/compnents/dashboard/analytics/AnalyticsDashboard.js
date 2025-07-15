import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import analyticsService from '../../../services/analyticsService';
import { 
  ChartBarIcon, 
  UsersIcon, 
  MagnifyingGlassIcon, 
  ArrowTrendingUpIcon, 
  EyeIcon, 
  HandRaisedIcon 
} from '@heroicons/react/24/outline';

const AnalyticsDashboard = () => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Set demo data immediately for better UX
    const mockData = {
      data: {
        pageViews: [
          { date: '2024-01-01', count: 1250 },
          { date: '2024-01-02', count: 1380 },
          { date: '2024-01-03', count: 1150 },
          { date: '2024-01-04', count: 1420 },
          { date: '2024-01-05', count: 1680 },
          { date: '2024-01-06', count: 1520 },
          { date: '2024-01-07', count: 1750 }
        ],
        visitors: [
          { date: '2024-01-01', count: 850 },
          { date: '2024-01-02', count: 920 },
          { date: '2024-01-03', count: 780 },
          { date: '2024-01-04', count: 1050 },
          { date: '2024-01-05', count: 1180 },
          { date: '2024-01-06', count: 1020 },
          { date: '2024-01-07', count: 1220 }
        ],
        searchImpressions: [
          { date: '2024-01-01', count: 2400 },
          { date: '2024-01-02', count: 2650 },
          { date: '2024-01-03', count: 2200 },
          { date: '2024-01-04', count: 2800 },
          { date: '2024-01-05', count: 3100 },
          { date: '2024-01-06', count: 2950 },
          { date: '2024-01-07', count: 3300 }
        ],
        searchClicks: [
          { date: '2024-01-01', count: 180 },
          { date: '2024-01-02', count: 210 },
          { date: '2024-01-03', count: 165 },
          { date: '2024-01-04', count: 240 },
          { date: '2024-01-05', count: 285 },
          { date: '2024-01-06', count: 260 },
          { date: '2024-01-07', count: 310 }
        ]
      }
    };
    
    // Set demo data immediately
    setAnalyticsData(mockData);
    setLoading(false);
    
    // Then try to fetch real data
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      const data = await analyticsService.getAnalyticsData();
      setAnalyticsData(data);
      setError('');
    } catch (error) {
      console.error('Analytics fetch error:', error);
      setError('Using demo analytics data - API unavailable');
      // Set mock analytics data
      const mockData = {
        data: {
          pageViews: [
            { date: '2024-01-01', count: 1250 },
            { date: '2024-01-02', count: 1380 },
            { date: '2024-01-03', count: 1150 },
            { date: '2024-01-04', count: 1420 },
            { date: '2024-01-05', count: 1680 },
            { date: '2024-01-06', count: 1520 },
            { date: '2024-01-07', count: 1750 }
          ],
          visitors: [
            { date: '2024-01-01', count: 850 },
            { date: '2024-01-02', count: 920 },
            { date: '2024-01-03', count: 780 },
            { date: '2024-01-04', count: 1050 },
            { date: '2024-01-05', count: 1180 },
            { date: '2024-01-06', count: 1020 },
            { date: '2024-01-07', count: 1220 }
          ],
          searchImpressions: [
            { date: '2024-01-01', count: 2400 },
            { date: '2024-01-02', count: 2650 },
            { date: '2024-01-03', count: 2200 },
            { date: '2024-01-04', count: 2800 },
            { date: '2024-01-05', count: 3100 },
            { date: '2024-01-06', count: 2950 },
            { date: '2024-01-07', count: 3300 }
          ],
          searchClicks: [
            { date: '2024-01-01', count: 180 },
            { date: '2024-01-02', count: 210 },
            { date: '2024-01-03', count: 165 },
            { date: '2024-01-04', count: 240 },
            { date: '2024-01-05', count: 285 },
            { date: '2024-01-06', count: 260 },
            { date: '2024-01-07', count: 310 }
          ]
        }
      };
      setAnalyticsData(mockData);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString();
  };

  if (loading) {
    return (
      <motion.div 
        className="flex items-center justify-center h-64"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center space-x-3 text-blue-600">
          <motion.div 
            className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <span className="font-medium">Loading analytics...</span>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Error Display (if any) */}
      {error && (
        <motion.div 
          className="alert alert-info"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex items-center">
            <span className="text-xl mr-3">ℹ️</span>
            <p className="font-medium">{error}</p>
          </div>
        </motion.div>
      )}
      {/* Main Page Views Chart */}
      <motion.div 
        className="chart-container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
          <ChartBarIcon className="w-5 h-5 mr-2" />
          Page Views Overview
        </h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={analyticsData?.data?.pageViews}>
              <defs>
                <linearGradient id="pageViewsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4a90e2" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#4a90e2" stopOpacity={0.05}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(74, 144, 226, 0.1)" />
              <XAxis 
                dataKey="date" 
                tickFormatter={formatDate}
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#666', fontSize: 12 }}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#666', fontSize: 12 }}
              />
              <Tooltip 
                labelFormatter={formatDate}
                formatter={(value) => [`${value} views`, 'Page Views']}
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid rgba(74, 144, 226, 0.2)',
                  borderRadius: '8px',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Area 
                type="monotone" 
                dataKey="count" 
                stroke="#4a90e2" 
                strokeWidth={3}
                fill="url(#pageViewsGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Secondary Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Visitors Chart */}
        <motion.div 
          className="chart-container"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <UsersIcon className="w-5 h-5 mr-2" />
            Unique Visitors
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analyticsData?.data?.visitors}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(16, 185, 129, 0.1)" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={formatDate}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#666', fontSize: 11 }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#666', fontSize: 11 }}
                />
                <Tooltip 
                  labelFormatter={formatDate}
                  formatter={(value) => [`${value} visitors`, 'Visitors']}
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid rgba(16, 185, 129, 0.2)',
                    borderRadius: '8px',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Search Performance Chart */}
        <motion.div 
          className="chart-container"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <MagnifyingGlassIcon className="w-5 h-5 mr-2" />
            Search Performance
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analyticsData?.data?.searchImpressions}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(245, 158, 11, 0.1)" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={formatDate}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#666', fontSize: 11 }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#666', fontSize: 11 }}
                />
                <Tooltip 
                  labelFormatter={formatDate}
                  formatter={(value) => [`${value} impressions`, 'Impressions']}
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid rgba(245, 158, 11, 0.2)',
                    borderRadius: '8px',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#f59e0b" 
                  strokeWidth={3}
                  dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#f59e0b', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Analytics Summary Cards */}
      <div className="dashboard-grid">
        <motion.div 
          className="stat-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          whileHover={{ scale: 1.02 }}
        >
          <div className="stat-card-icon" style={{ background: 'linear-gradient(135deg, #4a90e2 0%, #357abd 100%)' }}>
            <ArrowTrendingUpIcon className="w-6 h-6 text-white" />
          </div>
          <div className="stat-card-value">
            {analyticsData?.data?.pageViews?.reduce((sum, item) => sum + item.count, 0).toLocaleString()}
          </div>
          <div className="stat-card-label">Total Page Views</div>
        </motion.div>

        <motion.div 
          className="stat-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          whileHover={{ scale: 1.02 }}
        >
          <div className="stat-card-icon" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
            <UsersIcon className="w-6 h-6 text-white" />
          </div>
          <div className="stat-card-value">
            {analyticsData?.data?.visitors?.reduce((sum, item) => sum + item.count, 0).toLocaleString()}
          </div>
          <div className="stat-card-label">Total Visitors</div>
        </motion.div>

        <motion.div 
          className="stat-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          whileHover={{ scale: 1.02 }}
        >
          <div className="stat-card-icon" style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}>
            <EyeIcon className="w-6 h-6 text-white" />
          </div>
          <div className="stat-card-value">
            {analyticsData?.data?.searchImpressions?.reduce((sum, item) => sum + item.count, 0).toLocaleString()}
          </div>
          <div className="stat-card-label">Search Impressions</div>
        </motion.div>

        <motion.div 
          className="stat-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          whileHover={{ scale: 1.02 }}
        >
          <div className="stat-card-icon" style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)' }}>
            <HandRaisedIcon className="w-6 h-6 text-white" />
          </div>
          <div className="stat-card-value">
            {analyticsData?.data?.searchClicks?.reduce((sum, item) => sum + item.count, 0).toLocaleString()}
          </div>
          <div className="stat-card-label">Search Clicks</div>
        </motion.div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;