import { Box, CircularProgress, Typography } from '@mui/material';

export function LoadingScreen({ message = 'Cargando...' }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', gap: 2 }}>
      <CircularProgress size={60} />
      <Typography variant="h6" color="text.secondary">{message}</Typography>
    </Box>
  );
}
