import axios from 'axios';

// Determine Environment
const baseURL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  // CRITICAL: This allows the Server's Cookie to stick
  withCredentials: true 
});

// We don't need to manually attach a token anymore if using Cookies,
// but we leave this here just in case you switch back to JWT later.
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
       console.warn("Session Expired or Invalid");
       // Optional: Auto-logout if cookie dies
       // localStorage.removeItem('userId');
       // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;