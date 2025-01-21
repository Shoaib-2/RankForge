// src/components/dashboard/Dashboard.js
import React from 'react';
import AnalyticsDashboard from './analytics/AnalyticsDashboard';
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import authService from '../../services/authService';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";


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
      setErrorMessage('Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    fetchDashboardStats();
  }, [fetchDashboardStats]);



  // Stat Card Component
  const StatCard = ({ title, value, change, suffix = '', loading }) => (
    <div className="bg-white rounded-lg shadow-sm p-6">
      {loading ? (
        <div className="animate-bounce">
          <div className="h-4 bg-gray-500 rounded w-3/4"></div>
          <div className="mt-2 h-8 bg-gray-300 rounded w-1/2"></div>
          <div className="mt-2 h-4 bg-gray-200 rounded w-1/4"></div>
        </div>
      ) : (
        <>
          <div className="text-sm font-medium text-gray-500">{title}</div>
          <div className="mt-2 text-3xl font-bold text-indigo-600">
            {value}{suffix}
          </div>
          {change !== undefined && (
            <div className={`mt-2 text-sm ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {change >= 0 ? '↑' : '↓'} {Math.abs(change)}% from last month
            </div>
          )}
        </>
      )}
    </div>
  );
  
  return (
    <div className="space-y-6">
    {/* Header Section with Responsive Date Picker */}
    <div className="bg-white rounded-lg shadow-sm p-4 md:p-6">
      <div className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-blue-900">Dashboard Overview</h1>
          <p className="mt-1 text-sm text-gray-500">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
          {/* Date Range Picker */}
          <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
            <DatePicker
              selected={dateRange.startDate}
              onChange={(date) => setDateRange(prev => ({ ...prev, startDate: date }))}
              selectsStart
              startDate={dateRange.startDate}
              endDate={dateRange.endDate}
              className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:ring-indigo-500 focus:border-indigo-500"
              dateFormat="MMM d, yyyy"
            />
            <span className="hidden sm:block text-gray-500">to</span>
            <DatePicker
              selected={dateRange.endDate}
              onChange={(date) => setDateRange(prev => ({ ...prev, endDate: date }))}
              selectsEnd
              startDate={dateRange.startDate}
              endDate={dateRange.endDate}
              minDate={dateRange.startDate}
              className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:ring-indigo-500 focus:border-indigo-500"
              dateFormat="MMM d, yyyy"
            />
          </div>

          {/* Refresh Button */}
          <button
            onClick={fetchDashboardStats}
            disabled={loading}
            className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-md shadow-sm transition duration-300"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Refreshing...
              </>
            ) : (
              'Refresh'
            )}
          </button>
        </div>
      </div>


       {/* Error Display */}
       { errorMessage && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{errorMessage}</p>
              </div>
            </div>
          </div>
        )}

           {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Keywords" value={stats?.keywords?.count || 0} change={stats?.keywords?.change} />
        <StatCard title="Average Position" value={stats?.position?.value?.toFixed(1) || 0} change={stats?.position?.change} />
        <StatCard title="SEO Score" value={stats?.seoScore?.value || 0} suffix="%" change={stats?.seoScore?.change} />
        <StatCard title="Issues Found" value={stats?.issues?.count || 0} subtitle={`${stats?.issues?.highPriority || 0} high priority`} />
      </div>

       {/* Analytics Section */}
       <div className="bg-white rounded-lg shadow-sm transition-all duration-300 hover:shadow-md">
          <div className="p-6 border-b border-gray-300">
            <h2 className="text-lg font-semibold text-blue-500">Analytics Overview</h2>
          </div>
          <div className="p-6">
            <AnalyticsDashboard />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;