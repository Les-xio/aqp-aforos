import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Button, Card, CardContent, Alert, Avatar,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
} from '@mui/material';
import {
  DirectionsCar as CarIcon, Traffic as TrafficIcon, Logout as LogoutIcon,
  Person as PersonIcon, AccessTime as ClockIcon, CalendarToday as CalendarIcon,
  Edit as EditIcon, Save as SaveIcon,
} from '@mui/icons-material';
import { HelpButton } from '../../components/tours/HelpButton';
import { tours } from '../../components/tours/tourConfig';
import { AforadorLayout } from '../../components/aforador/AforadorLayout';
import { useAuth } from '../../../application/hooks/useAuth';
import { useTurno } from '../../../application/hooks/useTurno';
import { usuarioService } from '../../../application/services/usuarioService';

export function MenuPrincipalPage() {
  const navigate = useNavigate();
  const { usuario } = useAuth();
  const { turnoActivo, verificarTurnoActivo, cerrarTurno } = useTurno();
  const [hora, setHora] = useState(new Date());
  const [error, setError] = useState('');
  const [perfilOpen, setPerfilOpen] = useState(false);
  const [perfilData, setPerfilData] = useState({ dni: usuario?.dni || '', celular: usuario?.celular || '' });
  const [perfilLoading, setPerfilLoading] = useState(false);

  useEffect(() => {
    const check = async () => {
      const activo = await verificarTurnoActivo();
      if (activo === undefined && !turnoActivo) navigate('/aforador/iniciar-turno');
    };
    check();
  }, []);

  useEffect(() => {
    if (turnoActivo === undefined) navigate('/aforador/iniciar-turno');
  }, [turnoActivo]);

  useEffect(() => {
    const interval = setInterval(() => setHora(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    window.history.pushState(null, '', window.location.href);
    const handlePop = () => window.history.pushState(null, '', window.location.href);
    window.addEventListener('popstate', handlePop);
    return () => window.removeEventListener('popstate', handlePop);
  }, []);

  const handleActualizarPerfil = async () => {
    try {
      setPerfilLoading(true);
      setError('');
      await usuarioService.actualizar(usuario.id_usuario, perfilData);
      setPerfilOpen(false);
      const stored = JSON.parse(localStorage.getItem('usuario') || '{}');
      localStorage.setItem('usuario', JSON.stringify({ ...stored, ...perfilData }));
    } catch (err) {
      setError(err.message || 'Error al actualizar perfil');
    } finally {
      setPerfilLoading(false);
    }
  };

  const handleCerrarTurno = async () => {
    try {
      setError('');
      await cerrarTurno();
      navigate('/aforador/iniciar-turno');
    } catch (err) {
      setError(err.message || 'Error al cerrar turno');
    }
  };

  const fechaStr = hora.toLocaleDateString('es-PE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const horaStr = hora.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  return (
    <AforadorLayout hideUserBar>
      <Box sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #003DA5, #0D5BFF)',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Elementos decorativos */}
        <Box sx={{ position: 'absolute', top: -80, right: -80, width: 300, height: 300, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />
        <Box sx={{ position: 'absolute', bottom: -120, left: -60, width: 400, height: 400, borderRadius: '50%', background: 'rgba(255,255,255,0.03)', pointerEvents: 'none' }} />

        <Box data-tour="menu-buttons" sx={{ position: 'relative', zIndex: 1, maxWidth: 500, mx: 'auto', px: 2, pt: 4, pb: 3 }}>
          {/* Logo + título */}
          <Box data-tour="menu-header" sx={{ textAlign: 'center', mb: 3 }}>
            <Box sx={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: 72, height: 72, borderRadius: '50%',
              background: 'rgba(255,255,255,0.15)',
              mb: 1.5,
            }}>
              <CarIcon sx={{ fontSize: 34, color: '#FFFFFF' }} />
            </Box>
            <Typography sx={{
              fontSize: 30, fontWeight: 800, color: '#FFFFFF',
              letterSpacing: '0.5px', textShadow: '0 2px 12px rgba(0,0,0,.2)',
            }}>
              Menú principal
            </Typography>
          </Box>

          {/* Reloj */}
          <Card sx={{
            mb: '24px', borderRadius: '24px',
            boxShadow: '0px 10px 30px rgba(0,0,0,.15)',
          }}>
            <CardContent sx={{ p: 3, textAlign: 'center' }}>
              <ClockIcon sx={{ fontSize: 32, color: '#0D5BFF', mb: 1 }} />
              <Typography sx={{ fontSize: 36, fontWeight: 700, color: '#0A2A66', lineHeight: 1.1 }}>
                {horaStr}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, mt: 0.5 }}>
                <CalendarIcon sx={{ fontSize: 16, color: '#666666' }} />
                <Typography sx={{ fontSize: 14, color: '#666666', textTransform: 'capitalize' }}>
                  {fechaStr}
                </Typography>
              </Box>
            </CardContent>
          </Card>

          {/* Info del usuario */}
          <Card sx={{ mb: '24px', borderRadius: '16px', boxShadow: '0px 5px 15px rgba(0,0,0,.1)' }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 2, '&:last-child': { pb: 2 } }}>
              <Avatar sx={{ bgcolor: '#0D5BFF', width: 40, height: 40 }}>
                <PersonIcon />
              </Avatar>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{ fontSize: 14, fontWeight: 600, color: '#0A2A66' }} noWrap>
                  {usuario?.nombres} {usuario?.apellidos}
                </Typography>
                <Typography sx={{ fontSize: 12, color: '#666666', textTransform: 'capitalize' }}>
                  Rol: {usuario?.rol}
                </Typography>
              </Box>
              <Button size="small" onClick={() => setPerfilOpen(true)}
                sx={{ minWidth: 0, width: 36, height: 36, borderRadius: '50%', color: '#0D5BFF', bgcolor: '#EFF6FF' }}>
                <EditIcon sx={{ fontSize: 18 }} />
              </Button>
            </CardContent>
          </Card>

          {error && (
            <Alert severity="error" sx={{ mb: '24px', borderRadius: '16px' }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          {/* Botón Conteo Vehicular */}
          <Button
            fullWidth
            sx={{
              height: 80, borderRadius: '16px', mb: '16px',
              background: 'linear-gradient(90deg, #a56800, #d4880c)',
              color: '#FFFFFF', fontSize: 16, fontWeight: 700,
              boxShadow: '0 10px 20px rgba(165,104,0,.35)',
              '&:hover': {
                background: 'linear-gradient(90deg, #b87500, #e09510)',
                transform: 'translateY(-2px)',
                boxShadow: '0 14px 28px rgba(165,104,0,.45)',
              },
              transition: 'all 0.2s ease',
            }}
            startIcon={<CarIcon sx={{ fontSize: 36 }} />}
            onClick={() => navigate('/aforador/franjas/1')}
          >
            CONTEO VEHICULAR
          </Button>

          {/* Botón Paradas y Colas */}
          <Button
            fullWidth
            sx={{
              height: 80, borderRadius: '16px', mb: '24px',
              background: 'linear-gradient(90deg, #059669, #047857)',
              color: '#FFFFFF', fontSize: 16, fontWeight: 700,
              boxShadow: '0 10px 20px rgba(5,150,105,.35)',
              '&:hover': {
                background: 'linear-gradient(90deg, #059669, #047857)',
                transform: 'translateY(-2px)',
                boxShadow: '0 14px 28px rgba(5,150,105,.45)',
              },
              transition: 'all 0.2s ease',
            }}
            startIcon={<TrafficIcon sx={{ fontSize: 36 }} />}
            onClick={() => navigate('/aforador/franjas/2')}
          >
            PARADAS Y COLAS
          </Button>

          {/* Botón Cerrar Turno */}
          <Box sx={{ textAlign: 'center' }}>
            <Button
              variant="text"
              onClick={handleCerrarTurno}
              sx={{
                color: 'rgba(255,255,255,0.8)', fontSize: 14, fontWeight: 500,
                background: 'transparent', textTransform: 'none',
                '&:hover': { background: 'rgba(255,255,255,0.1)', color: '#FFFFFF' },
              }}
              startIcon={<LogoutIcon />}
            >
              Cerrar turno
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Diálogo editar perfil */}
      <Dialog open={perfilOpen} onClose={() => setPerfilOpen(false)} maxWidth="xs" fullWidth
        slotProps={{ paper: { sx: { borderRadius: '16px' } } }}>
        <DialogTitle sx={{ fontWeight: 700, fontFamily: font }}>Editar perfil</DialogTitle>
        <DialogContent>
          <TextField fullWidth label="DNI" size="small" margin="normal"
            value={perfilData.dni}
            onChange={(e) => setPerfilData((p) => ({ ...p, dni: e.target.value }))}
            slotProps={{ htmlInput: { maxLength: 8 }, input: { sx: { borderRadius: '10px' } } }} />
          <TextField fullWidth label="Celular" size="small" margin="normal"
            value={perfilData.celular}
            onChange={(e) => setPerfilData((p) => ({ ...p, celular: e.target.value }))}
            slotProps={{ htmlInput: { maxLength: 9 }, input: { sx: { borderRadius: '10px' } } }} />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setPerfilOpen(false)} sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 600 }}>
            Cancelar
          </Button>
          <Button variant="contained" onClick={handleActualizarPerfil} disabled={perfilLoading}
            startIcon={<SaveIcon />}
            sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 600, background: 'linear-gradient(90deg, #0D5BFF, #0052CC)' }}>
            {perfilLoading ? 'Guardando...' : 'Guardar'}
          </Button>
        </DialogActions>
      </Dialog>

      <HelpButton steps={tours.aforador.menu} />
    </AforadorLayout>
  );
}
