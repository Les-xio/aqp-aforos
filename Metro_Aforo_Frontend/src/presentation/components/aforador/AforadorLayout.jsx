import { Box, AppBar, Toolbar, Typography, IconButton, Chip } from '@mui/material';
import { Logout as LogoutIcon, Wifi as WifiIcon, WifiOff as WifiOffIcon } from '@mui/icons-material';
import { useAuth } from '../../../application/hooks/useAuth';
import { useState, useEffect } from 'react';

export function AforadorLayout({ children, hideUserBar }) {
  const { usuario, logout } = useAuth();
  const [online, setOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pb: 2 }}>
      {!hideUserBar && (
        <AppBar position="static" elevation={1} sx={{ bgcolor: 'primary.dark' }}>
          <Toolbar sx={{ minHeight: 56 }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle2" fontWeight={700}>
                {usuario?.nombres} {usuario?.apellidos}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.8, textTransform: 'capitalize' }}>
                {usuario?.rol}
              </Typography>
            </Box>
            <Chip
              icon={online ? <WifiIcon /> : <WifiOffIcon />}
              label={online ? 'En línea' : 'Sin conexión'}
              size="small"
              color={online ? 'success' : 'error'}
              variant="outlined"
              sx={{ color: 'white', borderColor: 'white', mr: 1 }}
            />
            <IconButton color="inherit" onClick={logout} size="small">
              <LogoutIcon />
            </IconButton>
          </Toolbar>
        </AppBar>
      )}
      <Box sx={{ px: 1.5, pt: 1.5 }}>
        {children}
      </Box>
    </Box>
  );
}
