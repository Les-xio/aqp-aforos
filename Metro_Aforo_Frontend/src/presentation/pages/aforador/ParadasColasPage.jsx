import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box, Typography, Tabs, Tab, Button, Card, CardContent, TextField,
  MenuItem, Grid, Alert, IconButton, Avatar, LinearProgress,
} from '@mui/material';
import {
  ArrowBack as BackIcon, Save as SaveIcon,
  Timer as TimerIcon, Person as PersonIcon,
  LocationOn as LocationIcon, SwapHoriz as SentidoIcon,
  Close as CloseIcon, Stop as StopIcon,
  DirectionsBus as BusIcon,
} from '@mui/icons-material';
import { HelpButton } from '../../components/tours/HelpButton';
import { tours } from '../../components/tours/tourConfig';
import { AforadorLayout } from '../../components/aforador/AforadorLayout';
import { useAuth } from '../../../application/hooks/useAuth';
import { useTurno } from '../../../application/hooks/useTurno';
import { turnoService } from '../../../application/services/turnoService';
import { vehiculoService } from '../../../application/services/vehiculoService';
import { paradaService } from '../../../application/services/paradaService';
import { franjaService } from '../../../application/services/franjaService';
import { offlineStorage } from '../../../infrastructure/storage/offlineStorage';

