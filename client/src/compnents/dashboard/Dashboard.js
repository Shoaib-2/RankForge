// src/components/dashboard/Dashboard.js
import React from 'react';
import { motion } from 'framer-motion';
import AnalyticsDashboard from './analytics/AnalyticsDashboard';
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import authService from '../../services/authService';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { 
  ArrowPathIcon, 
  ExclamationTriangleIcon, 
  MagnifyingGlassIcon, 
  ChartBarIcon, 
  StarIcon, 
  BoltIcon 
} from '@heroicons/react/24/outline';


const Dashboard = () => {
  const [stats, setStats] = useState({
    keywords: { count: 0, change: 0 },
    position: { value: 0, change: 0 },
    seoScore: { value: 0, change: 0 },
    issues: { count: 0, highPriority: 0 }
  });
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)), // Last 30 days
    endDate: new Date()
  });
  
  const fetchDashboardStats = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMessage(null);
      const token = authService.getToken();
      const response = await axios.get('http://localhost:5000/api/dashboard/stats', {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          startDate: dateRange.startDate.toISOString(),
          endDate: dateRange.endDate.toISOString()
        }
      });
      setStats(response.data);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      setErrorMessage('Using demo data - API unavailable');
      // Set mock data for demonstration
      setStats({
        keywords: { count: 25, change: 12.5 },
        position: { value: 4.8, change: -2.1 },
        seoScore: { value: 78, change: 5.3 },
        issues: { count: 12, highPriority: 3, change: -8.2 }
      });
      setLastUpdated(new Date());
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    // Set demo data immediately for better UX
    const demoStats = {
      keywords: { count: 25, change: 12.5 },
      position: { value: 4.8, change: -2.1 },
      seoScore: { value: 78, change: 5.3 },
      issues: { count: 12, highPriority: 3, change: -8.2 }
    };
    
    console.log('Setting demo stats:', demoStats);
    setStats(demoStats);
    setLastUpdated(new Date());
    setLoading(false);
    
    // Then try to fetch real data
    fetchDashboardStats();
  }, [fetchDashboardStats]);



  // Stat Card Component
  const StatCard = ({ title, value, change, suffix = '', loading, icon, gradient, delay = 0 }) => {
    return (
      <motion.div 
        className="stat-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay }}
        whileHover={{ 
          scale: 1.1,
          transition: { duration: 0.1 }
        }}
      >
        <div className="stat-card-icon" style={{ background: gradient }}>
          {icon}
        </div>
        {loading ? (
          <div className="space-y-3">
            <div className="loading-skeleton h-4 w-3/4"></div>
            <div className="loading-skeleton h-8 w-1/2"></div>
            <div className="loading-skeleton h-4 w-1/4"></div>
          </div>
        ) : (
          <>
            <div className="stat-card-value">
              {typeof value === 'number' ? value : (value || '0')}{suffix}
            </div>
            <div className="stat-card-label">{title}</div>
            {typeof change === 'number' && (
              <div className={`mt-2 text-sm font-semibold flex items-center ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                <span className="mr-1">{change >= 0 ? '↗' : '↘'}</span>
                {Math.abs(change).toFixed(1)}%
              </div>
            )}
          </>
        )}
      </motion.div>
    );
  };
  
  return (
    <div className="dashboard-container">
      <motion.div 
        className="dashboard-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div>
          <h1 className="dashboard-title">Dashboard Overview</h1>
          <p className="text-sm text-gray-600 mt-1">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </p>
        </div>

        <div className="dashboard-controls">
          {/* Date Range Picker */}
          <div className="flex flex-col sm:flex-row gap-2 items-center">
            <DatePicker
              selected={dateRange.startDate}
              onChange={(date) => setDateRange(prev => ({ ...prev, startDate: date }))}
              selectsStart
              startDate={dateRange.startDate}
              endDate={dateRange.endDate}
              className="futuristic-input text-responsive"
              dateFormat="MMM d, yyyy"
              placeholderText="Start Date"
            />
            <span className="hidden sm:block text-gray-500 text-sm">to</span>
            <DatePicker
              selected={dateRange.endDate}
              onChange={(date) => setDateRange(prev => ({ ...prev, endDate: date }))}
              selectsEnd
              startDate={dateRange.startDate}
              endDate={dateRange.endDate}
              minDate={dateRange.startDate}
              className="futuristic-input text-responsive"
              dateFormat="MMM d, yyyy"
              placeholderText="End Date"
            />
          </div>

          {/* Refresh Button */}
          <motion.button
            onClick={fetchDashboardStats}
            disabled={loading}
            className="futuristic-button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {loading ? (
              <>
                <motion.div 
                  className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
                Refreshing...
              </>
            ) : (
              <>
                <ArrowPathIcon className="w-4 h-4 mr-2" />
                Refresh
              </>
            )}
          </motion.button>
        </div>
      </motion.div>

      {/* Error Display */}
      {errorMessage && (
        <motion.div 
          className="alert alert-error"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex items-center">
            <ExclamationTriangleIcon className="w-5 h-5 mr-3 text-amber-500" />
            <p className="font-medium">{errorMessage}</p>
          </div>
        </motion.div>
      )}

      {/* Stats Grid */}
      <div className="dashboard-grid">
        <StatCard 
          title="Total Keywords" 
          value={stats?.keywords?.count} 
          change={stats?.keywords?.change} 
          icon={<MagnifyingGlassIcon className="w-6 h-6" />}
          gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
          delay={0.1}
          loading={loading}
        />
        <StatCard 
          title="Average Position" 
          value={stats?.position?.value ? stats.position.value.toFixed(1) : 0} 
          change={stats?.position?.change} 
          icon={<ChartBarIcon className="w-6 h-6" />}
          gradient="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
          delay={0.2}
          loading={loading}
        />
        <StatCard 
          title="SEO Score" 
          value={stats?.seoScore?.value} 
          suffix="%" 
          change={stats?.seoScore?.change}
          icon={<StarIcon className="w-6 h-6" />}
          gradient="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
          delay={0.3}
          loading={loading}
        />
        <StatCard 
          title="Issues Found" 
          value={stats?.issues?.count} 
          change={stats?.issues?.change}
          icon={<BoltIcon className="w-6 h-6" />}
          gradient="linear-gradient(135deg, #fa709a 0%, #fee140 100%)"
          delay={0.4}
          loading={loading}
        />
      </div>

      {/* Analytics Section */}
      <motion.div 
        className="chart-container mt-8"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
      >
        <h2 className="chart-title mb-6">Analytics Overview</h2>
        <AnalyticsDashboard />
      </motion.div>
    </div>
  );
};

export default Dashboard;