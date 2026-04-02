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

// Interceptor to handle errors (e.g. 401 Unauthorized)
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 error and not already retrying
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Don't refresh for login/signup/logout
      if (['/api/auth/login', '/api/auth/register', '/api/auth/logout'].some(url => originalRequest.url.includes(url))) {
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      try {
        // Attempt to refresh the token using the refresh cookie
        const response = await axios.post(`${API_URL}/api/auth/refresh`, {}, { withCredentials: true });

        if (response.data.success) {
          const { accessToken } = response.data;
          localStorage.setItem('rush_basket_token', accessToken);

          // Retry the original request with the new token
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return API(originalRequest);
        }
      } catch (refreshError) {
        console.error('[API] Refresh token failed:', refreshError);
        // If refresh fails, clear all and redirect to login
        clearAuthTokens();
        localStorage.removeItem('userData');
        if (typeof window !== 'undefined' && !['/login', '/signup'].includes(window.location.pathname)) {
          window.location.href = '/login';
        }
      }
    }

    return Promise.reject(error);
  }
);

export { API_URL };
export default API;
