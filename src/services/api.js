import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '';
const API_BASE_URL = API_URL;

const API = axios.create({
  baseURL: API_URL,
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
  }
  return config;
});

// Interceptor to handle errors (e.g. 401 Unauthorized)
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      clearAuthTokens();
      localStorage.removeItem('userData');
      if (!['/login', '/signup'].includes(window.location.pathname)) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export { API_URL, API_BASE_URL };
export default API;
