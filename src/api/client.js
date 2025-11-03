// API client configuration
import axios from 'axios';

const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include session token
apiClient.interceptors.request.use((config) => {
  const sessionToken = localStorage.getItem('sessionToken');
  if (sessionToken) {
    config.data = {
      ...config.data,
      sessionToken,
    };
  }
  return config;
});

// Add response interceptor to handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.data?.error === 'Invalid session token') {
      // Clear invalid session
      localStorage.removeItem('sessionToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
