import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Box, Card, CardContent, Typography, TextField, Button,
  Alert, InputAdornment, IconButton, Avatar,
} from '@mui/material';
import { Visibility, VisibilityOff, Login as LoginIcon, Route as RouteIcon } from '@mui/icons-material';
import { useAuth } from '../../../application/hooks/useAuth';

const loginSchema = z.object({
  correo: z.string().min(1, 'El usuario o correo es requerido'),
  password: z.string().min(1, 'La contraseña es requerida'),
});

export function LoginPage() {
  const navigate = useNavigate();
  const { login, usuario } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    try {
      setError('');
      setLoading(true);
      const user = await login(data.correo, data.password);
      if (user.primer_login) {
        navigate('/cambiar-password');
      } else if (user.rol === 'administrador') {
        navigate('/admin/dashboard');
      } else {
        navigate('/aforador/iniciar-turno');
      }
    } catch (err) {
      setError(err.message || 'Credenciales inválidas');
    } finally {
      setLoading(false);
    }
  };

  if (usuario) {
    if (usuario.primer_login) return <Navigate to="/cambiar-password" replace />;
    if (usuario.rol === 'administrador') return <Navigate to="/admin/dashboard" replace />;
    return <Navigate to="/aforador/iniciar-turno" replace />;
  }

  return (
    <Box sx={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #003DA5, #0D5BFF)',
      position: 'relative', overflow: 'hidden', p: 2,
    }}>
      {/* Elementos decorativos */}
      <Box sx={{ position: 'absolute', top: -120, right: -120, width: 400, height: 400, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />
      <Box sx={{ position: 'absolute', bottom: -160, left: -80, width: 500, height: 500, borderRadius: '50%', background: 'rgba(255,255,255,0.03)', pointerEvents: 'none' }} />
      <Box sx={{ position: 'absolute', top: '30%', left: '10%', width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.02)', pointerEvents: 'none' }} />

      <Card sx={{
        maxWidth: 400, width: '100%', position: 'relative', zIndex: 1,
        borderRadius: '24px', boxShadow: '0 20px 60px rgba(0,0,0,.25)',
      }}>
        <CardContent sx={{ p: 4, '&:last-child': { pb: 4 } }}>
          {/* Logo */}
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Avatar sx={{
              width: 64, height: 64, mx: 'auto', mb: 1.5,
              bgcolor: '#0D5BFF', boxShadow: '0 6px 20px rgba(13,91,255,.3)',
            }}>
              <RouteIcon sx={{ fontSize: 32, color: '#FFFFFF' }} />
            </Avatar>
            <Typography variant="h4" fontWeight={800} color="#0A2A66" sx={{ letterSpacing: '0.5px' }}>
              Metro AQP Aforos
            </Typography>
            <Typography variant="body2" color="#666666" sx={{ mt: 0.5 }}>
              Sistema de registro de aforos vehiculares
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: '12px' }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)}>
            <TextField
              fullWidth
              label="Usuario o correo"
              autoComplete="username"
              {...register('correo')}
              error={!!errors.correo}
              helperText={errors.correo?.message}
              margin="normal"
              autoFocus
              slotProps={{
                input: {
                  sx: { borderRadius: '12px', bgcolor: '#F5F7FA' },
                },
              }}
            />
            <TextField
              fullWidth
              label="Contraseña"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              {...register('password')}
              error={!!errors.password}
              helperText={errors.password?.message}
              margin="normal"
              slotProps={{
                input: {
                  sx: { borderRadius: '12px', bgcolor: '#F5F7FA' },
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
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
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 12px 28px rgba(13,91,255,.45)',
                },
                '&:disabled': { background: '#E0E0E0', boxShadow: 'none' },
                transition: 'all 0.2s ease',
              }}
              startIcon={<LoginIcon />}
              disabled={loading}
            >
              {loading ? 'Ingresando...' : 'INICIAR SESIÓN'}
            </Button>
          </form>

          <Typography variant="body2" sx={{ textAlign: 'center', mt: 2.5 }}>
            <Button
              size="small"
              onClick={() => navigate('/recuperar-password')}
              sx={{
                textTransform: 'none', color: '#0D5BFF', fontWeight: 600, fontSize: 13,
                '&:hover': { bgcolor: 'rgba(13,91,255,.06)' },
                borderRadius: '8px', px: 1.5,
              }}
            >
              ¿Olvidaste tu contraseña?
            </Button>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}