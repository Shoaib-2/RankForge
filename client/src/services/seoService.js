import axios from 'axios';
import authService from './authService';

const API_URL = process.env.REACT_APP_API_URL;

const seoService = {
  /**
   * Analyzes the given site URL.
   * @param {string} url - The URL of the site to analyze.
   * @returns {Promise<Object>} The analysis result data.
   */
  async analyzeSite(url) {
    const token = authService.getToken();
    const response = await axios.post(
      `${API_URL}/seo/analyze`,
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
    const response = await axios.get(`${API_URL}/seo/history`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  }
};

export default seoService;