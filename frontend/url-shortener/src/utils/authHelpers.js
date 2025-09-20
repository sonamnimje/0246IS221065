// authHelpers.js - Authentication utility functions

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} - True if valid email format
 */
export function validateEmail(email) {
  if (!email || typeof email !== 'string') {
    return false;
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {boolean} - True if password meets minimum requirements
 */
export function validatePassword(password) {
  if (!password || typeof password !== 'string') {
    return false;
  }
  
  // Minimum 6 characters
  return password.length >= 6;
}

/**
 * Get password strength score and feedback
 * @param {string} password - Password to analyze
 * @returns {object} - {score: number, feedback: string, color: string}
 */
export function getPasswordStrength(password) {
  if (!password) {
    return { score: 0, feedback: 'Enter a password', color: '#9ca3af' };
  }
  
  let score = 0;
  const feedback = [];
  
  // Length check
  if (password.length >= 8) {
    score += 2;
  } else if (password.length >= 6) {
    score += 1;
    feedback.push('Use 8+ characters for better security');
  } else {
    feedback.push('Password too short (minimum 6 characters)');
  }
  
  // Character variety checks
  if (/[a-z]/.test(password)) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  
  // Bonus for length
  if (password.length >= 12) score += 1;
  
  // Determine strength level
  let strengthText = '';
  let color = '';
  
  if (score <= 2) {
    strengthText = 'Weak';
    color = '#ef4444';
    if (password.length >= 6) {
      feedback.push('Add uppercase, numbers, or symbols');
    }
  } else if (score <= 4) {
    strengthText = 'Fair';
    color = '#f59e0b';
    feedback.push('Good! Add more character variety');
  } else if (score <= 6) {
    strengthText = 'Good';
    color = '#10b981';
    if (password.length < 12) {
      feedback.push('Excellent! Consider making it longer');
    }
  } else {
    strengthText = 'Excellent';
    color = '#059669';
    feedback.push('Very secure password!');
  }
  
  return {
    score: Math.min(score, 7),
    feedback: feedback[0] || strengthText,
    color,
    strengthText
  };
}

/**
 * Validate form data for login/signup
 * @param {object} formData - Form data to validate
 * @param {boolean} isSignup - Whether this is for signup (stricter validation)
 * @returns {object} - {isValid: boolean, errors: object}
 */
export function validateAuthForm(formData, isSignup = false) {
  const errors = {};
  
  // Email validation
  if (!formData.email) {
    errors.email = 'Email is required';
  } else if (!validateEmail(formData.email)) {
    errors.email = 'Please enter a valid email address';
  }
  
  // Password validation
  if (!formData.password) {
    errors.password = 'Password is required';
  } else if (!validatePassword(formData.password)) {
    errors.password = 'Password must be at least 6 characters long';
  } else if (isSignup) {
    const strength = getPasswordStrength(formData.password);
    if (strength.score < 3) {
      errors.password = 'Please choose a stronger password';
    }
  }
  
  // Confirm password validation (for signup)
  if (isSignup && formData.confirmPassword !== undefined) {
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
  }
  
  // Name validation (for signup)
  if (isSignup && formData.name !== undefined) {
    if (!formData.name || formData.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters long';
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Sanitize user input to prevent XSS
 * @param {string} input - Input to sanitize
 * @returns {string} - Sanitized input
 */
export function sanitizeInput(input) {
  if (typeof input !== 'string') return '';
  
  return input
    .trim()
    .replace(/[<>\"']/g, '') // Remove potentially dangerous characters
    .substring(0, 255); // Limit length
}

/**
 * Generate secure random password
 * @param {number} length - Password length (default: 12)
 * @returns {string} - Generated password
 */
export function generateSecurePassword(length = 12) {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
  
  const allChars = uppercase + lowercase + numbers + symbols;
  let password = '';
  
  // Ensure at least one character from each type
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += symbols[Math.floor(Math.random() * symbols.length)];
  
  // Fill the rest randomly
  for (let i = 4; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }
  
  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

/**
 * Format relative time (e.g., "2 minutes ago")
 * @param {number} timestamp - Timestamp to format
 * @returns {string} - Formatted time string
 */
export function formatTimeAgo(timestamp) {
  const now = Date.now();
  const diff = now - timestamp;
  
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;
  const week = 7 * day;
  const month = 30 * day;
  
  if (diff < minute) {
    return 'Just now';
  } else if (diff < hour) {
    const minutes = Math.floor(diff / minute);
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else if (diff < day) {
    const hours = Math.floor(diff / hour);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else if (diff < week) {
    const days = Math.floor(diff / day);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  } else if (diff < month) {
    const weeks = Math.floor(diff / week);
    return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
  } else {
    const months = Math.floor(diff / month);
    return `${months} month${months > 1 ? 's' : ''} ago`;
  }
}

/**
 * Check if user session is still valid
 * @returns {boolean} - True if session is valid
 */
export function isSessionValid() {
  try {
    const sessionExpiry = localStorage.getItem('url_shortener_session_expiry');
    if (!sessionExpiry) return false;
    
    const expiry = parseInt(sessionExpiry, 10);
    return Date.now() < expiry;
  } catch (error) {
    return false;
  }
}

/**
 * Get user's initials for avatar display
 * @param {string} name - User's name
 * @param {string} email - User's email (fallback)
 * @returns {string} - User initials
 */
export function getUserInitials(name, email) {
  if (name && name.trim()) {
    const nameParts = name.trim().split(' ');
    if (nameParts.length >= 2) {
      return (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase();
    } else {
      return nameParts[0].substring(0, 2).toUpperCase();
    }
  } else if (email) {
    return email.substring(0, 2).toUpperCase();
  }
  return 'U';
}

/**
 * Debounce function for form validation
 * @param {function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {function} - Debounced function
 */
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}