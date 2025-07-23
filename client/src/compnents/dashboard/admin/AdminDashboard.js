import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import authService from '../../../services/authService';
import {
  ChartBarIcon,
  UsersIcon,
  CpuChipIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  SparklesIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUsageStats();
    // Refresh stats every 30 seconds
    const interval = setInterval(fetchUsageStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchUsageStats = async () => {
    try {
      const token = authService.getToken();
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/seo/ai/usage-stats`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        setStats(response.data.stats);
        setError('');
      }
    } catch (err) {
      console.error('Error fetching usage stats:', err);
      setError('Failed to load usage statistics');
    } finally {
      setLoading(false);
    }
  };

  const getUsagePercentage = () => {
    if (!stats?.daily) return 0;
    return (stats.daily.requests / stats.limits.global) * 100;
  };

  const getStatusColor = () => {
    const percentage = getUsagePercentage();
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 70) return 'text-yellow-600';
    return 'text-green-600';
  };

  const formatTimeUntilReset = () => {
    if (!stats?.limits?.resetTime) return 'Unknown';
    
    const now = new Date();
    const reset = new Date(stats.limits.resetTime);
    const diff = reset.getTime() - now.getTime();
    
    if (diff <= 0) return 'Resetting soon...';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <motion.div 
          className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <motion.div 
        className="flex items-center justify-between"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <ChartBarIcon className="h-8 w-8 mr-3 text-purple-600" />
            AI Usage Dashboard
          </h1>
          <p className="text-gray-600 mt-1">Monitor AI analysis usage and performance</p>
        </div>
        <button
          onClick={fetchUsageStats}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200"
        >
          Refresh
        </button>
      </motion.div>

      {error && (
        <motion.div 
          className="bg-red-50 border border-red-200 rounded-lg p-4"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mr-2" />
            <span className="text-red-700">{error}</span>
          </div>
        </motion.div>
      )}

      {stats && (
        <>
          {/* Key Metrics Cards */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {/* Daily Requests */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Daily Requests</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.daily.requests}</p>
                  <p className="text-xs text-gray-500">
                    of {stats.limits.global} limit
                  </p>
                </div>
                <CpuChipIcon className="h-8 w-8 text-blue-500" />
              </div>
              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-500 ${
                      getUsagePercentage() >= 90 ? 'bg-red-500' :
                      getUsagePercentage() >= 70 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min(100, getUsagePercentage())}%` }}
                  />
                </div>
                <p className={`text-xs mt-1 font-medium ${getStatusColor()}`}>
                  {getUsagePercentage().toFixed(1)}% used
                </p>
              </div>
            </div>

            {/* Unique Users */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Users</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.daily.uniqueUsers}</p>
                  <p className="text-xs text-gray-500">using AI today</p>
                </div>
                <UsersIcon className="h-8 w-8 text-green-500" />
              </div>
            </div>

            {/* AI Insights Generated */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">AI Insights</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.daily.insights}</p>
                  <p className="text-xs text-gray-500">generated today</p>
                </div>
                <SparklesIcon className="h-8 w-8 text-purple-500" />
              </div>
            </div>

            {/* Unique URLs */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Unique URLs</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.daily.uniqueIPs}</p>
                  <p className="text-xs text-gray-500">analyzed today</p>
                </div>
                <GlobeAltIcon className="h-8 w-8 text-indigo-500" />
              </div>
            </div>
          </motion.div>

          {/* System Status */}
          <motion.div 
            className="bg-white rounded-lg border border-gray-200 p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <CheckCircleIcon className="h-6 w-6 text-green-500 mr-2" />
              System Status
            </h3>
            
            <div className="grid md:grid-cols-3 gap-6">
              {/* Service Status */}
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <div className="h-3 w-3 bg-green-400 rounded-full mr-2"></div>
                  <span className="text-sm font-medium text-gray-700">AI Service</span>
                </div>
                <p className="text-xs text-gray-600">Operational</p>
              </div>

              {/* Rate Limits */}
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <ClockIcon className="h-4 w-4 text-blue-500 mr-2" />
                  <span className="text-sm font-medium text-gray-700">Rate Limits</span>
                </div>
                <p className="text-xs text-gray-600">
                  {stats.limits.perUser} per user/day
                </p>
              </div>

              {/* Reset Time */}
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <ClockIcon className="h-4 w-4 text-purple-500 mr-2" />
                  <span className="text-sm font-medium text-gray-700">Resets In</span>
                </div>
                <p className="text-xs text-gray-600">
                  {formatTimeUntilReset()}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Usage Warnings */}
          {getUsagePercentage() >= 80 && (
            <motion.div 
              className="bg-yellow-50 border border-yellow-200 rounded-lg p-4"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="flex items-start">
                <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500 mr-2 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-yellow-800">
                    High Usage Warning
                  </h4>
                  <p className="text-sm text-yellow-700 mt-1">
                    AI service usage is at {getUsagePercentage().toFixed(1)}%. 
                    Consider monitoring closely or implementing additional rate limiting.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Portfolio Note */}
          <motion.div 
            className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg p-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className="flex items-start">
              <SparklesIcon className="h-5 w-5 text-purple-600 mr-2 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-purple-800">
                  Portfolio Demo Dashboard
                </h4>
                <p className="text-sm text-purple-700 mt-1">
                  This admin dashboard demonstrates enterprise-level monitoring capabilities 
                  for AI service usage, rate limiting, and cost management. In production, 
                  this would include additional metrics like token usage, cost tracking, 
                  and automated alerts.
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
