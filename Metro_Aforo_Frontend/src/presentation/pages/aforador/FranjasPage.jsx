import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box, Typography, Grid, Card, CardContent, Button, Alert,
  Dialog, DialogTitle, DialogContent, DialogActions, Radio, RadioGroup, FormControlLabel,
  LinearProgress, Avatar,
} from '@mui/material';
import {
  CheckCircle as CheckIcon, AccessTime as ClockIcon,
  Block as BlockIcon, ArrowBack as BackIcon,
  PlayArrow as PlayIcon, Cancel as CancelIcon,
  DirectionsCar as CarIcon, Stop as StopIcon,
  Schedule as ScheduleIcon, CalendarToday as CalendarIcon,
  LocationOn as LocationIcon, SwapHoriz as SentidoIcon,
} from '@mui/icons-material';
import { HelpButton } from '../../components/tours/HelpButton';
import { tours } from '../../components/tours/tourConfig';
import { AforadorLayout } from '../../components/aforador/AforadorLayout';
import { useAuth } from '../../../application/hooks/useAuth';
import { useTurno } from '../../../application/hooks/useTurno';
import { useSync } from '../../../infrastructure/storage/SyncContext';
import { turnoService } from '../../../application/services/turnoService';
import { franjaService } from '../../../application/services/franjaService';
import { offlineStorage } from '../../../infrastructure/storage/offlineStorage';

