import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { saveAuthTokens, clearAuthTokens, getAccessToken } from '../services/api';

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

  // Initialize auth state from localStorage on app load
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const token = getAccessToken();
        const userData = localStorage.getItem('userData');
        const userRole = localStorage.getItem('userRole');
        
        console.log('[AuthContext] Initializing auth state:', { 
          hasToken: !!token, 
          hasUserData: !!userData,
          userRole 
        });
        
        // Only restore session if BOTH token AND user data exist
        if (token && userData) {
          try {
            const parsedUser = JSON.parse(userData);
            setUser(parsedUser);
            setIsAuthenticated(true);
            setIsAdmin(userRole === 'admin' || parsedUser.role === 'admin');
            console.log('[AuthContext] Session restored for user:', parsedUser.email);
          } catch (parseError) {
            console.error('[AuthContext] Error parsing user data:', parseError);
            clearAuthTokens();
            localStorage.removeItem('userData');
            localStorage.removeItem('userRole');
          }
        } else {
          console.log('[AuthContext] No valid session found');
          // Clean up any partial data
          if (!token) {
            clearAuthTokens();
            localStorage.removeItem('userData');
            localStorage.removeItem('userRole');
          }
        }
      } catch (error) {
        console.error('[AuthContext] Error initializing auth:', error);
        clearAuthTokens();
        localStorage.removeItem('userData');
        localStorage.removeItem('userRole');
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = useCallback((userData, token, rememberMe = false) => {
    console.log('[AuthContext] Login called for:', userData.email);
    
    // Save token first
    saveAuthTokens(token, rememberMe);
    
    // Then save user data
    localStorage.setItem('userData', JSON.stringify(userData));
    localStorage.setItem('userRole', userData.role || 'user');
    
    // Update state
    setUser(userData);
    setIsAuthenticated(true);
    setIsAdmin(userData.role === 'admin');
    
    console.log('[AuthContext] Login complete - isAdmin:', userData.role === 'admin');
  }, []);

  const logout = useCallback(() => {
    console.log('[AuthContext] Logout called');
    
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
