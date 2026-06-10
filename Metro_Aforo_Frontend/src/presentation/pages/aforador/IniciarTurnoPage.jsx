import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Card, CardContent, Typography, Button, MenuItem, TextField, Alert, CircularProgress,
  Avatar,
} from '@mui/material';
import {
  PlayArrow as PlayIcon, Logout as LogoutIcon,
  Person as PersonIcon, LocationOn as LocationIcon,
  SwapHoriz as SwapIcon, Schedule as ScheduleIcon,
  Block as BlockIcon, CheckCircle as CheckIcon,
} from '@mui/icons-material';
import { HelpButton } from '../../components/tours/HelpButton';
import { tours } from '../../components/tours/tourConfig';
import { useAuth } from '../../../application/hooks/useAuth';
import { useTurno } from '../../../application/hooks/useTurno';
import { puntoAforoService } from '../../../application/services/puntoAforoService';
import { SENTIDOS } from '../../../domain/constants';

const font = "'Inter', 'Poppins', 'Segoe UI', sans-serif";

export function IniciarTurnoPage() {
  const navigate = useNavigate();
  const { usuario, logout } = useAuth();
  const { turnoPendiente, verificarTurnoPendiente, activarTurnoPendiente, loading } = useTurno();
  const [puntos, setPuntos] = useState([]);
  const [puntoAforoId, setPuntoAforoId] = useState('');
  const [sentido, setSentido] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        const pendiente = await verificarTurnoPendiente();
        if (!pendiente) {
          setChecking(false);
          return;
        }
        const res = await puntoAforoService.listar();
        setPuntos(res.data || []);
      } catch {
        setError('Error al cargar datos');
      } finally {
        setChecking(false);
      }
    };
    init();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!puntoAforoId || !sentido) {
      setError('Seleccione un punto de aforo y un sentido');
      return;
    }
    try {
      setError('');
      setSubmitting(true);
      await activarTurnoPendiente(Number(puntoAforoId), sentido);
      navigate('/aforador/menu');
    } catch (err) {
      setError(err.message || 'Error al iniciar turno');
    } finally {
      setSubmitting(false);
    }
  };

  const turno = turnoPendiente;
  const tieneTurnoAsignado = !!turno;

  return (
    <Box sx={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #003DA5, #0D5BFF)',
      position: 'relative', overflow: 'hidden', p: 2,
    }}>
      <Box sx={{
        position: 'absolute', top: -80, right: -80, width: 300, height: 300,
        borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none',
      }} />
      <Box sx={{
        position: 'absolute', bottom: -120, left: -60, width: 400, height: 400,
        borderRadius: '50%', background: 'rgba(255,255,255,0.03)', pointerEvents: 'none',
      }} />
      <Box sx={{
        position: 'absolute', top: '40%', left: -40, width: 200, height: 200,
        borderRadius: '50%', background: 'rgba(255,255,255,0.03)', pointerEvents: 'none',
      }} />

      <Card data-tour="iniciar-header" sx={{
        maxWidth: 420, width: '100%',
        borderRadius: '24px',
        boxShadow: '0px 15px 40px rgba(0,0,0,.15)',
        position: 'relative', zIndex: 1,
      }}>
        <CardContent sx={{ p: '40px' }}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Box sx={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: 80, height: 80, borderRadius: '50%',
              background: 'linear-gradient(135deg, #0D5BFF, #0052CC)',
              boxShadow: '0 10px 30px rgba(13,91,255,.4)',
              mb: 2,
            }}>
              <ScheduleIcon sx={{ fontSize: 36, color: '#FFFFFF' }} />
            </Box>
            <Typography sx={{ fontSize: 48, fontWeight: 700, color: '#0A2A66', lineHeight: 1.1, fontFamily: font }}>
              Metro AQP Aforos
            </Typography>
            <Typography sx={{ mt: 0.5, fontSize: 15, color: '#666666', fontFamily: font }}>
              Iniciar turno de aforo
            </Typography>
          </Box>

          <Box sx={{
            display: 'flex', alignItems: 'center', gap: 1.5,
            p: 1.5, background: '#F5F8FF', borderRadius: '16px',
            mb: '24px',
          }}>
            <Avatar sx={{ bgcolor: '#0D5BFF', width: 40, height: 40 }}>
              <PersonIcon />
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography sx={{ fontSize: 14, fontWeight: 600, color: '#0A2A66', fontFamily: font }} noWrap>
                {usuario?.nombres} {usuario?.apellidos}
              </Typography>
              <Typography sx={{ fontSize: 12, color: '#666666', textTransform: 'capitalize', fontFamily: font }}>
                Rol: {usuario?.rol}
              </Typography>
            </Box>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: '24px', borderRadius: '16px' }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          {checking ? (
            <CircularProgress sx={{ display: 'block', mx: 'auto', my: 4 }} />
          ) : !tieneTurnoAsignado ? (
            <>
              <Box sx={{
                textAlign: 'center', py: 4, px: 2,
                background: '#FFF3F3', borderRadius: '16px', mb: '24px',
              }}>
                <BlockIcon sx={{ fontSize: 48, color: '#DC2626', mb: 1.5 }} />
                <Typography sx={{ fontSize: 16, fontWeight: 700, color: '#DC2626', fontFamily: font, mb: 1 }}>
                  Sin turno asignado
                </Typography>
                <Typography sx={{ fontSize: 13, color: '#6B7280', fontFamily: font }}>
                  El administrador debe asignarte un turno antes de que puedas iniciar.
                </Typography>
              </Box>
              <Button
                fullWidth
                disabled
                sx={{
                  height: 70, borderRadius: '16px', fontSize: 16, fontWeight: 700,
                  background: '#E5E7EB', color: '#9CA3AF',
                }}
                startIcon={<BlockIcon />}
              >
                INICIAR TURNO
              </Button>
            </>
          ) : (
            <Box component="form" data-tour="iniciar-activar" onSubmit={handleSubmit}>
                <Box data-tour="iniciar-info" sx={{
                  p: 2, background: '#F0FFF4', borderRadius: '16px', mb: '24px',
                  display: 'flex', alignItems: 'center', gap: 1.5,
                }}>
                <CheckIcon sx={{ color: '#16A34A', fontSize: 28 }} />
                <Box>
                  <Typography sx={{ fontSize: 14, fontWeight: 700, color: '#16A34A', fontFamily: font }}>
                    Turno asignado
                  </Typography>
                  <Typography sx={{ fontSize: 12, color: '#6B7280', fontFamily: font }}>
                    Franjas: {turno.franjas?.length || 0} &middot; Creado por administrador
                  </Typography>
                </Box>
              </Box>

              <TextField
                select
                fullWidth
                label="Punto de aforo"
                value={puntoAforoId}
                onChange={(e) => setPuntoAforoId(e.target.value)}
                required
                sx={{ mb: '24px' }}
                slotProps={{
                  select: { displayEmpty: true },
                  input: {
                    startAdornment: (
                      <LocationIcon sx={{ mr: 1.5, color: '#0D5BFF', fontSize: 22 }} />
                    ),
                    sx: {
                      height: 80, borderRadius: '16px', fontSize: 15, fontFamily: font,
                      '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#0D5BFF' },
                      '&.Mui-focused': { boxShadow: '0 0 0 4px rgba(13,91,255,.15)' },
                    },
                  },
                }}
              >
                <MenuItem value="" disabled>-- Seleccione --</MenuItem>
                {puntos.map((p) => (
                  <MenuItem key={p.id_punto_aforo} value={p.id_punto_aforo}>
                    {p.nombre_punto}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                select
                fullWidth
                label="Sentido"
                value={sentido}
                onChange={(e) => setSentido(e.target.value)}
                required
                sx={{ mb: '24px' }}
                slotProps={{
                  select: { displayEmpty: true },
                  input: {
                    startAdornment: (
                      <SwapIcon sx={{ mr: 1.5, color: '#0D5BFF', fontSize: 22 }} />
                    ),
                    sx: {
                      height: 80, borderRadius: '16px', fontSize: 15, fontFamily: font,
                      '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#0D5BFF' },
                      '&.Mui-focused': { boxShadow: '0 0 0 4px rgba(13,91,255,.15)' },
                    },
                  },
                }}
              >
                <MenuItem value="" disabled>-- Seleccione --</MenuItem>
                {SENTIDOS.map((s) => (
                  <MenuItem key={s} value={s}>{s.toUpperCase()}</MenuItem>
                ))}
              </TextField>

              <Button
                type="submit"
                fullWidth
                sx={{
                  height: 70, borderRadius: '16px', fontSize: 16, fontWeight: 700,
                  background: 'linear-gradient(90deg, #0D5BFF, #0052CC)',
                  color: '#FFFFFF',
                  boxShadow: '0 10px 20px rgba(13,91,255,.3)',
                  '&:hover': {
                    background: 'linear-gradient(90deg, #0D5BFF, #0052CC)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 14px 28px rgba(13,91,255,.4)',
                  },
                  transition: 'all 0.2s ease',
                }}
                startIcon={<PlayIcon />}
                disabled={submitting}
              >
                {submitting ? 'INICIANDO...' : 'INICIAR TURNO'}
              </Button>
            </Box>
          )}

          <Box sx={{ textAlign: 'center', mt: '24px' }}>
            <Button
              variant="text"
              onClick={logout}
              sx={{
                color: '#0D5BFF', fontSize: 14, fontWeight: 500,
                background: 'transparent', textTransform: 'none', fontFamily: font,
                '&:hover': { background: 'transparent', textDecoration: 'underline' },
              }}
              startIcon={<LogoutIcon />}
            >
              Cerrar sesión
            </Button>
          </Box>
        </CardContent>
      </Card>
      <HelpButton steps={tours.aforador.iniciarTurno} />
    </Box>
  );
}
