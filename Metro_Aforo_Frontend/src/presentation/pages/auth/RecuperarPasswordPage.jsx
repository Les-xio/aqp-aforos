import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Card, CardContent, Typography, TextField, Button, Alert, Avatar,
} from '@mui/material';
import { Email as EmailIcon, ArrowBack as BackIcon, Route as RouteIcon, ContentCopy as CopyIcon } from '@mui/icons-material';
import { authService } from '../../../application/services/authService';

export function RecuperarPasswordPage() {
  const navigate = useNavigate();
  const [correo, setCorreo] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [recoveryLink, setRecoveryLink] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setRecoveryLink('');
    if (!correo) {
      setError('Ingrese su correo electrónico');
      return;
    }
    try {
      setLoading(true);
      const res = await authService.solicitarRecuperacion(correo);
      const token = res.data?.token || res.token;
      const link = `${window.location.origin}/restablecer-password/${token}`;
      setRecoveryLink(link);
      setSuccess('Enlace de recuperación generado. Haz clic en el botón abajo para restablecer tu contraseña.');
    } catch (err) {
      setError(err.message || 'Error al solicitar recuperación');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #003DA5, #0D5BFF)',
      position: 'relative', overflow: 'hidden', p: 2,
    }}>
      <Box sx={{ position: 'absolute', top: -120, right: -120, width: 400, height: 400, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />
      <Box sx={{ position: 'absolute', bottom: -160, left: -80, width: 500, height: 500, borderRadius: '50%', background: 'rgba(255,255,255,0.03)', pointerEvents: 'none' }} />

      <Card sx={{
        maxWidth: 400, width: '100%', position: 'relative', zIndex: 1,
        borderRadius: '24px', boxShadow: '0 20px 60px rgba(0,0,0,.25)',
      }}>
        <CardContent sx={{ p: 4, '&:last-child': { pb: 4 } }}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Avatar sx={{
              width: 64, height: 64, mx: 'auto', mb: 1.5,
              bgcolor: '#0D5BFF', boxShadow: '0 6px 20px rgba(13,91,255,.3)',
            }}>
              <RouteIcon sx={{ fontSize: 32, color: '#FFFFFF' }} />
            </Avatar>
            <Typography variant="h5" fontWeight={800} color="#0A2A66" sx={{ letterSpacing: '0.3px' }}>
              Recuperar contraseña
            </Typography>
            <Typography variant="body2" color="#666666" sx={{ mt: 0.5 }}>
              Ingrese su correo para recibir un enlace de recuperación
            </Typography>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 2, borderRadius: '12px' }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2, borderRadius: '12px' }}>{success}</Alert>}
          {recoveryLink && (
            <Button
              fullWidth
              variant="outlined"
              onClick={() => navigate(`/restablecer-password/${recoveryLink.split('/').pop()}`)}
              sx={{
                mb: 2, py: 1.2, borderRadius: '12px', textTransform: 'none',
                fontWeight: 600, fontSize: 13, color: '#0D5BFF', borderColor: '#0D5BFF',
                '&:hover': { borderColor: '#0052CC', bgcolor: 'rgba(13,91,255,.06)' },
              }}
            >
              Ir a restablecer contraseña
            </Button>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Correo electrónico"
              type="email"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              margin="normal"
              autoFocus
              slotProps={{
                input: {
                  sx: { borderRadius: '12px', bgcolor: '#F5F7FA' },
                  startAdornment: <EmailIcon sx={{ color: '#999', mr: 1, fontSize: 20 }} />,
                },
              }}
            />
            <Button
              type="submit"
              variant="contained"
              size="large"
              fullWidth
              sx={{
                mt: 3, py: 1.6, borderRadius: '14px', fontWeight: 700, fontSize: 15,
                background: 'linear-gradient(90deg, #0D5BFF, #0052CC)',
                boxShadow: '0 8px 20px rgba(13,91,255,.35)',
                '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 12px 28px rgba(13,91,255,.45)' },
                '&:disabled': { background: '#E0E0E0', boxShadow: 'none' },
                transition: 'all 0.2s ease',
              }}
              disabled={loading || !!success}
            >
              {loading ? 'ENVIANDO...' : 'ENVIAR ENLACE'}
            </Button>
          </Box>

          <Box sx={{ textAlign: 'center', mt: 2.5 }}>
            <Button
              size="small"
              onClick={() => navigate('/login')}
              startIcon={<BackIcon />}
              sx={{
                textTransform: 'none', color: '#0D5BFF', fontWeight: 600, fontSize: 13,
                '&:hover': { bgcolor: 'rgba(13,91,255,.06)' },
                borderRadius: '8px', px: 1.5,
              }}
            >
              Volver al inicio de sesión
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}