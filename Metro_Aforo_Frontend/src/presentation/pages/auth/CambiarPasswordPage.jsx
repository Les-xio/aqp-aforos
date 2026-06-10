import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Card, CardContent, Typography, TextField, Button, Alert,
  InputAdornment, IconButton,
} from '@mui/material';
import { Save as SaveIcon, Visibility, VisibilityOff } from '@mui/icons-material';
import { useAuth } from '../../../application/hooks/useAuth';
import { authService } from '../../../application/services/authService';

export function CambiarPasswordPage() {
  const navigate = useNavigate();
  const { usuario, logout } = useAuth();
  const [passwordActual, setPasswordActual] = useState('');
  const [nuevaPassword, setNuevaPassword] = useState('');
  const [confirmarPassword, setConfirmarPassword] = useState('');
  const [showPwd, setShowPwd] = useState({ actual: false, nueva: false, confirm: false });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!passwordActual) {
      setError('Ingrese su contraseña actual');
      return;
    }
    if (nuevaPassword.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    if (nuevaPassword !== confirmarPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    try {
      setLoading(true);
      await authService.cambiarPassword(passwordActual, nuevaPassword);
      setSuccess('Contraseña actualizada correctamente');
      setTimeout(() => {
        if (usuario?.rol === 'administrador') {
          navigate('/admin/dashboard');
        } else {
          navigate('/aforador/iniciar-turno');
        }
      }, 1500);
    } catch (err) {
      setError(err.message || 'Error al cambiar contraseña');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'primary.dark', p: 2 }}>
      <Card sx={{ maxWidth: 420, width: '100%' }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h5" fontWeight={700} sx={{ textAlign: 'center' }} gutterBottom color="primary.main">
            Metro AQP Aforos
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mb: 2 }}>
            Bienvenido, {usuario?.nombres} {usuario?.apellidos}
          </Typography>
          <Alert severity="info" sx={{ mb: 2 }}>
            Este es tu primer inicio de sesión. Debes cambiar tu contraseña.
          </Alert>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Contraseña actual"
              type={showPwd.actual ? 'text' : 'password'}
              value={passwordActual}
              onChange={(e) => setPasswordActual(e.target.value)}
              margin="normal"
              required
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPwd({ ...showPwd, actual: !showPwd.actual })} edge="end">
                        {showPwd.actual ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />
            <TextField
              fullWidth
              label="Nueva contraseña"
              type={showPwd.nueva ? 'text' : 'password'}
              value={nuevaPassword}
              onChange={(e) => setNuevaPassword(e.target.value)}
              margin="normal"
              required
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPwd({ ...showPwd, nueva: !showPwd.nueva })} edge="end">
                        {showPwd.nueva ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />
            <TextField
              fullWidth
              label="Confirmar contraseña"
              type={showPwd.confirm ? 'text' : 'password'}
              value={confirmarPassword}
              onChange={(e) => setConfirmarPassword(e.target.value)}
              margin="normal"
              required
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPwd({ ...showPwd, confirm: !showPwd.confirm })} edge="end">
                        {showPwd.confirm ? <VisibilityOff /> : <Visibility />}
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
              sx={{ mt: 3, py: 1.5 }}
              startIcon={<SaveIcon />}
              disabled={loading}
            >
              {loading ? 'GUARDANDO...' : 'CAMBIAR CONTRASEÑA'}
            </Button>
          </Box>

          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Button size="small" color="error" onClick={logout}>
              Cerrar sesión
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
