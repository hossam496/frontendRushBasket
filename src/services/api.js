import axios from 'axios';
import toast from 'react-hot-toast';

const VITE_API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
export const API_BASE_URL = VITE_API_URL.replace(/\/$/, '');

// More secure token handling
const TOKEN_KEY = 'rush_basket_token';

// Get tokens from secure storage
export const getAccessToken = () => {
  try {
    return sessionStorage.getItem(TOKEN_KEY) || localStorage.getItem(TOKEN_KEY);
  } catch {
    return localStorage.getItem(TOKEN_KEY);
  }
};

// Set tokens with security considerations
export const setAccessToken = (token, rememberMe = false) => {
  try {
    if (rememberMe) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      sessionStorage.setItem(TOKEN_KEY, token);
    }
  } catch (error) {
    console.warn('Failed to store access token:', error);
    localStorage.setItem(TOKEN_KEY, token);
  }
};

// Clear all tokens
export const clearAuthTokens = () => {
  try {
    sessionStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(TOKEN_KEY);
  } catch (error) {
    console.warn('Failed to clear tokens:', error);
  }
};

// For backward compatibility
export const saveAuthTokens = (accessToken, rememberMe = false) => {
  setAccessToken(accessToken, rememberMe);
};

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // 60 second timeout for image uploads (especially base64)
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add Authorization header
api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    toast.error('Request failed');
    return Promise.reject(error);
  }
);

// Enhanced response interceptor with better error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle network errors
    if (!error.response) {
      toast.error('Network error - please check your connection');
      return Promise.reject(error);
    }

    // Handle 401 errors - no refresh token mechanism available
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // Clear tokens and redirect to login
      clearAuthTokens();
      localStorage.removeItem('userData');
      localStorage.removeItem('userRole');
      toast.error('Session expired - please login again');
      // Use a more reliable redirect method
      if (window.location.pathname !== '/login') {
        window.location.replace('/login');
      }
      return Promise.reject(error);
    }

    // Handle other HTTP errors
    if (error.response?.status >= 500) {
      toast.error('Server error - please try again later');
    } else if (error.response?.status === 429) {
      toast.error('Too many requests - please wait');
    } else if (error.response?.status === 403) {
      toast.error('Access denied');
    } else if (error.response?.status === 404) {
      toast.error('Resource not found');
    }

    return Promise.reject(error);
  }
);

export const getApiUrl = (endpoint) => {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_BASE_URL}${cleanEndpoint}`;
};

export default api;
