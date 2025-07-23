import axios from 'axios';

// Load environment variables (React automatically loads .env files)
const API_URL = process.env.REACT_APP_API_URL;

const authService = {
  // Set up axios interceptors for automatic token handling
  setupAxiosInterceptors() {
    let refreshAttempts = 0;
    const maxRefreshAttempts = 3;
    
    // Request interceptor to add auth header
    axios.interceptors.request.use(
      (config) => {
        const token = this.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor to handle token refresh
    axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        
        // Prevent infinite loops by checking if this is already a refresh token request
        if (originalRequest.url?.includes('/auth/refresh-token')) {
          // If refresh token request failed, logout immediately
          refreshAttempts = 0; // Reset counter
          this.logout();
          window.location.href = '/login';
          return Promise.reject(error);
        }
        
        if (error.response?.status === 401 && !originalRequest._retry && refreshAttempts < maxRefreshAttempts) {
          originalRequest._retry = true;
          refreshAttempts++;
          
          try {
            const refreshToken = this.getRefreshToken();
            if (!refreshToken) {
              // No refresh token, logout immediately
              refreshAttempts = 0; // Reset counter
              this.logout();
              window.location.href = '/login';
              return Promise.reject(error);
            }
            
            const response = await axios.post(`${API_URL}/auth/refresh-token`, {
              refreshToken
            });
            
            const { accessToken } = response.data;
            localStorage.setItem('accessToken', accessToken);
            refreshAttempts = 0; // Reset counter on success
            
            // Retry the original request with new token
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            return axios(originalRequest);
          } catch (refreshError) {
            // Refresh failed, logout user
            refreshAttempts = 0; // Reset counter
            this.logout();
            window.location.href = '/login';
            return Promise.reject(refreshError);
          }
        }
        
        // If max refresh attempts reached, logout
        if (refreshAttempts >= maxRefreshAttempts) {
          refreshAttempts = 0; // Reset counter
          this.logout();
          window.location.href = '/login';
        }
        
        return Promise.reject(error);
      }
    );
  },

  async register(userData) {
    const response = await axios.post(`${API_URL}/auth/register`, userData);
    if (response.data.accessToken) {
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      this.setupAxiosInterceptors();
    }
    return response.data;
  },

  async login(credentials) {
    try {
      // console.log('Making login request to:', `${API_URL}/auth/login`);
      // console.log('API_URL:', API_URL);
      // console.log('Credentials:', credentials);
      
      const response = await axios.post(`${API_URL}/auth/login`, credentials, {
        timeout: 10000 // 10 second timeout
      });
      
      if (response.data.accessToken) {
        localStorage.setItem('accessToken', response.data.accessToken);
        localStorage.setItem('refreshToken', response.data.refreshToken);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        this.setupAxiosInterceptors();
      }
      return response.data;
    } catch (error) {
      // console.error('Login error:', error.response?.data || error.message);
      throw error;
    }
  },

  async verifyEmailForReset(email) {
    const response = await axios.post(`${API_URL}/auth/verify-reset-email`, {
      email
    });
    return response.data;
  },

  async resetPassword({ email, newPassword }) {
    const response = await axios.post(`${API_URL}/auth/forgot-password`, {
      email,
      newPassword
    });
    return response.data;
  },

  logout() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    
    // Clear axios interceptors
    axios.interceptors.request.clear();
    axios.interceptors.response.clear();
  },

  getCurrentUser() {
    try {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    } catch (error) {
      // console.error('Error parsing user data from localStorage:', error);
      return null;
    }
  },

  getToken() {
    return localStorage.getItem('accessToken');
  },

  getRefreshToken() {
    return localStorage.getItem('refreshToken');
  },

  // Initialize interceptors when the service is loaded
  init() {
    const token = this.getToken();
    if (token) {
      this.setupAxiosInterceptors();
    }
  }
};

// Initialize the service
authService.init();

export default authService;