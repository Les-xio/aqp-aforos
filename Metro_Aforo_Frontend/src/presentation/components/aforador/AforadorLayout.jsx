import { Box, AppBar, Toolbar, Typography, Button, Chip } from '@mui/material';
import { Logout as LogoutIcon, Route as RouteIcon, CloudOff as OfflineIcon, CloudDone as OnlineIcon, Sync as SyncIcon } from '@mui/icons-material';
import { useAuth } from '../../../application/hooks/useAuth';
import { useSync } from '../../../infrastructure/storage/SyncContext';

export function AforadorLayout({ children, hideUserBar }) {
  const { logout } = useAuth();
  const { online, pendingCount, syncing } = useSync();

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: hideUserBar ? 'transparent' : 'background.default' }}>
      {!hideUserBar && (
        <AppBar position="static" elevation={1} sx={{ bgcolor: 'primary.dark' }}>
          <Toolbar sx={{ minHeight: 56, gap: 1 }}>
            <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
              <RouteIcon sx={{ fontSize: 26, opacity: 0.9 }} />
              <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: '1px', fontSize: 18 }}>
                Metro AQP Aforos
              </Typography>
            </Box>

            {pendingCount > 0 && (
              <Chip
                icon={syncing ? <SyncIcon sx={{ fontSize: 14, animation: 'spin 1s linear infinite' }} /> : <OfflineIcon sx={{ fontSize: 14 }} />}
                label={syncing ? 'Sincronizando...' : `${pendingCount} pendiente${pendingCount !== 1 ? 's' : ''}`}
                size="small"
                sx={{
                  height: 24, fontSize: 11, fontWeight: 600, color: '#FBBF24',
                  bgcolor: 'rgba(251,191,36,0.15)', borderRadius: '12px',
                  '& .MuiChip-icon': { color: '#FBBF24' },
                  '@keyframes spin': { '100%': { transform: 'rotate(360deg)' } },
                }}
              />
            )}

            {pendingCount === 0 && !online && (
              <Chip
                icon={<OfflineIcon sx={{ fontSize: 14 }} />}
                label="Sin conexión"
                size="small"
                sx={{ height: 24, fontSize: 11, fontWeight: 600, color: '#FCA5A5', bgcolor: 'rgba(252,165,165,0.15)', borderRadius: '12px', '& .MuiChip-icon': { color: '#FCA5A5' } }}
              />
            )}

            {pendingCount === 0 && online && (
              <Chip
                icon={<OnlineIcon sx={{ fontSize: 14 }} />}
                label="En línea"
                size="small"
                sx={{ height: 24, fontSize: 11, fontWeight: 600, color: '#86EFAC', bgcolor: 'rgba(134,239,172,0.15)', borderRadius: '12px', '& .MuiChip-icon': { color: '#86EFAC' } }}
              />
            )}

            <Button
              color="inherit"
              onClick={logout}
              size="small"
              startIcon={<LogoutIcon />}
              sx={{
                fontSize: 13, fontWeight: 600, borderRadius: '8px',
                textTransform: 'none', px: 1.5, py: 0.6,
                '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
              }}
            >
              Cerrar sesión
            </Button>
          </Toolbar>
        </AppBar>
      )}
      <Box sx={{ px: hideUserBar ? 0 : 1.5, pt: hideUserBar ? 0 : 1.5 }}>
        {children}
      </Box>
    </Box>
  );
}
