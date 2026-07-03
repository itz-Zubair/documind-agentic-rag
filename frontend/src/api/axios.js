import axios from 'axios';

const api = axios.create({
  // Automatically falls back to localhost if the environment variable isn't set
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000',
});

// 1. Request Interceptor: Inject JWT token automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 2. Response Interceptor: Handle expired tokens globally (401 Unauthorized)
api.interceptors.response.use(
  (response) => response, 
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('authToken');
      
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;