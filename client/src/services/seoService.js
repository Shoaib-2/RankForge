import axios from 'axios';
import authService from './authService';

const API_URL = 'http://localhost:5000/api/seo';

const seoService = {
  async analyzeSite(url) {
    const token = authService.getToken();
    const response = await axios.post(
      `${API_URL}/analyze`,
      { url },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    return response.data;
  },

  async getAnalysisHistory() {
    const token = authService.getToken();
    const response = await axios.get(`${API_URL}/history`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  }
};

export default seoService;