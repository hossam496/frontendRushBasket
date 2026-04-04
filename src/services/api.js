import axios from 'axios';

// Environment-aware API URL configuration
const getApiUrl = () => {
  // Check if VITE_API_URL is available (from environment variables)
  if (import.meta.env.VITE_API_URL) {
    console.log("API URL from env:", import.meta.env.VITE_API_URL);
    return import.meta.env.VITE_API_URL;
  }
  
  // Fallback to environment detection
  if (import.meta.env.PROD) {
    console.log("API URL (production): https://backend1-eight-lovat.vercel.app");
    return 'https://backend1-eight-lovat.vercel.app';
  }
  
  // Default to localhost for development
  console.log("API URL (development): http://localhost:5000");
  return 'http://localhost:5000';
};

const API = axios.create({
  baseURL: getApiUrl(),
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
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
    console.log("TOKEN:", token ? "Present" : "Missing");
    console.log("Request URL:", config.baseURL + config.url);
  } else {
    console.log("TOKEN: Missing for request:", config.baseURL + config.url);
  }
  return config;
});

// Interceptor to handle unauthorized errors
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("Unauthorized request - check token validity");
    }
    return Promise.reject(error);
  }
);

export default API;
