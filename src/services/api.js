import axios from 'axios';

// Environment-aware API URL configuration
const getApiUrl = () => {
  // Check if VITE_API_URL is available (from environment variables)
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // Fallback to environment detection
  if (import.meta.env.PROD) {
    return 'https://backend-euypvlhdw-hossam496s-projects.vercel.app';
  }
  
  // Default to localhost for development
  return 'http://localhost:5000';
};

const API = axios.create({
  baseURL: getApiUrl(),
  timeout: 10000,
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

export default API;
