import React, { useState } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Box, 
  Avatar, 
  Menu, 
  MenuItem, 
  IconButton,
  Chip,
  Divider
} from '@mui/material';
import { 
  Login as LoginIcon,
  Logout as LogoutIcon,
  Person as PersonIcon,
  Dashboard as DashboardIcon,
  Link as LinkIcon,
  Analytics as AnalyticsIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getUserInitials, formatTimeAgo } from '../utils/authHelpers';

function Navigation() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleMenuClose();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <AppBar 
      position="static" 
      elevation={0}
      sx={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderBottom: '1px solid rgba(255,255,255,0.1)'
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        {/* Logo/Brand */}
        <Box 
          sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
          onClick={() => navigate('/')}
        >
          <LinkIcon sx={{ mr: 1, fontSize: 28 }} />
          <Typography 
            variant="h6" 
            component="div" 
            sx={{ 
              fontWeight: 'bold',
              background: 'linear-gradient(45deg, #fff, #f0f0f0)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            URL Shortener
          </Typography>
        </Box>

        {/* Navigation Links & User Menu */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {isAuthenticated ? (
            <>
              {/* Navigation Buttons */}
              <Button
                color="inherit"
                startIcon={<DashboardIcon />}
                onClick={() => navigate('/')}
                variant={isActive('/') ? 'outlined' : 'text'}
                sx={{ 
                  borderColor: isActive('/') ? 'rgba(255,255,255,0.5)' : 'transparent',
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.1)',
                  }
                }}
              >
                Dashboard
              </Button>
              
              <Button
                color="inherit"
                startIcon={<AnalyticsIcon />}
                onClick={() => navigate('/stats')}
                variant={isActive('/stats') ? 'outlined' : 'text'}
                sx={{ 
                  borderColor: isActive('/stats') ? 'rgba(255,255,255,0.5)' : 'transparent',
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.1)',
                  }
                }}
              >
                Analytics
              </Button>

              <Divider orientation="vertical" flexItem sx={{ backgroundColor: 'rgba(255,255,255,0.2)' }} />

              {/* User Menu */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ textAlign: 'right', display: { xs: 'none', sm: 'block' } }}>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                    {user?.name || user?.email?.split('@')[0]}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                    {user?.lastLogin ? `Active ${formatTimeAgo(user.lastLogin)}` : 'Online'}
                  </Typography>
                </Box>
                
                <IconButton
                  onClick={handleMenuOpen}
                  sx={{ 
                    p: 0,
                    '&:hover': {
                      transform: 'scale(1.05)',
                    }
                  }}
                >
                  <Avatar 
                    sx={{ 
                      width: 40, 
                      height: 40,
                      background: 'linear-gradient(135deg, #ff6b6b, #ee5a24)',
                      fontWeight: 'bold',
                      border: '2px solid rgba(255,255,255,0.3)'
                    }}
                  >
                    {getUserInitials(user?.name, user?.email)}
                  </Avatar>
                </IconButton>
              </Box>

              {/* User Dropdown Menu */}
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                PaperProps={{
                  sx: {
                    mt: 1,
                    minWidth: 250,
                    borderRadius: 2,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                    '& .MuiMenuItem-root': {
                      borderRadius: 1,
                      mx: 1,
                      my: 0.5,
                    }
                  }
                }}
              >
                <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid #f0f0f0' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                    {user?.name || 'User'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {user?.email}
                  </Typography>
                  <Chip
                    label="Pro User"
                    size="small"
                    color="primary"
                    variant="outlined"
                    sx={{ mt: 1, fontSize: '0.7rem' }}
                  />
                </Box>
                
                <MenuItem onClick={() => { handleMenuClose(); navigate('/profile'); }}>
                  <PersonIcon sx={{ mr: 2 }} />
                  Profile Settings
                </MenuItem>
                
                <MenuItem onClick={() => { handleMenuClose(); navigate('/stats'); }}>
                  <AnalyticsIcon sx={{ mr: 2 }} />
                  My Analytics
                </MenuItem>
                
                <Divider sx={{ my: 1 }} />
                
                <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                  <LogoutIcon sx={{ mr: 2 }} />
                  Sign Out
                </MenuItem>
              </Menu>
            </>
          ) : (
            /* Login Button for Non-authenticated Users */
            <Button
              color="inherit"
              variant="outlined"
              startIcon={<LoginIcon />}
              onClick={() => navigate('/login')}
              sx={{
                borderColor: 'rgba(255,255,255,0.5)',
                '&:hover': {
                  borderColor: 'rgba(255,255,255,0.8)',
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                }
              }}
            >
              Sign In
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Navigation;