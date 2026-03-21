import axios from 'axios';

const VITE_API_URL = import.meta.env.VITE_API_URL || 'https://backend1-eight-lovat.vercel.app';
export const API_BASE_URL = VITE_API_URL.replace(/\/$/, '');

let accessToken = null;

export const setAccessToken = (token) => {
  accessToken = token;
};

export const getAccessToken = () => accessToken;

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

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and not already retrying
    if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url.includes('/api/auth/refresh')) {
      originalRequest._retry = true;

      try {
        const response = await axios.post(`${API_BASE_URL}/api/auth/refresh`, {}, { withCredentials: true });
        if (response.data.success) {
          accessToken = response.data.accessToken;
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, clear token and redirect to login if necessary
        accessToken = null;
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
