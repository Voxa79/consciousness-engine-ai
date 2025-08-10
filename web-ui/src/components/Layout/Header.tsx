import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Avatar,
  Box,
  Chip,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Logout as LogoutIcon,
  Psychology as PsychologyIcon,
} from '@mui/icons-material';
import { useAuthContext } from '../../contexts/AuthContext';
import { useConsciousness } from '../../contexts/ConsciousnessContext';
import { User } from '../../hooks/useAuth';

interface HeaderProps {
  onMenuClick: () => void;
  user: User | null;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick, user }) => {
  const { logout } = useAuthContext();
  const { currentState, isProcessing } = useConsciousness();

  return (
    <AppBar position="sticky" elevation={0}>
      <Toolbar>
        <IconButton
          edge="start"
          color="inherit"
          aria-label="menu"
          onClick={onMenuClick}
          sx={{ mr: 2 }}
        >
          <MenuIcon />
        </IconButton>

        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Consciousness Engine
        </Typography>

        {/* Consciousness Status */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mr: 3 }}>
          <Chip
            icon={<PsychologyIcon />}
            label={isProcessing ? 'Processing...' : 'Active'}
            color={isProcessing ? 'secondary' : 'primary'}
            variant="outlined"
            size="small"
          />
          
          {currentState && (
            <Chip
              label={`Awareness: ${Math.round(currentState.awarenessLevel * 100)}%`}
              color="primary"
              variant="filled"
              size="small"
            />
          )}
        </Box>

        {/* User Menu */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
            {user?.username?.charAt(0).toUpperCase() || 'U'}
          </Avatar>
          
          <Typography variant="body2" sx={{ mr: 1 }}>
            {user?.username || 'User'}
          </Typography>
          
          <IconButton
            color="inherit"
            onClick={logout}
            size="small"
            title="Logout"
          >
            <LogoutIcon />
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;