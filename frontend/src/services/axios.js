// src/services/axiosInstance.js
import axios from 'axios';

// You can pull from an environment variable, fallback to localhost
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://weather-probabilty-app.onrender.com';

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // Optional: for cookies or session auth
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add JWT token if available
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); // Adjust if using cookies
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Optional: response interceptor for global error handling
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log or handle 401s globally here if needed
    return Promise.reject(error);
  }
);



export default axiosInstance;
