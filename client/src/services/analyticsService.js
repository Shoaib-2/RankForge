import axios from 'axios';
import authService from './authService';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const analyticsService = {
  // Legacy method
  async getAnalyticsData() {
    const token = authService.getToken();
    const response = await axios.get(`${API_URL}/analytics/data`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  async updateAnalytics(websiteUrl) {
    const token = authService.getToken();
    const response = await axios.post(
      `${API_URL}/analytics/update`,
      { websiteUrl },
      { headers: { Authorization: `Bearer ${token}` }}
    );
    return response.data;
  },

  // NEW REAL DATA METHODS
  async getDashboardAnalytics(days = 30) {
    const token = authService.getToken();
    const response = await axios.get(`${API_URL}/analytics/dashboard`, {
      headers: { Authorization: `Bearer ${token}` },
      params: { days }
    });
    return response.data;
  },

  async getTrends(days = 30) {
    const token = authService.getToken();
    const response = await axios.get(`${API_URL}/analytics/trends`, {
      headers: { Authorization: `Bearer ${token}` },
      params: { days }
    });
    return response.data;
  },

  async getRecentAnalyses(limit = 10) {
    const token = authService.getToken();
    const response = await axios.get(`${API_URL}/analytics/recent`, {
      headers: { Authorization: `Bearer ${token}` },
      params: { limit }
    });
    return response.data;
  },

  async getPerformanceMetrics() {
    const token = authService.getToken();
    const response = await axios.get(`${API_URL}/analytics/performance`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }
};

export default analyticsService;