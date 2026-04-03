import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const API = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Helper functions for Auth
export const getAccessToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('rush_basket_token');
  }
  return null;
};

export const clearAuthTokens = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('rush_basket_token');
  }
};

// Interceptor to add auth token to every request
API.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor to handle unauthorized errors
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearAuthTokens();
      localStorage.removeItem('userData');
    }
    return Promise.reject(error);
  }
);

export { API_URL };
export default API;
