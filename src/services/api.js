const VITE_API_URL = import.meta.env.VITE_API_URL || 'https://backend1-eight-lovat.vercel.app';
export const API_BASE_URL = VITE_API_URL.replace(/\/$/, '');

export const getApiUrl = (endpoint) => {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_BASE_URL}${cleanEndpoint}`;
};

export default API_BASE_URL;
