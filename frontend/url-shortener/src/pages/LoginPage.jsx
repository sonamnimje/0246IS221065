import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Paper, 
  InputAdornment, 
  IconButton,
  Alert,
  Fade,
  Slide,
  CircularProgress,
  Divider,
  LinearProgress,
  Tooltip,
  Zoom
} from '@mui/material';
import { 
  Visibility, 
  VisibilityOff, 
  Email, 
  Lock, 
  Login as LoginIcon,
  Google as GoogleIcon,
  GitHub as GitHubIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { validateAuthForm, getPasswordStrength } from '../utils/authHelpers';
import { useFormValidation } from '../hooks/useFormValidation';
import { logEvent } from '../utils/loggingAdapter';

function LoginPage() {
  const { login, isLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });
  const [focusedField, setFocusedField] = useState('');
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, feedback: '', color: '#9ca3af' });
  const [showPasswordStrength, setShowPasswordStrength] = useState(false);

  // Form validation rules
  const validationRules = (values) => {
    const { isValid, errors } = validateAuthForm(values, !isLoginMode);
    return errors;
  };

  // Initialize form with validation
  const {
    values: formData,
    errors,
    touched,
    isValidating,
    handleChange: handleFormChange,
    handleBlur,
    handleFocus,
    validateAll,
    reset
  } = useFormValidation(
    { 
      email: '', 
      password: '', 
      confirmPassword: '', 
      rollNo: '',
      accessCode: ''
    },
    validationRules,
    300
  );

  // Custom change handler to include password strength checking
  const handleInputChange = (field) => (event) => {
    const handler = handleFormChange(field);
    handler(event);
    
    // Check password strength for signup mode
    if (field === 'password' && !isLoginMode) {
      const strength = getPasswordStrength(event.target.value);
      setPasswordStrength(strength);
      setShowPasswordStrength(event.target.value.length > 0);
    }
  };

  // Reset form when switching modes
  useEffect(() => {
    reset();
    setPasswordStrength({ score: 0, feedback: '', color: '#9ca3af' });
    setShowPasswordStrength(false);
    setAlert({ show: false, type: '', message: '' });
  }, [isLoginMode, reset]);



  const handleSubmit = async (event) => {
    event.preventDefault();
    
    // Validate all fields
    if (!validateAll()) {
      setAlert({
        show: true,
        type: 'error',
        message: 'Please fix the errors above'
      });
      return;
    }

    try {
      logEvent('LOGIN_ATTEMPT', { email: formData.email, mode: isLoginMode ? 'login' : 'signup' });
      
      // Pass additional fields required by the API
      const result = await login(
        formData.email, 
        formData.password, 
        isLoginMode,
        {
          rollNo: formData.rollNo || 'aa1bb', // Default value if not provided
          accessCode: formData.accessCode || 'xgAsNC' // Default value if not provided
        }
      );
      
      if (result.success) {
        setAlert({
          show: true,
          type: 'success',
          message: isLoginMode ? 'Login successful!' : 'Account created successfully!'
        });
        
        logEvent('LOGIN_SUCCESS', { email: formData.email, mode: isLoginMode ? 'login' : 'signup' });
        
        // Redirect after success (could be handled by AuthContext)
        setTimeout(() => {
          window.location.href = '/';
        }, 1500);
      } else {
        setAlert({
          show: true,
          type: 'error',
          message: result.message || 'Authentication failed'
        });
        logEvent('LOGIN_FAILED', { email: formData.email, error: result.message });
      }
    } catch (error) {
      setAlert({
        show: true,
        type: 'error',
        message: 'An unexpected error occurred'
      });
      logEvent('LOGIN_ERROR', { email: formData.email, error: error.message });
    }
  };

  const handleSocialLogin = (provider) => {
    logEvent('SOCIAL_LOGIN_ATTEMPT', { provider });
    setAlert({
      show: true,
      type: 'info',
      message: `${provider} login will be implemented soon!`
    });
  };

  const toggleMode = () => {
    setIsLoginMode(!isLoginMode);
    setAlert({ show: false, type: '', message: '' });
    logEvent('AUTH_MODE_TOGGLE', { newMode: !isLoginMode ? 'login' : 'signup' });
  };

  return (
    <Box 
      className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center p-4"
      sx={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 2
      }}
    >
      {/* Animated background elements */}
      <Box className="absolute inset-0 overflow-hidden pointer-events-none">
        <Box 
          className="absolute -top-10 -left-10 w-40 h-40 bg-white/10 rounded-full animate-float"
          sx={{ animationDelay: '0s' }}
        />
        <Box 
          className="absolute top-1/3 -right-16 w-64 h-64 bg-white/5 rounded-full animate-float"
          sx={{ animationDelay: '2s' }}
        />
        <Box 
          className="absolute -bottom-16 left-1/3 w-48 h-48 bg-white/10 rounded-full animate-float"
          sx={{ animationDelay: '4s' }}
        />
      </Box>

      <Slide direction="up" in={true} mountOnEnter unmountOnExit>
        <Paper 
          elevation={20}
          className="glass-effect animate-fade-in"
          sx={{ 
            maxWidth: 450,
            width: '100%',
            p: 4,
            borderRadius: 3,
            backdropFilter: 'blur(16px)',
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
          }}
        >
          {/* Header */}
          <Box className="text-center mb-8">
            <Box 
              className="w-16 h-16 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full mx-auto mb-4 flex items-center justify-center animate-bounce-in"
              sx={{ animationDelay: '0.2s' }}
            >
              <LoginIcon sx={{ fontSize: 32, color: 'white' }} />
            </Box>
            <Typography 
              variant="h4" 
              className="font-bold text-gray-800 animate-slide-in"
              sx={{ animationDelay: '0.4s' }}
            >
              {isLoginMode ? 'Welcome Back' : 'Create Account'}
            </Typography>
            <Typography 
              variant="body1" 
              className="text-gray-600 mt-2 animate-slide-in"
              sx={{ animationDelay: '0.6s' }}
            >
              {isLoginMode ? 'Sign in to your account' : 'Join us to shorten your URLs'}
            </Typography>
          </Box>

          {/* Alert */}
          <Fade in={alert.show}>
            <Box className="mb-4">
              {alert.show && (
                <Alert 
                  severity={alert.type}
                  className="animate-slide-in"
                  onClose={() => setAlert({ show: false, type: '', message: '' })}
                >
                  {alert.message}
                </Alert>
              )}
            </Box>
          </Fade>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <Box className="animate-slide-in" sx={{ animationDelay: '0.8s' }}>
              <TextField
                fullWidth
                label="Email Address"
                type="email"
                value={formData.email}
                onChange={handleInputChange('email')}
                onFocus={(e) => {
                  setFocusedField('email');
                  handleFocus('email')(e);
                }}
                onBlur={(e) => {
                  setFocusedField('');
                  handleBlur('email')(e);
                }}
                error={!!errors.email && touched.email}
                helperText={errors.email && touched.email ? errors.email : ''}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email 
                        color={focusedField === 'email' ? 'primary' : 'action'} 
                        className="transition-colors duration-300"
                      />
                    </InputAdornment>
                  ),
                  endAdornment: formData.email && !errors.email && touched.email && (
                    <InputAdornment position="end">
                      <Zoom in={true}>
                        <CheckIcon sx={{ color: 'success.main' }} />
                      </Zoom>
                    </InputAdornment>
                  ),
                }}
                className="transition-all duration-300"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    },
                    '&.Mui-focused': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 25px rgba(59, 130, 246, 0.15)',
                    }
                  }
                }}
              />
              {isValidating && (
                <LinearProgress 
                  sx={{ 
                    mt: 0.5, 
                    height: 2, 
                    borderRadius: 1,
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: 'primary.main'
                    }
                  }} 
                />
              )}
            </Box>

            {/* Password Field */}
            <Box className="animate-slide-in" sx={{ animationDelay: '1s' }}>
              <TextField
                fullWidth
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleInputChange('password')}
                onFocus={handleFocus('password')}
                onBlur={handleBlur('password')}
                error={!!errors.password && touched.password}
                helperText={errors.password && touched.password ? errors.password : ''}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock 
                        color={focusedField === 'password' ? 'primary' : 'action'} 
                        className="transition-colors duration-300"
                      />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <Tooltip title={showPassword ? 'Hide password' : 'Show password'}>
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          className="transition-transform duration-200 hover:scale-110"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </Tooltip>
                    </InputAdornment>
                  ),
                }}
                className="transition-all duration-300"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    },
                    '&.Mui-focused': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 25px rgba(59, 130, 246, 0.15)',
                    }
                  }
                }}
              />
              
              {/* Password Strength Indicator for Signup Mode */}
              {!isLoginMode && showPasswordStrength && (
                <Fade in={showPasswordStrength}>
                  <Box sx={{ mt: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <Typography variant="caption" sx={{ color: passwordStrength.color, fontWeight: 'bold' }}>
                        {passwordStrength.strengthText}
                      </Typography>
                      {passwordStrength.score >= 5 && (
                        <Zoom in={true}>
                          <CheckIcon sx={{ color: 'success.main', fontSize: 16 }} />
                        </Zoom>
                      )}
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={(passwordStrength.score / 7) * 100}
                      sx={{
                        height: 4,
                        borderRadius: 2,
                        backgroundColor: 'rgba(0,0,0,0.1)',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: passwordStrength.color,
                          borderRadius: 2,
                          transition: 'all 0.3s ease'
                        }
                      }}
                    />
                    <Typography 
                      variant="caption" 
                      sx={{ color: 'text.secondary', fontSize: '0.7rem', mt: 0.5, display: 'block' }}
                    >
                      {passwordStrength.feedback}
                    </Typography>
                  </Box>
                </Fade>
              )}
            </Box>

            {/* Confirm Password Field (for Signup Mode) */}
            {!isLoginMode && (
              <Slide direction="left" in={!isLoginMode} mountOnEnter unmountOnExit>
                <Box className="animate-slide-in" sx={{ animationDelay: '1.2s' }}>
                  <TextField
                    fullWidth
                    label="Confirm Password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={handleInputChange('confirmPassword')}
                    onFocus={handleFocus('confirmPassword')}
                    onBlur={handleBlur('confirmPassword')}
                    error={!!errors.confirmPassword && touched.confirmPassword}
                    helperText={errors.confirmPassword && touched.confirmPassword ? errors.confirmPassword : ''}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock 
                            color={focusedField === 'confirmPassword' ? 'primary' : 'action'} 
                            className="transition-colors duration-300"
                          />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          {formData.confirmPassword && formData.password === formData.confirmPassword && (
                            <Zoom in={true}>
                              <CheckIcon sx={{ color: 'success.main' }} />
                            </Zoom>
                          )}
                        </InputAdornment>
                      ),
                    }}
                    className="transition-all duration-300"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        },
                        '&.Mui-focused': {
                          transform: 'translateY(-2px)',
                          boxShadow: '0 8px 25px rgba(59, 130, 246, 0.15)',
                        }
                      }
                    }}
                  />
                </Box>
              </Slide>
            )}

            {/* Additional API Fields - Optional */}
            <Box className="animate-slide-in" sx={{ animationDelay: '1.4s' }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Additional Information (Optional)
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                <TextField
                  fullWidth
                  label="Roll Number"
                  value={formData.rollNo}
                  onChange={handleInputChange('rollNo')}
                  onFocus={handleFocus('rollNo')}
                  onBlur={handleBlur('rollNo')}
                  placeholder="aa1bb"
                  size="small"
                  className="transition-all duration-300"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-1px)',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                      },
                      '&.Mui-focused': {
                        transform: 'translateY(-1px)',
                        boxShadow: '0 4px 12px rgba(59, 130, 246, 0.15)',
                      }
                    }
                  }}
                />
                
                <TextField
                  fullWidth
                  label="Access Code"
                  value={formData.accessCode}
                  onChange={handleInputChange('accessCode')}
                  onFocus={handleFocus('accessCode')}
                  onBlur={handleBlur('accessCode')}
                  placeholder="xgAsNC"
                  size="small"
                  className="transition-all duration-300"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-1px)',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                      },
                      '&.Mui-focused': {
                        transform: 'translateY(-1px)',
                        boxShadow: '0 4px 12px rgba(59, 130, 246, 0.15)',
                      }
                    }
                  }}
                />
              </Box>
            </Box>

            {/* Submit Button */}
            <Box className="animate-slide-in" sx={{ animationDelay: '1.2s' }}>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={isLoading}
                className="transition-all duration-300 hover:scale-105 hover:shadow-xl"
                sx={{
                  borderRadius: 2,
                  py: 1.5,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
                  },
                  '&.Mui-disabled': {
                    background: 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)',
                  }
                }}
                startIcon={
                  isLoading ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    <LoginIcon />
                  )
                }
              >
                {isLoading 
                  ? 'Please wait...' 
                  : isLoginMode 
                    ? 'Sign In' 
                    : 'Create Account'
                }
              </Button>
            </Box>
          </form>

          {/* Divider */}
          <Box className="animate-slide-in" sx={{ animationDelay: '1.4s' }}>
            <Divider sx={{ my: 3 }}>
              <Typography variant="body2" color="text.secondary">
                or continue with
              </Typography>
            </Divider>
          </Box>

          {/* Social Login Buttons */}
          <Box className="space-y-3 animate-slide-in" sx={{ animationDelay: '1.6s' }}>
            <Button
              fullWidth
              variant="outlined"
              size="large"
              onClick={() => handleSocialLogin('Google')}
              className="transition-all duration-300 hover:scale-105"
              sx={{
                borderRadius: 2,
                py: 1.5,
                borderColor: '#ea4335',
                color: '#ea4335',
                '&:hover': {
                  borderColor: '#ea4335',
                  backgroundColor: 'rgba(234, 67, 53, 0.1)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 12px rgba(234, 67, 53, 0.2)',
                }
              }}
              startIcon={<GoogleIcon />}
            >
              Continue with Google
            </Button>

            <Button
              fullWidth
              variant="outlined"
              size="large"
              onClick={() => handleSocialLogin('GitHub')}
              className="transition-all duration-300 hover:scale-105"
              sx={{
                borderRadius: 2,
                py: 1.5,
                borderColor: '#333',
                color: '#333',
                '&:hover': {
                  borderColor: '#333',
                  backgroundColor: 'rgba(51, 51, 51, 0.1)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 12px rgba(51, 51, 51, 0.2)',
                }
              }}
              startIcon={<GitHubIcon />}
            >
              Continue with GitHub
            </Button>
          </Box>

          {/* Toggle Mode */}
          <Box className="text-center mt-6 animate-slide-in" sx={{ animationDelay: '1.8s' }}>
            <Typography variant="body2" color="text.secondary">
              {isLoginMode ? "Don't have an account?" : "Already have an account?"}
              <Button
                variant="text"
                onClick={toggleMode}
                className="ml-1 transition-all duration-300 hover:scale-105"
                sx={{ 
                  textTransform: 'none',
                  fontWeight: 600,
                  '&:hover': {
                    backgroundColor: 'transparent',
                  }
                }}
              >
                {isLoginMode ? 'Sign Up' : 'Sign In'}
              </Button>
            </Typography>
          </Box>
        </Paper>
      </Slide>
    </Box>
  );
}

export default LoginPage;