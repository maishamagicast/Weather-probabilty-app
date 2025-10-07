// src/services/api.js
import axiosInstance from './axios';

// ✅ Ensure Axios allows cross-origin cookies and doesn’t send preflight-conflicting headers
axiosInstance.defaults.withCredentials = false; // set true only if using cookie-based sessions
axiosInstance.defaults.headers.common['Accept'] = 'application/json';
delete axiosInstance.defaults.headers.common['Access-Control-Allow-Origin']; // should never be set client-side

export const authAPI = {
  login: async (email, password) => {
    try {
      const res = await axiosInstance.post('/auth/login', { email, password });

      if (res.data?.access_token) {
        localStorage.setItem('token', res.data.access_token);
        axiosInstance.defaults.headers.Authorization = `Bearer ${res.data.access_token}`;
      }

      return {
        success: true,
        user: res.data?.user || null,
        token: res.data?.access_token || null,
      };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.error || 'Login failed. Please check your credentials.',
      };
    }
  },

  signup: async (formData) => {
    try {
      const res = await axiosInstance.post('/auth/signup', formData);
      return { success: true, user: res.data?.user };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.error || 'Signup failed. Please try again.',
      };
    }
  },

  demoLogin: async () => {
    try {
      const res = await axiosInstance.get('/auth/demo');

      if (res.data?.access_token) {
        localStorage.setItem('token', res.data.access_token);
        axiosInstance.defaults.headers.Authorization = `Bearer ${res.data.access_token}`;
      }

      return {
        success: true,
        user: res.data?.user || null,
        token: res.data?.access_token || null,
      };
    } catch (err) {
      console.error('Demo login error:', err);
      return {
        success: false,
        error: err.response?.data?.error || 'Demo login failed. Please try again.',
      };
    }
  },
};

// 🌦️ Dashboard API Requests
export const dashboardAPI = {
  /**
   * Fetch 5-year NASA POWER climate data averages
   * @param {Object} payload - { month, day, year, latitude, longitude }
   */
  getNasaData: async (payload) => {
    try {
      const res = await axiosInstance.post('/dashboard/data', payload, {
        headers: { 'Content-Type': 'application/json' },
      });
      return { success: true, data: res.data.data, message: res.data.message };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.error || 'Failed to fetch NASA data.',
      };
    }
  },

  /**
   * Fetch short-term (7–30 days) weather forecast
   * @param {Object} payload - { latitude, longitude, days }
   */
  getForecast: async (payload) => {
    try {
      const res = await axiosInstance.post('/dashboard/forecast', payload, {
        headers: { 'Content-Type': 'application/json' },
      });
      return { success: true, data: res.data.data, message: res.data.message };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.error || 'Failed to fetch forecast data.',
      };
    }
  },

  /**
   * Fetch analysis results with threshold comparisons
   * @param {Object} payload - { latitude, longitude, start_date, end_date, thresholds... }
   */
  getAnalysisResults: async (payload) => {
    try {
      const res = await axiosInstance.post('/dashboard/analysis-results', payload, {
        headers: { 'Content-Type': 'application/json' },
      });
      return { success: true, data: res.data };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.error || 'Failed to fetch analysis results.',
      };
    }
  },
};

export default { authAPI, dashboardAPI };
