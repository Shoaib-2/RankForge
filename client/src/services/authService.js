import axios from 'axios';

const API_URL = "https://seotool-l1b5.onrender.com/api/auth";
const authService = {
  async register(userData) {
    const response = await axios.post(`${API_URL}/auth/register`, userData);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },



  async login(credentials) {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, credentials);
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error) {
      console.error('Login error:', error.response?.data || error.message);
      throw error;
    }
  },

  async resetPassword({ email, newPassword }) {
    const response = await axios.post(`${API_URL}/auth/forgot-password`, {
      email,
      newPassword
    });
    return response.data;
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser() {
    return JSON.parse(localStorage.getItem('user'));
  },

  getToken() {
    return localStorage.getItem('token');
  }
};

export default authService;