import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

// Custom hook for authentication
export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const userData = localStorage.getItem('userData');
        const userRole = localStorage.getItem('userRole');
        
        if (userData) {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
          setIsAuthenticated(true);
          setIsAdmin(userRole === 'admin');
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        // Clear corrupted data
        localStorage.removeItem('userData');
        localStorage.removeItem('userRole');
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = useCallback(async (email, password, rememberMe = false) => {
    try {
      setLoading(true);
      const response = await api.post('/api/auth/login', {
        email,
        password
      });

      if (response.data.success) {
        const { token, user: userData } = response.data;
        
        // Store tokens
        if (rememberMe) {
          localStorage.setItem('token', token);
        } else {
          sessionStorage.setItem('token', token);
        }
        
        // Store user data
        localStorage.setItem('userData', JSON.stringify(userData));
        localStorage.setItem('userRole', userData.role || 'user');
        
        setUser(userData);
        setIsAuthenticated(true);
        setIsAdmin(userData.role === 'admin');
        
        toast.success('Login successful!');
        return { success: true, user: userData };
      } else {
        toast.error(response.data.message || 'Login failed');
        return { success: false, message: response.data.message };
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Login failed';
      toast.error(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      // Call logout endpoint
      await api.post('/api/auth/logout');
    } catch (err) {
      console.error('Logout API call failed:', err);
    } finally {
      // Clear local storage regardless of API call success
      localStorage.removeItem('token');
      localStorage.removeItem('userData');
      localStorage.removeItem('userRole');
      sessionStorage.removeItem('token');
      
      setUser(null);
      setIsAuthenticated(false);
      setIsAdmin(false);
      
      toast.success('Logged out successfully');
    }
  }, []);

  const register = useCallback(async (userData) => {
    try {
      setLoading(true);
      const response = await api.post('/api/auth/register', userData);
      
      if (response.data.success) {
        toast.success('Registration successful! Please login.');
        return { success: true };
      } else {
        toast.error(response.data.message || 'Registration failed');
        return { success: false, message: response.data.message };
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Registration failed';
      toast.error(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    user,
    isAuthenticated,
    isAdmin,
    loading,
    login,
    logout,
    register
  };
};
