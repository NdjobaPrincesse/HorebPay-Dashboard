// axios.ts
import axios from 'axios';

// Base URL for API
// Use environment variable or fallback to '/api'
const baseURL = import.meta.env.VITE_API_URL || '/api';

// Create Axios instance
const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Ensure cookies are sent with requests
});

// Optional: Attach token from localStorage if needed
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); // your JWT token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Global response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn('Session expired or unauthorized');
      // Optional: Auto-logout if session expired
      // localStorage.removeItem('token');
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;