import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authService = {
  // Register new user
  register: async (userData) => {
    const response = await api.post('/api/auth/register', userData);
    return response;
  },

  // Login user
  login: async (credentials) => {
    console.log('🌐 AuthService: Sending login request to:', api.defaults.baseURL + '/api/auth/login');
    console.log('🌐 AuthService: Credentials:', credentials);
    
    try {
      const response = await api.post('/api/auth/login', credentials);
      console.log('🌐 AuthService: Response received:', response);
      return response;
    } catch (error) {
      console.error('🌐 AuthService: Request failed:', error);
      throw error;
    }
  },

  // Logout user
  logout: async () => {
    const response = await api.post('/api/auth/logout');
    return response;
  },

  // Verify token
  verifyToken: async () => {
    const response = await api.get('/api/auth/verify');
    return response;
  },

  // Forgot password
  forgotPassword: async (email) => {
    const response = await api.post('/api/auth/forgot-password', { email });
    return response;
  },

  // Reset password
  resetPassword: async (token, newPassword) => {
    const response = await api.post('/api/auth/reset-password', {
      token,
      newPassword
    });
    return response;
  },

  // Update profile
  updateProfile: async (profileData) => {
    const response = await api.put('/api/auth/users/profile', profileData);
    return response;
  },

  // Get user statistics
  getUserStats: async () => {
    const response = await api.get('/api/auth/users/stats');
    return response;
  }
};

export default api;
