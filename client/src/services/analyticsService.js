import axios from 'axios';
import authService from './authService';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const analyticsService = {
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
  }
};

export default analyticsService;