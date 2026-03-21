import axios from 'axios';

const VITE_API_URL = import.meta.env.VITE_API_URL || 'https://backend1-eight-lovat.vercel.app';
export const API_BASE_URL = VITE_API_URL.replace(/\/$/, '');

let accessToken = null;

export const setAccessToken = (token) => {
  accessToken = token;
};

export const getAccessToken = () => accessToken;

export const saveAuthTokens = (newAccessToken, newRefreshToken) => {
  accessToken = newAccessToken;
  if (newRefreshToken) {
    localStorage.setItem(REFRESH_TOKEN_KEY, newRefreshToken);
  }
};

export const clearAuthTokens = () => {
  accessToken = null;
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Required for cookies
});

// Request interceptor to add Authorization header
api.interceptors.request.use(
  (config) => {
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

const REFRESH_TOKEN_KEY = 'rush_basket_refresh_token';
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and not already retrying
    if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url.includes('/api/auth/refresh')) {
      
      if (isRefreshing) {
        // Queue this request and wait for the refresh to complete
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const storedRefreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
        
        const response = await axios.post(
          `${API_BASE_URL}/api/auth/refresh`, 
          { refreshToken: storedRefreshToken }, 
          { withCredentials: true }
        );

        if (response.data.success) {
          const newToken = response.data.accessToken;
          saveAuthTokens(newToken, response.data.refreshToken);
          
          processQueue(null, newToken);
          isRefreshing = false;

          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        processQueue(refreshError, null);
        isRefreshing = false;
        
        // Refresh failed, clear tokens
        clearAuthTokens();
        window.dispatchEvent(new Event('authFailed'));
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export const getApiUrl = (endpoint) => {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_BASE_URL}${cleanEndpoint}`;
};

export default api;
