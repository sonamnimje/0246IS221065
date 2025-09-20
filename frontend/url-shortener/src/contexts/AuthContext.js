import React, { createContext, useContext, useState, useEffect } from 'react';
import { logEvent } from '../utils/loggingAdapter';
import authService from '../services/authService';
import tokenManager from '../utils/tokenManager';

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
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check for existing session on app load
  useEffect(() => {
    const checkExistingSession = async () => {
      try {
        // Initialize token manager
        tokenManager.initialize();
        
        // Check if user has a valid token
        const isValidToken = await authService.validateToken();
        
        if (isValidToken) {
          const currentUser = authService.getCurrentUser();
          if (currentUser) {
            setUser(currentUser);
            setIsAuthenticated(true);
            logEvent('SESSION_RESTORED', { email: currentUser.email });
            return;
          }
        }
        
        // If no valid token, ensure user is logged out
        setUser(null);
        setIsAuthenticated(false);
        logEvent('NO_VALID_SESSION');
      } catch (error) {
        console.error('Error checking existing session:', error);
        // Clear potentially corrupted data
        authService.logout();
        setUser(null);
        setIsAuthenticated(false);
      }
    };

    // Handle token expiry events from token manager
    const handleTokenExpiry = () => {
      setUser(null);
      setIsAuthenticated(false);
      logEvent('TOKEN_EXPIRED');
    };

    window.addEventListener('tokenExpired', handleTokenExpiry);
    checkExistingSession();

    return () => {
      window.removeEventListener('tokenExpired', handleTokenExpiry);
      tokenManager.cleanup();
    };
  }, []);

  const login = async (email, password, isLoginMode = true, additionalData = {}) => {
    setIsLoading(true);
    
    try {
      let result;
      
      const credentials = {
        email,
        password,
        ...additionalData
      };
      
      if (isLoginMode) {
        // Use API for login
        result = await authService.authenticateUser(credentials);
        
        if (result.success) {
          const userData = result.user;
          setUser(userData);
          setIsAuthenticated(true);
          
          // Setup token auto-refresh
          tokenManager.setupAutoRefresh();
          
          logEvent('LOGIN_SUCCESS', { email: userData.email, mode: 'login' });
          return { success: true, user: userData };
        } else {
          return { 
            success: false, 
            message: result.error || 'Login failed. Please check your credentials.' 
          };
        }
      } else {
        // For signup, attempt to register the user
        result = await authService.registerUser(credentials);
        
        if (result.success) {
          const userData = result.user;
          setUser(userData);
          setIsAuthenticated(true);
          
          // Setup token auto-refresh
          tokenManager.setupAutoRefresh();
          
          logEvent('SIGNUP_SUCCESS', { email: userData.email, mode: 'signup' });
          return { success: true, user: userData };
        } else {
          return { 
            success: false, 
            message: result.error || 'Signup failed. Please try again.' 
          };
        }
      }
      
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        message: 'Network error. Please check your connection and try again.' 
      };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    const userId = user?.email || user?.id;
    authService.logout();
    setUser(null);
    setIsAuthenticated(false);
    logEvent('USER_LOGOUT', { userId });
  };

  const updateUser = (updatedData) => {
    const newUserData = { ...user, ...updatedData };
    setUser(newUserData);
    
    // Update user data in token storage
    const tokenData = authService.getAuthToken();
    if (tokenData) {
      tokenData.user = newUserData;
      localStorage.setItem('auth_token', JSON.stringify(tokenData));
    }
    
    logEvent('USER_UPDATED', { userId: user?.email || user?.id, updatedFields: Object.keys(updatedData) });
  };

  const refreshToken = async () => {
    try {
      const isValid = await authService.validateToken();
      if (!isValid) {
        logout();
        return false;
      }
      return true;
    } catch (error) {
      console.error('Token refresh error:', error);
      logout();
      return false;
    }
  };

  const getAuthHeader = () => {
    return authService.getAuthHeader();
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    updateUser,
    refreshToken,
    getAuthHeader
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};