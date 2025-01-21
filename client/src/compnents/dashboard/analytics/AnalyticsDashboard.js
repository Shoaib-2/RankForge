import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import analyticsService from '../../../services/analyticsService';

const AnalyticsDashboard = () => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      const data = await analyticsService.getAnalyticsData();
      setAnalyticsData(data);
    } catch (error) {
      setError('Error fetching analytics data');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse flex space-x-4 text-blue-600">Loading analytics...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-md">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white shadow-sm rounded-lg p-6">
        <h2 className="text-xl font-semibold text-blue-500 mb-6">Website Analytics</h2>

        {/* Page Views Chart */}
        <div className="mb-8">
          <h3 className="text-lg font-medium text-blue-500 mb-4">Page Views</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analyticsData?.data?.pageViews}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={formatDate}
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={formatDate}
                  formatter={(value) => [`${value} views`, 'Page Views']}
                />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#4F46E5" 
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Visitors Chart */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-medium text-blue-500 mb-4">Unique Visitors</h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analyticsData?.data?.visitors}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tickFormatter={formatDate} />
                  <YAxis />
                  <Tooltip 
                    labelFormatter={formatDate}
                    formatter={(value) => [`${value} visitors`, 'Visitors']}
                  />
                  <Line type="monotone" dataKey="count" stroke="#10B981" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Search Performance */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-medium text-blue-500 mb-4">Search Performance</h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analyticsData?.data?.searchImpressions}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tickFormatter={formatDate} />
                  <YAxis />
                  <Tooltip 
                    labelFormatter={formatDate}
                    formatter={(value) => [`${value} impressions`, 'Impressions']}
                  />
                  <Line type="monotone" dataKey="count" stroke="#F59E0B" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white shadow-sm rounded-lg p-4">
          <h4 className="text-sm font-medium text-blue-500">Total Page Views</h4>
          <p className="text-2xl font-semibold text-gray-900">
            {analyticsData?.data?.pageViews?.reduce((sum, item) => sum + item.count, 0).toLocaleString()}
          </p>
        </div>
        <div className="bg-white shadow-sm rounded-lg p-4">
          <h4 className="text-sm font-medium text-blue-500">Total Visitors</h4>
          <p className="text-2xl font-semibold text-gray-900">
            {analyticsData?.data?.visitors?.reduce((sum, item) => sum + item.count, 0).toLocaleString()}
          </p>
        </div>
        <div className="bg-white shadow-sm rounded-lg p-4">
          <h4 className="text-sm font-medium text-blue-500">Search Impressions</h4>
          <p className="text-2xl font-semibold text-gray-900">
            {analyticsData?.data?.searchImpressions?.reduce((sum, item) => sum + item.count, 0).toLocaleString()}
          </p>
        </div>
        <div className="bg-white shadow-sm rounded-lg p-4">
          <h4 className="text-sm font-medium text-blue-500">Search Clicks</h4>
          <p className="text-2xl font-semibold text-gray-900">
            {analyticsData?.data?.searchClicks?.reduce((sum, item) => sum + item.count, 0).toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;