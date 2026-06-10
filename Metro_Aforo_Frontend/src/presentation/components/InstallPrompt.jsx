import { useState, useEffect } from 'react';
import { Button, Snackbar } from '@mui/material';
import InstallMobileIcon from '@mui/icons-material/InstallMobile';

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [show, setShow] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShow(true);
    };
    window.addEventListener('beforeinstallprompt', handler);

    const installedHandler = () => {
      setInstalled(true);
      setShow(false);
      setDeferredPrompt(null);
    };
    window.addEventListener('appinstalled', installedHandler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', installedHandler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const result = await deferredPrompt.userChoice;
    if (result.outcome === 'accepted') {
      setInstalled(true);
      setShow(false);
    }
    setDeferredPrompt(null);
  };

  if (installed || !show) return null;

  return (
    <Snackbar
      open={show}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      sx={{ mb: 8 }}
    >
      <Button
        variant="contained"
        startIcon={<InstallMobileIcon />}
        onClick={handleInstall}
        sx={{
          bgcolor: '#003DA5', color: '#fff',
          textTransform: 'none', fontWeight: 600,
          borderRadius: '12px', px: 3, py: 1.25,
          fontSize: 14, boxShadow: '0 4px 16px rgba(0,61,165,0.3)',
          '&:hover': { bgcolor: '#002d7a' },
        }}
      >
        Instalar aplicación
      </Button>
    </Snackbar>
  );
}
