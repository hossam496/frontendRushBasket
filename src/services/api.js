import axios from 'axios';
import toast from 'react-hot-toast';

const VITE_API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
export const API_BASE_URL = VITE_API_URL.replace(/\/$/, '');

const isDevelopment = import.meta.env.DEV;

// More secure token handling
const TOKEN_KEY = 'rush_basket_token';

// Get tokens from secure storage
export const getAccessToken = () => {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
};

// Set tokens with security considerations
export const setAccessToken = (token, rememberMe = true) => {
  try {
    // Always use localStorage for persistence across sessions
    localStorage.setItem(TOKEN_KEY, token);
  } catch (error) {
    console.warn('Failed to store access token:', error);
  }
};

// Clear all tokens
export const clearAuthTokens = () => {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem('userData');
    localStorage.removeItem('userRole');
    // Also clear from sessionStorage just in case
    sessionStorage.removeItem(TOKEN_KEY);
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
      console.log(`[API] Added auth header to ${config.method?.toUpperCase()} ${config.url}`);
    } else {
      console.log(`[API] No token found for ${config.method?.toUpperCase()} ${config.url}`);
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
      console.error('[API] Network error:', error.message);
      return Promise.reject(error);
    }

    const status = error.response?.status;
    const errorMessage = error.response?.data?.message || '';

    // Handle 401 errors - only logout if it's a true auth failure
    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      console.log('[API] 401 error received:', errorMessage);
      
      // Don't logout on specific errors that might be temporary
      const isPermanentAuthFailure = 
        errorMessage.includes('expired') || 
        errorMessage.includes('invalid') ||
        errorMessage.includes('User not found');
      
      if (isPermanentAuthFailure) {
        console.log('[API] Permanent auth failure, clearing session');
        clearAuthTokens();
        localStorage.removeItem('userData');
        localStorage.removeItem('userRole');
        
        if (window.location.pathname !== '/login') {
          toast.error('Session expired - please login again');
          window.location.replace('/login');
        }
      } else {
        console.log('[API] Temporary auth issue, not logging out');
      }
      
      return Promise.reject(error);
    }

    // Handle other HTTP errors
    if (status >= 500) {
      console.error('[API] Server error:', status);
    } else if (status === 429) {
      toast.error('Too many requests - please wait');
    } else if (status === 403) {
      console.error('[API] Access denied');
    } else if (status === 404) {
      console.error('[API] Resource not found');
    }

    return Promise.reject(error);
  }
);

export const getApiUrl = (endpoint) => {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_BASE_URL}${cleanEndpoint}`;
};

export default api;
