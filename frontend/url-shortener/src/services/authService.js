/**
 * Authentication Service
 * Handles API calls for user authentication using the evaluation service
 */

const API_BASE_URL = 'http://20.244.56.144/evaluation-service';

// Default client credentials for the API
const DEFAULT_CLIENT_CONFIG = {
  clientID: 'd9cbb699-6a27-44a5-8d59-8b1befa816da',
  clientSecret: 'tVJaaaRBSeXcRXeM'
};

/**
 * Makes an HTTP request to the API
 * @param {string} endpoint - API endpoint
 * @param {Object} options - Request options
 * @returns {Promise<Object>} API response
 */
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error(`API request failed for ${endpoint}:`, error);
    return { 
      success: false, 
      error: error.message || 'Network error occurred' 
    };
  }
}

/**
 * Authenticates user and returns access token
 * @param {Object} credentials - User credentials
 * @param {string} credentials.email - User email
 * @param {string} credentials.password - User password (used as name for API)
 * @param {string} credentials.rollNo - User roll number (optional)
 * @param {string} credentials.accessCode - Access code (optional)
 * @returns {Promise<Object>} Authentication result
 */
export async function authenticateUser(credentials) {
  const { email, password, rollNo = 'aa1bb', accessCode = 'xgAsNC' } = credentials;
  
  // Extract name from email or use password as fallback (as shown in API example)
  const name = email.split('@')[0] || password;
  
  const requestBody = {
    email,
    name,
    rollNo,
    accessCode,
    ...DEFAULT_CLIENT_CONFIG
  };

  const result = await apiRequest('/auth', {
    method: 'POST',
    body: JSON.stringify(requestBody),
  });

  if (result.success) {
    const { data } = result;
    
    // Store token and user data
    if (data.access_token) {
      const tokenData = {
        accessToken: data.access_token,
        tokenType: data.token_type || 'Bearer',
        expiresIn: data.expires_in,
        expiresAt: Date.now() + (data.expires_in * 1000), // Convert to timestamp
        user: {
          email,
          name,
          rollNo,
        }
      };

      // Store in localStorage
      localStorage.setItem('auth_token', JSON.stringify(tokenData));
      
      return {
        success: true,
        token: data.access_token,
        tokenType: data.token_type,
        expiresIn: data.expires_in,
        user: tokenData.user
      };
    } else {
      return {
        success: false,
        error: 'No access token received from server'
      };
    }
  }

  return result;
}

/**
 * Validates and refreshes token if needed
 * @returns {Promise<boolean>} True if token is valid
 */
export async function validateToken() {
  try {
    const tokenData = JSON.parse(localStorage.getItem('auth_token') || '{}');
    
    if (!tokenData.accessToken || !tokenData.expiresAt) {
      return false;
    }

    // Check if token is expired (with 5 minute buffer)
    const now = Date.now();
    const buffer = 5 * 60 * 1000; // 5 minutes
    
    if (now >= (tokenData.expiresAt - buffer)) {
      // Token is expired or close to expiring
      localStorage.removeItem('auth_token');
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error validating token:', error);
    localStorage.removeItem('auth_token');
    return false;
  }
}

/**
 * Gets the current authentication token
 * @returns {Object|null} Token data or null if not authenticated
 */
export function getAuthToken() {
  try {
    const tokenData = JSON.parse(localStorage.getItem('auth_token') || '{}');
    
    if (!tokenData.accessToken) {
      return null;
    }

    return tokenData;
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
}

/**
 * Gets authorization header for API requests
 * @returns {Object} Authorization header
 */
export function getAuthHeader() {
  const tokenData = getAuthToken();
  
  if (!tokenData) {
    return {};
  }

  return {
    Authorization: `${tokenData.tokenType} ${tokenData.accessToken}`
  };
}

/**
 * Logs out user by clearing stored token
 */
export function logout() {
  localStorage.removeItem('auth_token');
}

/**
 * Checks if user is currently authenticated
 * @returns {boolean} True if authenticated
 */
export function isAuthenticated() {
  const tokenData = getAuthToken();
  
  if (!tokenData) {
    return false;
  }

  // Check if token is still valid
  const now = Date.now();
  return now < tokenData.expiresAt;
}

/**
 * Gets current user data from stored token
 * @returns {Object|null} User data or null
 */
export function getCurrentUser() {
  const tokenData = getAuthToken();
  
  if (!tokenData || !isAuthenticated()) {
    return null;
  }

  return tokenData.user;
}

/**
 * Creates a user account using the same auth endpoint
 * Since the API documentation only shows one auth endpoint, we'll use it for both login and signup
 * @param {Object} userData - User data for registration
 * @returns {Promise<Object>} Registration result
 */
export async function registerUser(userData) {
  // Since there's only one auth endpoint, we'll attempt to authenticate
  // This assumes the backend handles new user creation automatically
  console.info('Using auth endpoint for user registration/login');
  
  const result = await authenticateUser(userData);
  
  if (result.success) {
    return {
      ...result,
      isNewUser: true // Flag to indicate this was a signup attempt
    };
  }
  
  return result;
}

export default {
  authenticateUser,
  validateToken,
  getAuthToken,
  getAuthHeader,
  logout,
  isAuthenticated,
  getCurrentUser,
  registerUser
};