export function FranjasPage() {
  const { formato } = useParams();
  const navigate = useNavigate();
  const { usuario } = useAuth();
  const { turnoActivo, verificarTurnoActivo } = useTurno();
  const { online } = useSync();
  const [franjas, setFranjas] = useState([]);
  const [hora, setHora] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [omitDialogOpen, setOmitDialogOpen] = useState(false);
  const [omitFranjaId, setOmitFranjaId] = useState(null);
  const [omitMotivo, setOmitMotivo] = useState('break');
  const [autoClosing, setAutoClosing] = useState(false);
  const [puntoInfo, setPuntoInfo] = useState(null);
  const cerradasAuto = useRef(new Set());

  useEffect(() => {
    const check = async () => {
      const activo = await verificarTurnoActivo();
      if (!activo) navigate('/aforador/iniciar-turno');
    };
    check();
  }, []);

  useEffect(() => {
    if (!turnoActivo) return;
    turnoService.getPuntos(turnoActivo.id_turno)
      .then(res => {
        if (res.data?.length > 0) setPuntoInfo(res.data[0]);
      })
      .catch(() => {});
  }, [turnoActivo]);

  const loadFranjas = useCallback(async () => {
    if (!turnoActivo) return;
    try {
      const res = await turnoService.getFranjas(turnoActivo.id_turno);
      setFranjas(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [turnoActivo]);

  useEffect(() => {
    loadFranjas();
  }, [loadFranjas]);

  // Reintentar carga si estaba offline y se recuperó conexión
  useEffect(() => {
    if (online && franjas.length === 0 && !loading) {
      loadFranjas();
    }
  }, [online]);

  // Intervalo: actualiza hora + cierre automático de franjas vencidas
  useEffect(() => {
    const interval = setInterval(() => {
      const ahora = new Date();
      setHora(ahora);
      franjas.forEach((franja) => {
        const id = franja.id_franja;
        if (cerradasAuto.current.has(id)) return;
        if (franja.estado === 'pendiente' || franja.estado === 'activa') {
          const fin = new Date(franja.fin);
          if (ahora >= fin) {
            cerradasAuto.current.add(id);
            setAutoClosing(true);
            franjaService.cerrar(id)
              .then(() => loadFranjas())
              .catch(() => offlineStorage.addFranjaPendiente({ franjaId: id, accion: 'cerrar' }))
              .finally(() => setAutoClosing(false));
          }
        }
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [franjas, loadFranjas]);

  const getEstadoFranja = (franja) => {
    const ahora = new Date();
    const inicio = new Date(franja.inicio);
    const fin = new Date(franja.fin);

    if (franja.estado === 'completada') return 'completada';
    if (franja.estado === 'omitida') return 'omitida';
    if (ahora >= inicio && ahora < fin) return 'activa';
    if (ahora < inicio) return 'futura';
    return 'pasada';
  };

  const horaStr = hora.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const fechaStr = hora.toLocaleDateString('es-PE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const esFormato1 = formato === '1';

  const handleIniciar = (franja) => {
    if (esFormato1) {
      navigate(`/aforador/validar/${franja.id_franja}?formato=1`);
    } else {
      navigate(`/aforador/validar/${franja.id_franja}?formato=2`);
    }
  };

  const handleOmitClick = (franja) => {
    setOmitFranjaId(franja.id_franja);
    setOmitMotivo('break');
    setOmitDialogOpen(true);
  };

  const handleConfirmOmit = async () => {
    try {
      await franjaService.omitir(omitFranjaId, omitMotivo);
    } catch {
      await offlineStorage.addFranjaPendiente({ franjaId: omitFranjaId, accion: 'omitir', motivo: omitMotivo });
    }
    setOmitDialogOpen(false);
    setOmitFranjaId(null);
    loadFranjas();
  };

  const calcularProgreso = (inicio, fin) => {
    const ahora = hora.getTime();
    const start = new Date(inicio).getTime();
    const end = new Date(fin).getTime();
    if (ahora < start) return 0;
    if (ahora >= end) return 100;
    return ((ahora - start) / (end - start)) * 100;
  };

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

        <Box sx={{ position: 'relative', zIndex: 1, maxWidth: 640, mx: 'auto', px: 2, pt: 3, pb: 3 }}>
          {/* Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <Button
              onClick={() => navigate('/aforador/menu')}
              sx={{ color: 'rgba(255,255,255,0.8)', minWidth: 0, p: 0.5, '&:hover': { color: '#FFFFFF' } }}
            >
              <BackIcon />
            </Button>
            <Typography sx={{ flex: 1, fontSize: 18, fontWeight: 600, color: '#FFFFFF' }}>
              {esFormato1 ? 'Conteo Vehicular' : 'Paradas y Colas'}
            </Typography>
            <Box data-tour="franjas-timer" sx={{ textAlign: 'right' }}>
              <Typography sx={{ fontSize: 14, fontWeight: 700, color: '#FFFFFF' }}>
                {horaStr}
              </Typography>
              <Typography sx={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', textTransform: 'capitalize' }}>
                {fechaStr}
              </Typography>
            </Box>
          </Box>

          {/* Info del usuario */}
          <Card sx={{ mb: '20px', borderRadius: '16px', boxShadow: '0px 5px 15px rgba(0,0,0,.1)' }}>
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Avatar sx={{ bgcolor: '#0D5BFF', width: 36, height: 36 }}>
                  {esFormato1 ? <CarIcon sx={{ fontSize: 20 }} /> : <StopIcon sx={{ fontSize: 20 }} />}
                </Avatar>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography sx={{ fontSize: 14, fontWeight: 600, color: '#0A2A66' }} noWrap>
                    {usuario?.nombres} {usuario?.apellidos}
                  </Typography>
                  <Typography sx={{ fontSize: 12, color: '#666666' }}>
                    {esFormato1 ? 'Franjas - Conteo Vehicular' : 'Franjas - Paradas y Colas'}
                  </Typography>
                </Box>
                {autoClosing && (
                  <Typography sx={{ fontSize: 11, color: '#0D5BFF', fontWeight: 500 }}>
                    Cerrando...
                  </Typography>
                )}
              </Box>

              {/* Punto de aforo y sentido */}
              {puntoInfo && (
                <Box sx={{ display: 'flex', gap: 2.5, flexWrap: 'wrap', mt: 1, pt: 1, borderTop: '1px solid #E5E7EB' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <LocationIcon sx={{ fontSize: 14, color: '#666' }} />
                    <Typography sx={{ fontSize: 12, color: '#666', fontWeight: 500 }}>
                      Punto:
                    </Typography>
                    <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#0A2A66' }}>
                      {puntoInfo.puntoAforo?.nombre_punto || '—'}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <SentidoIcon sx={{ fontSize: 14, color: '#666' }} />
                    <Typography sx={{ fontSize: 12, color: '#666', fontWeight: 500 }}>
                      Sentido:
                    </Typography>
                    <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#0A2A66' }}>
                      {puntoInfo.sentido || '—'}
                    </Typography>
                  </Box>
                </Box>
              )}
            </CardContent>
          </Card>

          {loading ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography sx={{ color: 'rgba(255,255,255,0.8)' }}>Cargando franjas...</Typography>
            </Box>
          ) : franjas.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 2 }}>
              <Alert severity="info" sx={{ borderRadius: '16px', mb: 2 }}>No hay franjas generadas para este turno.</Alert>
              {!online && (
                <Typography sx={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', mb: 1 }}>
                  Sin conexión — los datos se cargarán automáticamente al recuperar la red.
                </Typography>
              )}
              <Button variant="outlined" onClick={loadFranjas}
                sx={{ color: '#FFF', borderColor: 'rgba(255,255,255,0.3)', borderRadius: '10px', '&:hover': { borderColor: '#FFF' } }}>
                Reintentar
              </Button>
            </Box>
          ) : (
            <Grid container spacing={1.5} data-tour="franjas-list">
              {franjas.map((franja) => {
                const estado = getEstadoFranja(franja);
                const isActiva = estado === 'activa';
                const inicio = new Date(franja.inicio);
                const fin = new Date(franja.fin);
                const progreso = calcularProgreso(franja.inicio, franja.fin);
                const isCompletada = estado === 'completada';
                const isOmitida = estado === 'omitida';
                const isFutura = estado === 'futura';
                const isPasada = estado === 'pasada';

                const cardColors = {
                  completada: { bg: '#059669', label: 'COMPLETADA' },
                  omitida: { bg: '#6B7280', label: 'OMITIDA' },
                  activa: { bg: '#0D5BFF', label: 'ACTIVA' },
                  futura: { bg: '#F3F4F6', label: 'FUTURA', textColor: '#9CA3AF' },
                  pasada: { bg: '#E5E7EB', label: 'PASADA', textColor: '#9CA3AF' },
                };
                const colors = cardColors[estado];

                return (
                  <Grid size={{ xs: 6, sm: 4, md: 3 }} key={franja.id_franja}>
                    <Card sx={{
                      borderRadius: '16px',
                      bgcolor: colors.bg,
                      opacity: isFutura || isPasada ? 0.5 : 1,
                      boxShadow: isActiva ? '0 8px 25px rgba(13,91,255,.35)' : '0 2px 8px rgba(0,0,0,.08)',
                      transition: 'all 0.2s ease',
                      position: 'relative', overflow: 'hidden',
                    }}>
                      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                        {/* Progreso para activa */}
                        {isActiva && (
                          <LinearProgress
                            variant="determinate"
                            value={progreso}
                            sx={{
                              position: 'absolute', top: 0, left: 0, right: 0, height: 3,
                              bgcolor: 'rgba(255,255,255,0.2)',
                              '& .MuiLinearProgress-bar': { bgcolor: 'rgba(255,255,255,0.7)' },
                            }}
                          />
                        )}

                        {/* Hora */}
                        <Typography sx={{
                          fontSize: 16, fontWeight: 700,
                          color: isFutura || isPasada ? '#9CA3AF' : '#FFFFFF',
                          lineHeight: 1.2,
                        }}>
                          {inicio.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}
                        </Typography>
                        <Typography sx={{
                          fontSize: 12,
                          color: isFutura || isPasada ? '#9CA3AF' : 'rgba(255,255,255,0.7)',
                        }}>
                          {fin.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}
                        </Typography>

                        {/* Estado */}
                        <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          {isCompletada && <CheckIcon sx={{ fontSize: 16, color: '#FFFFFF' }} />}
                          {isOmitida && <BlockIcon sx={{ fontSize: 16, color: '#FFFFFF' }} />}
                          {isActiva && <ScheduleIcon sx={{ fontSize: 16, color: '#FFFFFF' }} />}
                          <Typography sx={{
                            fontSize: 11, fontWeight: 600,
                            color: isFutura || isPasada ? '#9CA3AF' : '#FFFFFF',
                          }}>
                            {colors.label}
                          </Typography>
                        </Box>

                        {/* Botones activa */}
                        {isActiva && (
                          <Box sx={{ mt: 1.5, display: 'flex', gap: 0.5 }}>
                            <Button
                              size="small"
                              sx={{
                                flex: 1, fontSize: 11, fontWeight: 700, py: 0.6,
                                bgcolor: '#FFFFFF', color: '#0D5BFF', borderRadius: '8px',
                                '&:hover': { bgcolor: '#F0F4FF' },
                              }}
                              startIcon={<PlayIcon sx={{ fontSize: 14 }} />}
                              onClick={() => handleIniciar(franja)}
                            >
                              Iniciar
                            </Button>
                            <Button
                              size="small"
                              sx={{
                                flex: 1, fontSize: 11, fontWeight: 600, py: 0.6,
                                bgcolor: 'rgba(255,255,255,0.15)', color: '#FFFFFF', borderRadius: '8px',
                                '&:hover': { bgcolor: 'rgba(255,255,255,0.25)' },
                              }}
                              startIcon={<CancelIcon sx={{ fontSize: 14 }} />}
                              onClick={() => handleOmitClick(franja)}
                            >
                              Omitir
                            </Button>
                          </Box>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          )}

          {autoClosing && (
            <Alert severity="info" sx={{ mt: 2, borderRadius: '16px' }}>
              Cerrando franjas vencidas automáticamente...
            </Alert>
          )}

          {/* Dialog omitir */}
          <Dialog open={omitDialogOpen} onClose={() => setOmitDialogOpen(false)} maxWidth="xs" fullWidth>
            <DialogTitle sx={{ fontWeight: 700, color: '#0A2A66' }}>Omitir franja</DialogTitle>
            <DialogContent>
              <Typography sx={{ fontSize: 14, color: '#666666', mb: 1 }}>
                Seleccione el motivo:
              </Typography>
              <RadioGroup value={omitMotivo} onChange={(e) => setOmitMotivo(e.target.value)}>
                <FormControlLabel value="break" control={<Radio />} label="Break" />
                <FormControlLabel value="almuerzo" control={<Radio />} label="Almuerzo" />
                <FormControlLabel value="pausa tecnica" control={<Radio />} label="Pausa técnica" />
              </RadioGroup>
            </DialogContent>
            <DialogActions sx={{ p: 2, pt: 0 }}>
              <Button onClick={() => setOmitDialogOpen(false)} sx={{ color: '#666666' }}>Cancelar</Button>
              <Button variant="contained" onClick={handleConfirmOmit} sx={{ borderRadius: '8px', bgcolor: '#6B7280', '&:hover': { bgcolor: '#4B5563' } }}>
                CONFIRMAR OMISIÓN
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      </Box>
      <HelpButton steps={tours.aforador.franjas} />
    </AforadorLayout>
  );
}
