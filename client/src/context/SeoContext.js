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
      
      // Use the new AI availability endpoint for accurate rate limit status
      const response = await axios.create().get(
        'http://localhost:5000/api/seo/ai/availability',
        {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 5000 // 5 second timeout
        }
      );
      
      const availability = response.data.availability;
      const remainingRequests = availability.remainingRequests || 0;
      const dailyLimit = 10;
      
      setDailyLimit(dailyLimit);
      setAttemptCount(dailyLimit - remainingRequests);
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

  const updateRateLimitFromResponse = (responseData) => {
    // Update from AI usage data in response
    if (responseData.aiUsage) {
      const used = responseData.aiUsage.requestCount || 0;
      setDailyLimit(10);
      setAttemptCount(used);
    }
  };

  const setRateLimitExhausted = () => {
    setAttemptCount(10);
    setDailyLimit(10);
  };

  const refreshRateLimit = async () => {
    await fetchRateLimitStatus();
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
    updateRateLimitFromResponse,
    setRateLimitExhausted,
    refreshRateLimit
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