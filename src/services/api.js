import axios from 'axios';

const VITE_API_URL = import.meta.env.VITE_API_URL || 'https://backend1-eight-lovat.vercel.app';
export const API_BASE_URL = VITE_API_URL.replace(/\/$/, '');

const TOKEN_KEY = 'rush_basket_token';
let token = localStorage.getItem(TOKEN_KEY) || null;

export const setAccessToken = (newToken) => {
  token = newToken;
  if (newToken) {
    localStorage.setItem(TOKEN_KEY, newToken);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
};

export const getAccessToken = () => token;

// For backward compatibility during migration
export const saveAuthTokens = (newToken) => {
  setAccessToken(newToken);
};

export const clearAuthTokens = () => {
  setAccessToken(null);
};

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Request interceptor to add Authorization header
api.interceptors.request.use(
  (config) => {
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Basic response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token and notify app if needed
      clearAuthTokens();
      // Optional: window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const getApiUrl = (endpoint) => {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_BASE_URL}${cleanEndpoint}`;
};

export default api;
