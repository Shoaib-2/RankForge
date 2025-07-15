import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from 'recharts';
import analyticsService from '../../../services/analyticsService';
import { 
  ChartBarIcon, 
  DevicePhoneMobileIcon,
  ComputerDesktopIcon,
  BoltIcon
} from '@heroicons/react/24/outline';

const AnalyticsDashboard = () => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState(30);

  useEffect(() => {
    fetchRealAnalytics();
  }, [selectedPeriod]);

  const fetchRealAnalytics = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await analyticsService.getDashboardAnalytics(selectedPeriod);
      
      if (response.success && response.data.charts.seoScores.length > 0) {
        setAnalyticsData(response.data);
        setError('');
      } else {
        // Fallback to mock data if no real data available
        setAnalyticsData(getMockAnalyticsData());
        setError('📊 Demo data shown - analyze websites to see real performance trends');
      }
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError('📊 Demo data shown - analyze websites to see real performance trends');
      // Fallback to mock data on error
      setAnalyticsData(getMockAnalyticsData());
    } finally {
      setLoading(false);
    }
  };

  const getMockAnalyticsData = () => {
    // Enhanced mock data for demo
    const dates = [];
    const today = new Date();
    for (let i = selectedPeriod - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      dates.push(date.toISOString().split('T')[0]);
    }

    return {
      charts: {
        seoScores: dates.map((date, index) => ({
          date,
          value: Math.round(75 + Math.sin(index * 0.3) * 10 + Math.random() * 5)
        })),
        pageSpeedMobile: dates.map((date, index) => ({
          date,
          value: Math.round(70 + Math.sin(index * 0.25) * 8 + Math.random() * 4)
        })),
        pageSpeedDesktop: dates.map((date, index) => ({
          date,
          value: Math.round(85 + Math.sin(index * 0.2) * 6 + Math.random() * 3)
        })),
        coreWebVitals: {
          lcp: dates.map((date, index) => ({
            date,
            value: parseFloat((2.5 + Math.sin(index * 0.15) * 0.5 + Math.random() * 0.2).toFixed(1))
          })),
          fid: dates.map((date, index) => ({
            date,
            value: Math.round(100 + Math.sin(index * 0.12) * 20 + Math.random() * 10)
          })),
          cls: dates.map((date, index) => ({
            date,
            value: parseFloat((0.1 + Math.sin(index * 0.1) * 0.03 + Math.random() * 0.01).toFixed(3))
          }))
        }
      },
      recentAnalyses: [
        { domain: 'linkedin.com', seoScore: 85, mobileScore: 78, desktopScore: 92, date: new Date() },
        { domain: 'github.com', seoScore: 72, mobileScore: 65, desktopScore: 85, date: new Date() }
      ],
      performanceMetrics: {
        averageScores: { seo: 78, mobile: 71, desktop: 88 },
        coreWebVitals: { lcp: 2.3, fid: 95, cls: 0.08 },
        totalAnalyses: 25,
        topDomains: [
          { domain: 'linkedin.com', count: 8 },
          { domain: 'github.com', count: 5 },
          { domain: 'google.com', count: 3 }
        ]
      }
    };
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getCoreWebVitalStatus = (metric, value) => {
    const thresholds = {
      lcp: { good: 2.5, poor: 4.0 },
      fid: { good: 100, poor: 300 },
      cls: { good: 0.1, poor: 0.25 }
    };
    
    const threshold = thresholds[metric];
    if (value <= threshold.good) return 'good';
    if (value <= threshold.poor) return 'needs-improvement';
    return 'poor';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Period Selection */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Performance Analytics</h2>
        <div className="flex space-x-2">
          {[7, 30, 90].map(days => (
            <button
              key={days}
              onClick={() => setSelectedPeriod(days)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedPeriod === days
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {days}d
            </button>
          ))}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-700 text-sm">{error}</p>
        </div>
      )}

      {/* Performance Summary Cards */}
      {analyticsData?.performanceMetrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100">
                <ChartBarIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg SEO Score</p>
                <p className={`text-2xl font-bold ${getScoreColor(analyticsData.performanceMetrics.averageScores.seo)}`}>
                  {analyticsData.performanceMetrics.averageScores.seo}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100">
                <DevicePhoneMobileIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Mobile Score</p>
                <p className={`text-2xl font-bold ${getScoreColor(analyticsData.performanceMetrics.averageScores.mobile)}`}>
                  {analyticsData.performanceMetrics.averageScores.mobile}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100">
                <ComputerDesktopIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Desktop Score</p>
                <p className={`text-2xl font-bold ${getScoreColor(analyticsData.performanceMetrics.averageScores.desktop)}`}>
                  {analyticsData.performanceMetrics.averageScores.desktop}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-orange-100">
                <BoltIcon className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Analyses</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analyticsData.performanceMetrics.totalAnalyses}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* SEO Scores Trend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">SEO Score Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={analyticsData?.charts?.seoScores || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={formatDate}
                fontSize={12}
              />
              <YAxis domain={[0, 100]} />
              <Tooltip 
                labelFormatter={(value) => formatDate(value)}
                formatter={(value) => [value, 'SEO Score']}
              />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke="#3B82F6" 
                fill="#93C5FD" 
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* PageSpeed Comparison */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">PageSpeed Scores</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analyticsData?.charts?.pageSpeedMobile?.map((item, index) => ({
              date: item.date,
              mobile: item.value,
              desktop: analyticsData?.charts?.pageSpeedDesktop?.[index]?.value || 0
            })) || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={formatDate}
                fontSize={12}
              />
              <YAxis domain={[0, 100]} />
              <Tooltip 
                labelFormatter={(value) => formatDate(value)}
                formatter={(value, name) => [value, name === 'mobile' ? 'Mobile Score' : 'Desktop Score']}
              />
              <Line 
                type="monotone" 
                dataKey="mobile" 
                stroke="#10B981" 
                strokeWidth={2}
                name="mobile"
              />
              <Line 
                type="monotone" 
                dataKey="desktop" 
                stroke="#8B5CF6" 
                strokeWidth={2}
                name="desktop"
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Core Web Vitals */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-xl shadow-lg p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Core Web Vitals Trends</h3>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LCP */}
          <div>
            <h4 className="text-sm font-medium text-gray-600 mb-2">Largest Contentful Paint (LCP)</h4>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={analyticsData?.charts?.coreWebVitals?.lcp || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={formatDate}
                  fontSize={10}
                />
                <YAxis fontSize={10} />
                <Tooltip 
                  labelFormatter={(value) => formatDate(value)}
                  formatter={(value) => [`${value}s`, 'LCP']}
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#F59E0B" 
                  fill="#FCD34D" 
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* FID */}
          <div>
            <h4 className="text-sm font-medium text-gray-600 mb-2">First Input Delay (FID)</h4>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={analyticsData?.charts?.coreWebVitals?.fid || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={formatDate}
                  fontSize={10}
                />
                <YAxis fontSize={10} />
                <Tooltip 
                  labelFormatter={(value) => formatDate(value)}
                  formatter={(value) => [`${value}ms`, 'FID']}
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#EF4444" 
                  fill="#FCA5A5" 
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* CLS */}
          <div>
            <h4 className="text-sm font-medium text-gray-600 mb-2">Cumulative Layout Shift (CLS)</h4>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={analyticsData?.charts?.coreWebVitals?.cls || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={formatDate}
                  fontSize={10}
                />
                <YAxis fontSize={10} />
                <Tooltip 
                  labelFormatter={(value) => formatDate(value)}
                  formatter={(value) => [value.toFixed(3), 'CLS']}
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#06B6D4" 
                  fill="#67E8F9" 
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </motion.div>

      {/* Recent Analyses & Top Domains */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Analyses */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Analyses</h3>
          <div className="space-y-3">
            {analyticsData?.recentAnalyses?.slice(0, 5).map((analysis, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{analysis.domain}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(analysis.date).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex space-x-3 text-sm">
                  <span className={`font-medium ${getScoreColor(analysis.seoScore)}`}>
                    SEO: {analysis.seoScore}
                  </span>
                  <span className={`font-medium ${getScoreColor(analysis.mobileScore)}`}>
                    M: {analysis.mobileScore}
                  </span>
                  <span className={`font-medium ${getScoreColor(analysis.desktopScore)}`}>
                    D: {analysis.desktopScore}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Top Domains */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Most Analyzed Domains</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={analyticsData?.performanceMetrics?.topDomains || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="domain" 
                fontSize={12}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis />
              <Tooltip 
                formatter={(value) => [value, 'Analyses']}
              />
              <Bar 
                dataKey="count" 
                fill="#3B82F6"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
