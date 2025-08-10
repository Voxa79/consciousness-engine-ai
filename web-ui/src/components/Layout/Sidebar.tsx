import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Box,
  Divider,
} from '@mui/material';
import {
  Psychology as PsychologyIcon,
  Hub as HubIcon,
  Security as SecurityIcon,
  Analytics as AnalyticsIcon,
  Monitor as MonitoringIcon,
  AccountTree as AccountTreeIcon,
  SmartToy as SmartToyIcon,
  Visibility as VisibilityIcon,
  Mic as MicIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

interface SidebarProps {
  open: boolean;
  onToggle: () => void;
}

const menuItems = [
  { path: '/consciousness', label: 'Consciousness Chat', icon: PsychologyIcon },
  { path: '/consciousness/visualization', label: 'Visualization', icon: VisibilityIcon },
  { path: '/voice', label: 'Voice Playground', icon: MicIcon },
  { path: '/orchestration', label: 'Orchestration', icon: HubIcon },
  { path: '/agents', label: 'Agent Management', icon: SmartToyIcon },
  { path: '/governance', label: 'Governance', icon: AccountTreeIcon },
  { path: '/ethics', label: 'Ethics', icon: SecurityIcon },
  { path: '/monitoring', label: 'Monitoring', icon: MonitoringIcon },
  { path: '/monitoring/events', label: 'Event Console', icon: MonitoringIcon },
  { path: '/analytics', label: 'Analytics', icon: AnalyticsIcon },
];

const Sidebar: React.FC<SidebarProps> = ({ open, onToggle }) => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Drawer
      variant="persistent"
      anchor="left"
      open={open}
      sx={{
        width: 280,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: 280,
          boxSizing: 'border-box',
          background: 'rgba(10, 10, 10, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRight: '1px solid rgba(0, 229, 255, 0.2)',
        },
      }}
    >
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 'bold' }}>
          🧠 Consciousness Engine
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Revolutionary AI Platform
        </Typography>
      </Box>

      <Divider sx={{ borderColor: 'rgba(0, 229, 255, 0.2)' }} />

      <List sx={{ px: 2 }}>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <ListItem key={item.path} disablePadding sx={{ mb: 1 }}>
              <ListItemButton
                onClick={() => navigate(item.path)}
                sx={{
                  borderRadius: 2,
                  backgroundColor: isActive ? 'rgba(0, 229, 255, 0.1)' : 'transparent',
                  '&:hover': {
                    backgroundColor: 'rgba(0, 229, 255, 0.05)',
                  },
                }}
              >
                <ListItemIcon sx={{ color: isActive ? 'primary.main' : 'text.secondary' }}>
                  <Icon />
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  sx={{
                    color: isActive ? 'primary.main' : 'text.primary',
                    '& .MuiListItemText-primary': {
                      fontWeight: isActive ? 600 : 400,
                    }
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Drawer>
  );
};

export default Sidebar;