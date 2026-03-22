import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { saveAuthTokens, clearAuthTokens } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
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
        clearAuthTokens();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = useCallback((userData, token, rememberMe = false) => {
    saveAuthTokens(token, rememberMe);
    localStorage.setItem('userData', JSON.stringify(userData));
    localStorage.setItem('userRole', userData.role || 'user');
    setUser(userData);
    setIsAuthenticated(true);
    setIsAdmin(userData.role === 'admin');
  }, []);

  const logout = useCallback(() => {
    clearAuthTokens();
    localStorage.removeItem('userData');
    localStorage.removeItem('userRole');
    setUser(null);
    setIsAuthenticated(false);
    setIsAdmin(false);
  }, []);

  const value = {
    user,
    isAuthenticated,
    isAdmin,
    loading,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
