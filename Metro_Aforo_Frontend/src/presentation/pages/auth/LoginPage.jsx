import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Box, Card, CardContent, Typography, TextField, Button,
  Alert, InputAdornment, IconButton,
} from '@mui/material';
import { Visibility, VisibilityOff, Login as LoginIcon } from '@mui/icons-material';
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
    if (usuario.rol === 'administrador') return <Navigate to="/admin/dashboard" replace />;
    return <Navigate to="/aforador/iniciar-turno" replace />;
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'primary.dark', p: 2 }}>
      <Card sx={{ maxWidth: 400, width: '100%' }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h4" fontWeight={700} textAlign="center" gutterBottom color="primary.main">
            AQP Aforos
          </Typography>
          <Typography variant="body2" color="text.secondary" textAlign="center" mb={3}>
            Sistema de registro de aforos vehiculares
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <form onSubmit={handleSubmit(onSubmit)}>
            <TextField
              fullWidth
              label="Usuario o correo"
              {...register('correo')}
              error={!!errors.correo}
              helperText={errors.correo?.message}
              margin="normal"
              autoFocus
            />
            <TextField
              fullWidth
              label="Contraseña"
              type={showPassword ? 'text' : 'password'}
              {...register('password')}
              error={!!errors.password}
              helperText={errors.password?.message}
              margin="normal"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Button
              type="submit"
              variant="contained"
              size="large"
              fullWidth
              sx={{ mt: 3, py: 1.5 }}
              startIcon={<LoginIcon />}
              disabled={loading}
            >
              {loading ? 'Ingresando...' : 'INICIAR SESIÓN'}
            </Button>
          </form>

          <Typography variant="body2" textAlign="center" mt={2}>
            <Button size="small" onClick={() => navigate('/recuperar-password')} sx={{ textTransform: 'none' }}>
              ¿Olvidaste tu contraseña?
            </Button>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
