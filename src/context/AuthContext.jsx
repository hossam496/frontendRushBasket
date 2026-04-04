import React, { createContext, useContext, useState, useEffect, useCallback, useRef, useMemo } from 'react';
import api, { getAccessToken, clearAuthTokens } from '../services/api';

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
  const initRef = useRef(false);

  // Helper: Clear Auth State
  const clearAuthState = useCallback(() => {
    clearAuthTokens();
    localStorage.removeItem('userData');
    localStorage.removeItem('userRole');
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    
    setUser(null);
    setIsAuthenticated(false);
    setIsAdmin(false);
    console.log('[AuthContext] Auth state cleared');
  }, []);

  // Helper: Validate Token
  const validateTokenWithBackend = useCallback(async (token) => {
    try {
      const response = await api.get('/api/auth/validate', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!response.data || response.data.success === false) {
        clearAuthState();
      }
    } catch (error) {
      console.error('[AuthContext] Validation error:', error.response?.data || error.message);
      if (error.response?.status === 401) {
        clearAuthState();
      }
    }
  }, [clearAuthState]);

  // Login handler
  const login = useCallback((userData, token) => {
    console.log("Login userData:", userData);
    console.log("User role:", userData.role);
    console.log("Is admin:", userData.role === 'admin');
    
    localStorage.setItem('rush_basket_token', token);
    localStorage.setItem('userData', JSON.stringify(userData));
    localStorage.setItem('userRole', userData.role || 'user');
    
    setUser(userData);
    setIsAuthenticated(true);
    setIsAdmin(userData.role === 'admin');
  }, []);

  // Logout handler
  const logout = useCallback(() => {
    clearAuthState();
  }, [clearAuthState]);

  // Initialize auth state
  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    const initializeAuth = async () => {
      try {
        const token = getAccessToken();
        const userData = localStorage.getItem('userData');
        const userRole = localStorage.getItem('userRole');
        
        if (token && userData) {
          try {
            const parsedUser = JSON.parse(userData);
            setUser(parsedUser);
            setIsAuthenticated(true);
            setIsAdmin(userRole === 'admin' || parsedUser.role === 'admin');
            
            // Validate token asynchronously
            validateTokenWithBackend(token);
          } catch (parseError) {
            clearAuthState();
          }
        } else if (token || userData) {
          clearAuthState();
        }
      } catch (error) {
        console.error('[AuthContext] Init error:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, [clearAuthState, validateTokenWithBackend]);

  const value = useMemo(() => ({
    user,
    isAuthenticated,
    isAdmin,
    loading,
    login,
    logout
  }), [user, isAuthenticated, isAdmin, loading, login, logout]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
