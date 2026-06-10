import { useRegisterSW } from 'virtual:pwa-register/react';
import { useState } from 'react';
import { Snackbar, Button, Typography, Box, IconButton } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import CloseIcon from '@mui/icons-material/Close';

export function SwUpdateBanner() {
  const [dismissed, setDismissed] = useState(false);
  const { needRefresh, updateServiceWorker } = useRegisterSW({
    onRegistered(sw) {
      const interval = setInterval(() => {
        sw?.update();
      }, 60 * 60 * 1000);
      return () => clearInterval(interval);
    },
  });

  if (!needRefresh || dismissed) return null;

  return (
    <Snackbar
      open
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      sx={{ mb: 1 }}
    >
      <Box
        sx={{
          display: 'flex', alignItems: 'center', gap: 1,
          bgcolor: '#1E293B', color: '#fff', px: 2, py: 1.25,
          borderRadius: '12px', boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
          maxWidth: 400,
        }}
      >
        <RefreshIcon sx={{ fontSize: 18, color: '#60A5FA' }} />
        <Typography sx={{ fontSize: 13, flex: 1 }}>
          Nueva versión disponible
        </Typography>
        <Button
          size="small"
          variant="contained"
          onClick={() => updateServiceWorker(true)}
          sx={{
            bgcolor: '#2563EB', color: '#fff', textTransform: 'none',
            fontSize: 12, fontWeight: 600, borderRadius: '8px', minWidth: 70,
            '&:hover': { bgcolor: '#1D4ED8' },
          }}
        >
          Actualizar
        </Button>
        <IconButton size="small" onClick={() => setDismissed(true)} sx={{ color: 'rgba(255,255,255,0.5)', p: 0.5 }}>
          <CloseIcon sx={{ fontSize: 16 }} />
        </IconButton>
      </Box>
    </Snackbar>
  );
}
