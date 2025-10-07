import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://weather-probabilty-app.onrender.com';

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token if available
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle 401 globally
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token'); // clear token
      window.location.href = '/login';  // optional redirect
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
