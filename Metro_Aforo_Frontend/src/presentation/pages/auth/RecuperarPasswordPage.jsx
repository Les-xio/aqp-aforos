import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Card, CardContent, Typography, TextField, Button, Alert, Avatar,
  InputAdornment, IconButton,
} from '@mui/material';
import { Visibility, VisibilityOff, Email as EmailIcon, ArrowBack as BackIcon, Route as RouteIcon, Save as SaveIcon } from '@mui/icons-material';
import { authService } from '../../../application/services/authService';

export function RecuperarPasswordPage() {
  const navigate = useNavigate();
  const [correo, setCorreo] = useState('');
  const [nuevaPassword, setNuevaPassword] = useState('');
  const [confirmarPassword, setConfirmarPassword] = useState('');
  const [showPwd, setShowPwd] = useState({ nueva: false, confirm: false });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('email');

  const solicitarToken = async (e) => {
    e.preventDefault();
    setError('');
    if (!correo) { setError('Ingrese su correo'); return; }
    try {
      setLoading(true);
      await authService.solicitarRecuperacion(correo);
      setStep('password');
      setLoading(false);
    } catch (err) {
      setError(err.message || 'Correo no encontrado');
      setLoading(false);
    }
  };

  const restablecer = async (e) => {
    e.preventDefault();
    setError('');
    if (nuevaPassword.length < 6) { setError('Mínimo 6 caracteres'); return; }
    if (nuevaPassword !== confirmarPassword) { setError('No coinciden'); return; }
    try {
      setLoading(true);
      const res = await authService.solicitarRecuperacion(correo);
      const token = res.data?.token || res.token;
      await authService.restablecerPassword(token, nuevaPassword);
      setSuccess('Contraseña restablecida correctamente');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.message || 'Error al restablecer');
    } finally { setLoading(false); }
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
              Restablecer contraseña
            </Typography>
            <Typography variant="body2" color="#666666" sx={{ mt: 0.5 }}>
              {step === 'email' ? 'Ingrese su correo para continuar' : 'Ingrese su nueva contraseña'}
            </Typography>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 2, borderRadius: '12px' }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2, borderRadius: '12px' }}>{success}</Alert>}

          {step === 'email' ? (
            <Box component="form" onSubmit={solicitarToken}>
              <TextField fullWidth label="Correo electrónico" type="email" value={correo}
                onChange={(e) => setCorreo(e.target.value)} margin="normal" autoFocus
                slotProps={{ input: { sx: { borderRadius: '12px', bgcolor: '#F5F7FA' }, startAdornment: <EmailIcon sx={{ color: '#999', mr: 1, fontSize: 20 }} /> } }} />
              <Button type="submit" variant="contained" size="large" fullWidth disabled={loading}
                sx={{ mt: 3, py: 1.6, borderRadius: '14px', fontWeight: 700, fontSize: 15, background: 'linear-gradient(90deg, #0D5BFF, #0052CC)', boxShadow: '0 8px 20px rgba(13,91,255,.35)', '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 12px 28px rgba(13,91,255,.45)' }, '&:disabled': { background: '#E0E0E0', boxShadow: 'none' }, transition: 'all 0.2s ease' }}>
                {loading ? 'VERIFICANDO...' : 'CONTINUAR'}
              </Button>
            </Box>
          ) : (
            <Box component="form" onSubmit={restablecer}>
              <TextField fullWidth label="Nueva contraseña" type={showPwd.nueva ? 'text' : 'password'}
                value={nuevaPassword} onChange={(e) => setNuevaPassword(e.target.value)} margin="normal" required
                slotProps={{ input: { sx: { borderRadius: '12px', bgcolor: '#F5F7FA' }, endAdornment: <InputAdornment position="end"><IconButton onClick={() => setShowPwd({ ...showPwd, nueva: !showPwd.nueva })} edge="end">{showPwd.nueva ? <VisibilityOff /> : <Visibility />}</IconButton></InputAdornment> } }} />
              <TextField fullWidth label="Confirmar contraseña" type={showPwd.confirm ? 'text' : 'password'}
                value={confirmarPassword} onChange={(e) => setConfirmarPassword(e.target.value)} margin="normal" required
                slotProps={{ input: { sx: { borderRadius: '12px', bgcolor: '#F5F7FA' }, endAdornment: <InputAdornment position="end"><IconButton onClick={() => setShowPwd({ ...showPwd, confirm: !showPwd.confirm })} edge="end">{showPwd.confirm ? <VisibilityOff /> : <Visibility />}</IconButton></InputAdornment> } }} />
              <Button type="submit" variant="contained" size="large" fullWidth startIcon={<SaveIcon />} disabled={loading || !!success}
                sx={{ mt: 3, py: 1.6, borderRadius: '14px', fontWeight: 700, fontSize: 15, background: 'linear-gradient(90deg, #0D5BFF, #0052CC)', boxShadow: '0 8px 20px rgba(13,91,255,.35)', '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 12px 28px rgba(13,91,255,.45)' }, '&:disabled': { background: '#E0E0E0', boxShadow: 'none' }, transition: 'all 0.2s ease' }}>
                {loading ? 'GUARDANDO...' : 'RESTABLECER CONTRASEÑA'}
              </Button>
            </Box>
          )}

          <Box sx={{ textAlign: 'center', mt: 2.5 }}>
            <Button size="small" onClick={() => step === 'password' ? setStep('email') : navigate('/login')} startIcon={<BackIcon />}
              sx={{ textTransform: 'none', color: '#0D5BFF', fontWeight: 600, fontSize: 13, '&:hover': { bgcolor: 'rgba(13,91,255,.06)' }, borderRadius: '8px', px: 1.5 }}>
              {step === 'password' ? 'Cambiar correo' : 'Volver al inicio de sesión'}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
