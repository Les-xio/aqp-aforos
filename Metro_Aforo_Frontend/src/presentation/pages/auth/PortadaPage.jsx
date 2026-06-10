import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Avatar, Fade } from '@mui/material';
import { useAuth } from '../../../application/hooks/useAuth';
import RouteIcon from '@mui/icons-material/Route';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

export function PortadaPage() {
  const navigate = useNavigate();
  const { usuario } = useAuth();

  useEffect(() => {
    if (usuario) {
      navigate(usuario.rol === 'administrador' ? '/admin/dashboard' : '/aforador/iniciar-turno', { replace: true });
    }
  }, [usuario, navigate]);

  if (usuario) return null;

  return (
    <Box
      sx={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #003DA5 0%, #0D5BFF 50%, #1a6bff 100%)',
        position: 'relative',
        overflow: 'hidden',
        px: 2,
      }}
    >
      {/* Decorative circles */}
      <Box sx={{
        position: 'absolute', top: '-120px', right: '-80px',
        width: 320, height: 320, borderRadius: '50%',
        background: 'rgba(255,255,255,0.06)',
      }} />
      <Box sx={{
        position: 'absolute', bottom: '-60px', left: '-60px',
        width: 240, height: 240, borderRadius: '50%',
        background: 'rgba(255,255,255,0.05)',
      }} />
      <Box sx={{
        position: 'absolute', top: '40%', left: '10%',
        width: 120, height: 120, borderRadius: '50%',
        background: 'rgba(255,255,255,0.03)',
      }} />

      <Fade in timeout={800}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1 }}>
          <Avatar
            sx={{
              width: 80, height: 80, mb: 2,
              bgcolor: 'rgba(255,255,255,0.15)',
              backdropFilter: 'blur(8px)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
            }}
          >
            <RouteIcon sx={{ fontSize: 40, color: '#FFFFFF' }} />
          </Avatar>

          <Typography
            sx={{
              fontSize: 36, fontWeight: 800, color: '#FFFFFF',
              letterSpacing: '1px', mb: 0.5,
              textShadow: '0 2px 12px rgba(0,0,0,0.2)',
            }}
          >
            Metro AQP Aforos
          </Typography>

          <Typography
            sx={{
              fontSize: 15, color: 'rgba(255,255,255,0.75)',
              fontWeight: 400, mb: 6, textAlign: 'center',
              maxWidth: 280,
            }}
          >
            Sistema de aforo vehicular para el transporte público de Arequipa
          </Typography>

          <Button
            variant="contained"
            onClick={() => navigate('/login')}
            endIcon={<ArrowForwardIcon />}
            sx={{
              bgcolor: '#FFFFFF', color: '#003DA5',
              fontWeight: 700, fontSize: 16,
              textTransform: 'none', borderRadius: '14px',
              px: 5, py: 1.5,
              boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
              '&:hover': {
                bgcolor: '#F0F4FF',
                boxShadow: '0 12px 32px rgba(0,0,0,0.3)',
                transform: 'translateY(-1px)',
              },
              transition: 'all 0.2s ease',
            }}
          >
            Iniciar sesión
          </Button>

          <Typography
            sx={{
              mt: 4, fontSize: 11, color: 'rgba(255,255,255,0.35)',
              textAlign: 'center',
            }}
          >
            &copy; {new Date().getFullYear()} Metro AQP Aforos. Todos los derechos reservados.
          </Typography>
        </Box>
      </Fade>
    </Box>
  );
}
