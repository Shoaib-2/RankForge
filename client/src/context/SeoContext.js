import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import authService from '../services/authService';

const SEOContext = createContext(null);

export const SEOProvider = ({ children }) => {
  const [url, setUrl] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Centralized rate limit state
  const [attemptCount, setAttemptCount] = useState(0);
  const [dailyLimit, setDailyLimit] = useState(10);
  const [rateLimitLoading, setRateLimitLoading] = useState(true);

  // Fetch rate limit status on context initialization
  useEffect(() => {
    fetchRateLimitStatus();
  }, []);

  const fetchRateLimitStatus = async () => {
    try {
      setRateLimitLoading(true);
      const token = authService.getToken();
      if (!token) {
        // No token, assume fresh user
        setDailyLimit(10);
        setAttemptCount(0);
        setRateLimitLoading(false);
        return;
      }
      
      // Make a lightweight request to get rate limit headers
      // Use a fresh axios instance to avoid triggering interceptors
      const response = await axios.create().get(
        'http://localhost:5000/api/seo/history',
        {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 5000 // 5 second timeout
        }
      );
      
      const remaining = parseInt(response.headers['x-ratelimit-remaining'] || '10');
      const limit = parseInt(response.headers['x-ratelimit-limit'] || '10');
      setDailyLimit(limit);
      setAttemptCount(limit - remaining);
    } catch (error) {
      // If API call fails (auth, network, etc.), assume fresh user with full quota
      // Don't trigger auth refresh loops
      if (error.response?.status === 401) {
        // Token expired/invalid - let the user login again naturally
        setDailyLimit(10);
        setAttemptCount(0);
      } else {
        // For other errors, also assume fresh user
        setDailyLimit(10);
        setAttemptCount(0);
      }
    } finally {
      setRateLimitLoading(false);
    }
  };

  const updateRateLimitFromHeaders = (headers) => {
    const remaining = parseInt(headers['x-ratelimit-remaining'] || '0');
    const limit = parseInt(headers['x-ratelimit-limit'] || '10');
    setDailyLimit(limit);
    setAttemptCount(limit - remaining);
  };

  const setRateLimitExhausted = () => {
    setAttemptCount(10);
    setDailyLimit(10);
  };

  const clearAnalysis = () => {
    setUrl('');
    setResults(null);
    setError('');
  };

  const value = {
    url,
    setUrl,
    results,
    setResults,
    loading,
    setLoading,
    error,
    setError,
    clearAnalysis,
    // Rate limit state and functions
    attemptCount,
    dailyLimit,
    rateLimitLoading,
    fetchRateLimitStatus,
    updateRateLimitFromHeaders,
    setRateLimitExhausted
  };

  return (
    <SEOContext.Provider value={value}>
      {children}
    </SEOContext.Provider>
  );
};

export const useSEO = () => {
  const context = useContext(SEOContext);
  if (!context) {
    throw new Error('useSEO must be used within a SEOProvider');
  }
  return context;
};