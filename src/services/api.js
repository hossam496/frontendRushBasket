import axios from 'axios';

const VITE_API_URL = import.meta.env.VITE_API_URL || 'https://backend1-eight-lovat.vercel.app';
export const API_BASE_URL = VITE_API_URL.replace(/\/$/, '');

// More secure token handling
const TOKEN_KEY = 'rush_basket_token';
const REFRESH_TOKEN_KEY = 'rush_basket_refresh_token';

// Get tokens from secure storage
export const getAccessToken = () => {
  try {
    return sessionStorage.getItem(TOKEN_KEY) || localStorage.getItem(TOKEN_KEY);
  } catch {
    return localStorage.getItem(TOKEN_KEY);
  }
};

export const getRefreshToken = () => {
  try {
    return sessionStorage.getItem(REFRESH_TOKEN_KEY) || localStorage.getItem(REFRESH_TOKEN_KEY);
  } catch {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
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

export const setRefreshToken = (token, rememberMe = false) => {
  try {
    if (rememberMe) {
      localStorage.setItem(REFRESH_TOKEN_KEY, token);
    } else {
      sessionStorage.setItem(REFRESH_TOKEN_KEY, token);
    }
  } catch (error) {
    console.warn('Failed to store refresh token:', error);
    localStorage.setItem(REFRESH_TOKEN_KEY, token);
  }
};

// Clear all tokens
export const clearAuthTokens = () => {
  try {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  } catch (error) {
    console.warn('Failed to clear tokens:', error);
  }
};

// For backward compatibility
export const saveAuthTokens = (accessToken, refreshToken = null, rememberMe = false) => {
  setAccessToken(accessToken, rememberMe);
  if (refreshToken) {
    setRefreshToken(refreshToken, rememberMe);
  }
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
  (error) => Promise.reject(error)
);

// Enhanced response interceptor with retry logic
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 errors
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // Try to refresh token
      const refreshToken = getRefreshToken();
      if (refreshToken) {
        try {
          const response = await axios.post(`${API_BASE_URL}/api/auth/refresh`, {
            refreshToken
          });
          
          const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data;
          setAccessToken(newAccessToken);
          if (newRefreshToken) {
            setRefreshToken(newRefreshToken);
          }
          
          // Retry original request
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        } catch (refreshError) {
          // Refresh failed, clear tokens and redirect to login
          clearAuthTokens();
          // Use React Router navigation instead of hard redirect
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      } else {
        // No refresh token, clear and redirect
        clearAuthTokens();
        window.location.href = '/login';
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