export function ParadasColasPage() {
  const { franjaId } = useParams();
  const navigate = useNavigate();
  const { usuario } = useAuth();
  const { turnoActivo } = useTurno();
  const [franja, setFranja] = useState(null);
  const [puntoInfo, setPuntoInfo] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [vehiculos, setVehiculos] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [segundosRestantes, setSegundosRestantes] = useState(0);
  const [tiempoTotal, setTiempoTotal] = useState(0);
  const autoCerrado = useRef(false);

  const [selectedVehiculo, setSelectedVehiculo] = useState('');
  const [suben, setSuben] = useState('');
  const [bajan, setBajan] = useState('');
  const [insatisfechos, setInsatisfechos] = useState('');

  const [colaCantidad, setColaCantidad] = useState('');
  const [colaObs, setColaObs] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const [vehRes, franjaRes] = await Promise.all([
          vehiculoService.listar(),
          franjaService.getById(franjaId),
        ]);
        setVehiculos(vehRes.data || []);
        setFranja(franjaRes.data);
      } catch {
        setError('Error al cargar datos');
      }
    };
    load();
  }, [franjaId]);

  useEffect(() => {
    if (!turnoActivo) { setPuntoInfo(null); return; }
    turnoService.getPuntos(turnoActivo.id_turno)
      .then(res => {
        if (res.data?.length > 0) setPuntoInfo(res.data[0]);
      })
      .catch(() => setPuntoInfo(null));
  }, [turnoActivo]);

  useEffect(() => {
    if (!franja?.inicio) return;
    const duracionMs = 15 * 60 * 1000;
    const fin = new Date(new Date(franja.inicio).getTime() + duracionMs);
    const totalSeg = Math.floor(duracionMs / 1000);
    setTiempoTotal(totalSeg);

    const actualizar = () => {
      const ahora = new Date();
      const diff = Math.max(0, Math.floor((fin - ahora) / 1000));
      setSegundosRestantes(diff);
    };
    actualizar();
    const interval = setInterval(actualizar, 1000);
    return () => clearInterval(interval);
  }, [franja?.inicio]);

  useEffect(() => {
    window.history.pushState(null, '', window.location.href);
    const handlePop = () => window.history.pushState(null, '', window.location.href);
    window.addEventListener('popstate', handlePop);
    return () => window.removeEventListener('popstate', handlePop);
  }, []);

  const handleGuardarParada = async () => {
    if (!selectedVehiculo) {
      setError('Seleccione un tipo de vehículo');
      return;
    }
    try {
      setError('');
      const payload = {
        franjaId: Number(franjaId),
        vehiculoId: Number(selectedVehiculo),
        suben: Math.max(0, Number(suben) || 0),
        bajan: Math.max(0, Number(bajan) || 0),
        insatisfechos: Math.max(0, Number(insatisfechos) || 0),
      };
      await paradaService.registrarSubidasBajadas(payload);
      setSuccess('Conteo de parada registrado');
      setSuben('');
      setBajan('');
      setInsatisfechos('');
      setSelectedVehiculo('');
    } catch (err) {
      offlineStorage.addParadaPendiente(payload);
      setSuccess('Guardado localmente (sin conexión)');
      setSuben('');
      setBajan('');
      setInsatisfechos('');
      setSelectedVehiculo('');
    }
  };

  const handleGuardarCola = async () => {
    if (colaCantidad === '' || Number(colaCantidad) < 0) {
      setError('Ingrese un número válido de vehículos en cola');
      return;
    }
    try {
      setError('');
      await paradaService.registrarColaVehicular({
        franjaId: Number(franjaId),
        cantidadCola: Math.max(0, Number(colaCantidad) || 0),
        observaciones: colaObs || null,
      });
      setSuccess('Cola vehicular registrada');
      setColaCantidad('');
      setColaObs('');
    } catch (err) {
      offlineStorage.addColaPendiente({
        franjaId: Number(franjaId),
        cantidadCola: Number(colaCantidad),
        observaciones: colaObs || null,
      });
      setSuccess('Guardado localmente (sin conexión)');
    }
  };

  const handleCerrarFranja = async () => {
    try {
      setError('');
      await franjaService.cerrar(franjaId);
    } catch {
      await offlineStorage.addFranjaPendiente({ franjaId, accion: 'cerrar' });
    }
    setSuccess('Franja completada');
    setTimeout(() => navigate('/aforador/franjas/2'), 1500);
  };

  const puntoAforoNombre = puntoInfo?.puntoAforo?.nombre_punto || null;
  const sentido = puntoInfo?.sentido || null;
  const minutos = Math.floor(segundosRestantes / 60);
  const segundos = segundosRestantes % 60;
  const tiempoFormato = `${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}`;

  let timerColor = '#FFFFFF';
  if (segundosRestantes < 60) timerColor = '#E53935';
  else if (segundosRestantes < 180) timerColor = '#FF9800';

  const progreso = tiempoTotal > 0 ? ((tiempoTotal - segundosRestantes) / tiempoTotal) * 100 : 0;

  const ocVehiculos = vehiculos.filter(v =>
    v.tipo?.toLowerCase().includes('combi') || v.tipo?.toLowerCase().includes('bus')
  );

  if (!franja) {
    return (
      <AforadorLayout>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <Typography sx={{ fontSize: 16, color: '#666' }}>Cargando...</Typography>
        </Box>
      </AforadorLayout>
    );
  }

  return (
    <AforadorLayout>
      <Box sx={{ bgcolor: '#F5F7FA', minHeight: '100vh', pb: 3 }}>
        {/* ── HEADER ── */}
        <Box data-tour="paradas-header" sx={{
          background: 'linear-gradient(90deg, #003DA5, #0D5BFF)',
          px: 2, py: 1.5,
          display: 'flex', alignItems: 'center', gap: 1.5,
          boxShadow: '0 4px 20px rgba(13,91,255,.25)',
          position: 'sticky', top: 0, zIndex: 100,
          '@media (max-width:600px)': { px: 1.5, py: 1 },
        }}>
          <IconButton
            size="small"
            sx={{ color: 'rgba(255,255,255,0.3)', p: 0.5, cursor: 'default' }}
          >
            <BackIcon sx={{ fontSize: 24 }} />
          </IconButton>
          <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 38, height: 38 }}>
            <StopIcon sx={{ fontSize: 22, color: '#FFFFFF' }} />
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography sx={{ fontSize: 15, fontWeight: 700, color: '#FFFFFF', lineHeight: 1.2 }}>
              Paradas y Colas
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <PersonIcon sx={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }} />
              <Typography sx={{ fontSize: 11, color: 'rgba(255,255,255,0.7)' }}>
                {usuario?.nombres} {usuario?.apellidos}
              </Typography>
              <Box sx={{
                width: 6, height: 6, borderRadius: '50%', bgcolor: '#4CAF50', ml: 0.5,
                boxShadow: '0 0 6px rgba(76,175,80,.6)',
              }} />
              <Typography sx={{ fontSize: 10, color: '#4CAF50', fontWeight: 600 }}>En línea</Typography>
            </Box>
          </Box>
          <Button
            variant="contained"
            size="small"
            onClick={handleCerrarFranja}
            sx={{
              bgcolor: '#DC2626', color: '#FFFFFF', fontWeight: 700, fontSize: 12,
              borderRadius: '10px', py: 0.8, px: 1.5,
              '&:hover': { bgcolor: '#B91C1C' },
              boxShadow: '0 4px 12px rgba(220,38,38,.35)',
              '&:active': { transform: 'scale(0.96)' },
              transition: 'all 0.15s ease',
            }}
            startIcon={<CloseIcon sx={{ fontSize: 16 }} />}
          >
            Cerrar
          </Button>
        </Box>

        <Box sx={{ maxWidth: 680, mx: 'auto', px: 2, mt: 2 }}>
          {/* ── ERROR / SUCCESS ── */}
          {error && (
            <Alert severity="error" sx={{ mb: 1.5, borderRadius: '12px', fontSize: 13 }}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert severity="success" sx={{ mb: 1.5, borderRadius: '12px', fontSize: 13 }} onClose={() => setSuccess('')}>
              {success}
            </Alert>
          )}

          {/* ── TURN INFO CARD ── */}
          <Card sx={{
            borderRadius: '20px',
            background: 'linear-gradient(135deg, #0D5BFF 0%, #0052CC 100%)',
            color: '#FFFFFF',
            boxShadow: '0 8px 24px rgba(13,91,255,.25)',
            mb: 2,
          }}>
            <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
              <Grid container spacing={2} alignItems="center">
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography sx={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.7)', mb: 0.5, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Tiempo restante
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
                    <TimerIcon sx={{ fontSize: 28, color: timerColor }} />
                    <Typography sx={{
                      fontSize: 42, fontWeight: 700, fontFamily: "'Inter', 'Segoe UI', monospace",
                      color: timerColor, lineHeight: 1,
                      textShadow: timerColor === '#E53935' ? '0 0 20px rgba(229,57,53,.4)' : 'none',
                      transition: 'color 0.3s ease',
                    }}>
                      {tiempoFormato}
                    </Typography>
                  </Box>
                  <Box sx={{ mt: 1 }}>
                    <LinearProgress
                      variant="determinate"
                      value={progreso}
                      sx={{
                        height: 4, borderRadius: 2,
                        bgcolor: 'rgba(255,255,255,0.15)',
                        '& .MuiLinearProgress-bar': {
                          bgcolor: segundosRestantes < 60 ? '#E53935' : segundosRestantes < 180 ? '#FF9800' : '#4CAF50',
                          transition: 'width 1s linear',
                        },
                      }}
                    />
                  </Box>
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <Typography sx={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.7)', mb: 0.5, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Franja
                  </Typography>
                  <Typography sx={{ fontSize: 15, fontWeight: 600 }}>
                    {new Date(franja.inicio).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}
                    {' — '}
                    {new Date(franja.fin).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <Typography sx={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.7)', mb: 0.5, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Estado
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#4CAF50', animation: 'pulse 2s infinite' }} />
                    <Typography sx={{ fontSize: 15, fontWeight: 600 }}>Activa</Typography>
                  </Box>
                </Grid>
              </Grid>

              {/* Punto de aforo y sentido */}
              <Box sx={{
                mt: 1.5, pt: 1.5,
                borderTop: '1px solid rgba(255,255,255,0.15)',
                display: 'flex', gap: 3, flexWrap: 'wrap',
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                  <LocationIcon sx={{ fontSize: 16, color: 'rgba(255,255,255,0.7)' }} />
                  <Typography sx={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>
                    Punto:
                  </Typography>
                  <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#FFFFFF' }}>
                    {puntoAforoNombre || '—'}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                  <SentidoIcon sx={{ fontSize: 16, color: 'rgba(255,255,255,0.7)' }} />
                  <Typography sx={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>
                    Sentido:
                  </Typography>
                  <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#FFFFFF' }}>
                    {sentido || '—'}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* ── TABS ── */}
          <Tabs data-tour="paradas-tabs" value={tabValue} onChange={(e, v) => setTabValue(v)} variant="fullWidth" sx={{
            mb: 2,
            '& .MuiTab-root': { fontWeight: 700, fontSize: 13, textTransform: 'none', py: 1.5 },
            '& .Mui-selected': { color: '#0D5BFF !important' },
            '& .MuiTabs-indicator': { bgcolor: '#0D5BFF' },
          }}>
            <Tab icon={<BusIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Subidas y Bajadas" />
            <Tab label="Cola en Semáforo" />
          </Tabs>

          {tabValue === 0 && (
            <Card data-tour="paradas-form" sx={{ borderRadius: '16px', boxShadow: '0 2px 12px rgba(0,0,0,.06)' }}>
              <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
                <Typography sx={{ fontSize: 15, fontWeight: 700, color: '#0A2A66', mb: 2 }}>
                  Registro de Subidas y Bajadas de Pasajeros
                </Typography>
                <TextField
                  select
                  fullWidth
                  label="Tipo de vehículo"
                  value={selectedVehiculo}
                  onChange={(e) => setSelectedVehiculo(e.target.value)}
                  margin="normal"
                >
                  <MenuItem value="">-- Seleccione --</MenuItem>
                  {ocVehiculos.map((v) => (
                    <MenuItem key={v.id_vehiculo} value={v.id_vehiculo}>{v.tipo}</MenuItem>
                  ))}
                </TextField>
                <Grid container spacing={1.5} sx={{ mt: 0.5 }}>
                  <Grid size={{ xs: 4 }}>
                    <TextField fullWidth label="Suben" type="number" value={suben} onChange={(e) => { const v = e.target.value; if (v === '' || (Number(v) >= 0 && !isNaN(Number(v)))) setSuben(v); }} slotProps={{ htmlInput: { min: 0 } }} placeholder="0" />
                  </Grid>
                  <Grid size={{ xs: 4 }}>
                    <TextField fullWidth label="Bajan" type="number" value={bajan} onChange={(e) => { const v = e.target.value; if (v === '' || (Number(v) >= 0 && !isNaN(Number(v)))) setBajan(v); }} slotProps={{ htmlInput: { min: 0 } }} placeholder="0" />
                  </Grid>
                  <Grid size={{ xs: 4 }}>
                    <TextField fullWidth label="Insatisfechos" type="number" value={insatisfechos} onChange={(e) => { const v = e.target.value; if (v === '' || (Number(v) >= 0 && !isNaN(Number(v)))) setInsatisfechos(v); }} slotProps={{ htmlInput: { min: 0 } }} placeholder="0" />
                  </Grid>
                </Grid>
                <Button
                  variant="contained"
                  size="large"
                  fullWidth
                  startIcon={<SaveIcon />}
                  onClick={handleGuardarParada}
                  sx={{
                    mt: 2.5, py: 1.5, borderRadius: '14px', fontWeight: 700, fontSize: 14,
                    background: 'linear-gradient(90deg, #0D5BFF, #0052CC)',
                    boxShadow: '0 6px 16px rgba(13,91,255,.3)',
                    '&:hover': { transform: 'translateY(-1px)', boxShadow: '0 8px 20px rgba(13,91,255,.4)' },
                    transition: 'all 0.2s ease',
                  }}
                >
                  GUARDAR CONTEO DE PARADA
                </Button>
              </CardContent>
            </Card>
          )}

          {tabValue === 1 && (
            <Card data-tour="paradas-cola" sx={{ borderRadius: '16px', boxShadow: '0 2px 12px rgba(0,0,0,.06)' }}>
              <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
                <Typography sx={{ fontSize: 15, fontWeight: 700, color: '#0A2A66', mb: 2 }}>
                  N° de vehículos en cola
                </Typography>
                <TextField
                  fullWidth
                  type="number"
                  value={colaCantidad}
                  onChange={(e) => { const v = e.target.value; if (v === '' || (Number(v) >= 0 && !isNaN(Number(v)))) setColaCantidad(v); }}
                  slotProps={{ htmlInput: { min: 0 } }}
                  margin="normal"
                  placeholder="0"
                />
                <TextField
                  fullWidth
                  label="Observaciones (opcional)"
                  value={colaObs}
                  onChange={(e) => setColaObs(e.target.value)}
                  margin="normal"
                  multiline
                  rows={2}
                />
                <Button
                  variant="contained"
                  size="large"
                  fullWidth
                  startIcon={<SaveIcon />}
                  onClick={handleGuardarCola}
                  sx={{
                    mt: 2.5, py: 1.5, borderRadius: '14px', fontWeight: 700, fontSize: 14,
                    background: 'linear-gradient(90deg, #0D5BFF, #0052CC)',
                    boxShadow: '0 6px 16px rgba(13,91,255,.3)',
                    '&:hover': { transform: 'translateY(-1px)', boxShadow: '0 8px 20px rgba(13,91,255,.4)' },
                    transition: 'all 0.2s ease',
                  }}
                >
                  GUARDAR COLA
                </Button>
              </CardContent>
            </Card>
          )}
        </Box>
      </Box>
      <HelpButton steps={tours.aforador.paradas} />
    </AforadorLayout>
  );
}