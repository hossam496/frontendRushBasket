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
      console.log("Request URL:", error.config?.baseURL + error.config?.url);
      console.log("Token used:", error.config?.headers?.Authorization ? "Present" : "Missing");
      
      // Check if this is an admin route
      if (error.config?.url?.includes('/api/stats')) {
        console.error("Admin stats access denied - user may not have admin role");
      }
    }
    return Promise.reject(error);
  }
);

export default API;

// Debug function to check current user role
export const checkUserRole = async () => {
  try {
    const response = await API.get('/api/auth/check-role');
    console.log("Current user role:", response.data.user.role);
    return response.data.user;
  } catch (error) {
    console.error("Error checking user role:", error);
    return null;
  }
};
