import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

// Custom hook for API calls with loading and error states
export const useFetch = (url, options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(url, options);
      setData(response.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'An error occurred');
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [url, options]);

  useEffect(() => {
    if (url) {
      fetchData();
    }
  }, [fetchData]);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch };
};

// Custom hook for POST requests
export const usePost = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const postData = useCallback(async (url, data, options = {}) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.post(url, data, options);
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'An error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { postData, loading, error };
};

// Custom hook for PUT requests
export const usePut = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const putData = useCallback(async (url, data, options = {}) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.put(url, data, options);
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'An error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { putData, loading, error };
};

// Custom hook for DELETE requests
export const useDelete = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const deleteData = useCallback(async (url, options = {}) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.delete(url, options);
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'An error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { deleteData, loading, error };
};
