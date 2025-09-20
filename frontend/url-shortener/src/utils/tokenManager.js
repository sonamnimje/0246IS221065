/**
 * Token Manager Utility
 * Handles JWT token operations, validation, and automatic refresh
 */

import authService from '../services/authService';

class TokenManager {
  constructor() {
    this.refreshTimer = null;
    this.isRefreshing = false;
  }

  /**
   * Initialize token manager and set up automatic refresh
   */
  initialize() {
    this.setupAutoRefresh();
    
    // Listen for token changes across tabs
    window.addEventListener('storage', this.handleStorageChange.bind(this));
  }

  /**
   * Handle storage changes from other tabs
   */
  handleStorageChange(event) {
    if (event.key === 'auth_token') {
      if (!event.newValue) {
        // Token was removed in another tab
        this.clearRefreshTimer();
        window.location.reload();
      } else {
        // Token was updated in another tab
        this.setupAutoRefresh();
      }
    }
  }

  /**
   * Setup automatic token refresh
   */
  setupAutoRefresh() {
    this.clearRefreshTimer();
    
    const tokenData = authService.getAuthToken();
    if (!tokenData || !tokenData.expiresAt) {
      return;
    }

    const now = Date.now();
    const expiresAt = tokenData.expiresAt;
    
    // Refresh 5 minutes before expiry
    const refreshTime = expiresAt - (5 * 60 * 1000);
    const timeUntilRefresh = refreshTime - now;

    if (timeUntilRefresh > 0) {
      this.refreshTimer = setTimeout(() => {
        this.attemptRefresh();
      }, timeUntilRefresh);
      
      console.log(`Token refresh scheduled in ${Math.round(timeUntilRefresh / 1000 / 60)} minutes`);
    } else {
      // Token is already expired or close to expiry
      this.attemptRefresh();
    }
  }

  /**
   * Attempt to refresh the token
   */
  async attemptRefresh() {
    if (this.isRefreshing) {
      return;
    }

    this.isRefreshing = true;

    try {
      const isValid = await authService.validateToken();
      
      if (!isValid) {
        // Token is invalid, user needs to log in again
        this.handleTokenExpiry();
        return;
      }

      // Token is still valid, set up next refresh
      this.setupAutoRefresh();
    } catch (error) {
      console.error('Token refresh failed:', error);
      this.handleTokenExpiry();
    } finally {
      this.isRefreshing = false;
    }
  }

  /**
   * Handle token expiry by logging out user
   */
  handleTokenExpiry() {
    console.log('Token expired, logging out user');
    
    // Clear token and refresh timer
    authService.logout();
    this.clearRefreshTimer();
    
    // Dispatch custom event for components to listen to
    window.dispatchEvent(new CustomEvent('tokenExpired'));
    
    // Redirect to login page if not already there
    if (!window.location.pathname.includes('/login')) {
      window.location.href = '/login';
    }
  }

  /**
   * Clear the refresh timer
   */
  clearRefreshTimer() {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }
  }

  /**
   * Get time until token expires
   */
  getTimeUntilExpiry() {
    const tokenData = authService.getAuthToken();
    if (!tokenData || !tokenData.expiresAt) {
      return 0;
    }

    const now = Date.now();
    const timeLeft = tokenData.expiresAt - now;
    return Math.max(0, timeLeft);
  }

  /**
   * Check if token will expire soon
   */
  isTokenExpiringSoon(minutes = 10) {
    const timeLeft = this.getTimeUntilExpiry();
    const threshold = minutes * 60 * 1000; // Convert to milliseconds
    return timeLeft > 0 && timeLeft <= threshold;
  }

  /**
   * Cleanup when component unmounts or app closes
   */
  cleanup() {
    this.clearRefreshTimer();
    window.removeEventListener('storage', this.handleStorageChange.bind(this));
  }

  /**
   * Force immediate token validation
   */
  async validateTokenNow() {
    return await authService.validateToken();
  }

  /**
   * Get token expiry information for display
   */
  getTokenInfo() {
    const tokenData = authService.getAuthToken();
    if (!tokenData) {
      return null;
    }

    const timeLeft = this.getTimeUntilExpiry();
    const hours = Math.floor(timeLeft / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));

    return {
      isValid: timeLeft > 0,
      expiresAt: new Date(tokenData.expiresAt),
      timeLeft,
      timeLeftFormatted: `${hours}h ${minutes}m`,
      isExpiringSoon: this.isTokenExpiringSoon()
    };
  }
}

// Create singleton instance
const tokenManager = new TokenManager();

export default tokenManager;