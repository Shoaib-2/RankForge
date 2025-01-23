import axios from 'axios';
import authService from './authService';

const API_URL = 'https://seotool-l1b5.onrender.com/api/seo';

const seoService = {
  /**
   * Analyzes the given site URL.
   * @param {string} url - The URL of the site to analyze.
   * @returns {Promise<Object>} The analysis result data.
   */
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

  /**
   * Retrieves the analysis history.
   * @returns {Promise<Object>} The analysis history data.
   */
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