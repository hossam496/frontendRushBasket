import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
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

  // Initialize auth state from localStorage on app load
  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    const initializeAuth = async () => {
      try {
        const token = getAccessToken();
        const userData = localStorage.getItem('userData');
        const userRole = localStorage.getItem('userRole');
        
        console.log('[AuthContext] Intializing auth - Found:', { 
          token: !!token, 
          user: !!userData,
          role: userRole 
        });
        
        if (token && userData) {
          try {
            const parsedUser = JSON.parse(userData);
            setUser(parsedUser);
            setIsAuthenticated(true);
            setIsAdmin(userRole === 'admin' || parsedUser.role === 'admin');
            
            // Validate token asynchronously
            validateTokenWithBackend(token);
          } catch (parseError) {
            console.error('[AuthContext] Session data corrupted:', parseError);
            clearAuthState();
          }
        } else if (token || userData) {
          // Partial session data found - clear it to be safe
          console.warn('[AuthContext] Partial session data found, clearing');
          clearAuthState();
        }
      } catch (error) {
        console.error('[AuthContext] Init error:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Async token validation (doesn't block UI)
  const validateTokenWithBackend = async (token) => {
    try {
      const response = await api.get('/api/auth/validate', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('[AuthContext] Validation response:', response.data);
      
      if (!response.data || response.data.success === false) {
        console.log('[AuthContext] Token validation explicit failure, clearing session');
        clearAuthState();
      }
    } catch (error) {
      console.error('[AuthContext] Validation error:', error.response?.data || error.message);
      // Only logout on definite auth failures, not network errors
      if (error.response?.status === 401) {
        console.log('[AuthContext] Token invalid (401), clearing session');
        clearAuthState();
      }
    }
  };

  const clearAuthState = useCallback(() => {
    clearAuthTokens();
    localStorage.removeItem('userData');
    localStorage.removeItem('userRole');
    localStorage.removeItem('token'); // Legacy key just in case
    sessionStorage.removeItem('token');
    
    setUser(null);
    setIsAuthenticated(false);
    setIsAdmin(false);
    console.log('[AuthContext] Auth state cleared');
  }, []);

  const login = useCallback((userData, token, rememberMe = true) => {
    console.log('[AuthContext] Login called for:', userData.email);
    
    // Save token and user data
    localStorage.setItem('rush_basket_token', token);
    localStorage.setItem('userData', JSON.stringify(userData));
    localStorage.setItem('userRole', userData.role || 'user');
    
    // Update state
    setUser(userData);
    setIsAuthenticated(true);
    setIsAdmin(userData.role === 'admin');
    
    console.log('[AuthContext] Login complete - isAdmin:', userData.role === 'admin');
  }, []);

  const logout = useCallback(() => {
    console.log('[AuthContext] Logout initiated');
    clearAuthState();
  }, [clearAuthState]);

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
