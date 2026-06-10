import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box, Typography, Button, Grid, Alert, Card, CardContent, Snackbar, Avatar, LinearProgress, IconButton,
} from '@mui/material';
import {
  Add as AddIcon, Remove as RemoveIcon,
  ArrowBack as BackIcon, DirectionsCar as CarIcon,
  Close as CloseIcon, LocalTaxi as TaxiIcon,
  TwoWheeler as MotoIcon, DirectionsBus as BusIcon,
  LocalShipping as CargoIcon, AirportShuttle as CombiIcon,
  Timer as TimerIcon, Person as PersonIcon,
  LocationOn as LocationIcon, SwapHoriz as SentidoIcon,
} from '@mui/icons-material';
import { AforadorLayout } from '../../components/aforador/AforadorLayout';
import { useAuth } from '../../../application/hooks/useAuth';
import { useTurno } from '../../../application/hooks/useTurno';
import { turnoService } from '../../../application/services/turnoService';
import { vehiculoService } from '../../../application/services/vehiculoService';
import { conteoService } from '../../../application/services/conteoService';
import { franjaService } from '../../../application/services/franjaService';
import { offlineStorage } from '../../../infrastructure/storage/offlineStorage';
import { NIVELES_OCUPACION } from '../../../domain/constants';
import { HelpButton } from '../../components/tours/HelpButton';
import { tours } from '../../components/tours/tourConfig';

const VEHICLE_ICONS = {
  auto: <CarIcon sx={{ fontSize: 32 }} />,
  taxi: <TaxiIcon sx={{ fontSize: 32 }} />,
  moto: <MotoIcon sx={{ fontSize: 32 }} />,
  combi: <CombiIcon sx={{ fontSize: 32 }} />,
  bus: <BusIcon sx={{ fontSize: 32 }} />,
  'bus sit': <BusIcon sx={{ fontSize: 32 }} />,
  camioneta: <CargoIcon sx={{ fontSize: 32 }} />,
};

const OCUPACION_COLORS = {
  vacio: { bg: '#E8F5E9', dot: '#4CAF50', text: '#1B5E20' },
  medio: { bg: '#FFF8E1', dot: '#FFC107', text: '#C77800' },
  lleno: { bg: '#FFF3E0', dot: '#FF9800', text: '#E65100' },
  rebosando: { bg: '#FFEBEE', dot: '#E53935', text: '#C62828' },
};

const OCUPACION_HEADERS = {
  bus: { label: 'Bus', color: '#E65100', icon: <BusIcon sx={{ fontSize: 22 }} /> },
  'bus sit': { label: 'Bus SIT', color: '#7B1FA2', icon: <BusIcon sx={{ fontSize: 22 }} /> },
  combi: { label: 'Combi', color: '#0D5BFF', icon: <CombiIcon sx={{ fontSize: 22 }} /> },
};

function ocupacionKey(vehiculoId, nivel) {
  return `oc_${vehiculoId}_${nivel}`;
}

function getVehicleIcon(tipo) {
  const key = tipo?.toLowerCase() || '';
  if (key.includes('auto')) return VEHICLE_ICONS.auto;
  if (key.includes('taxi')) return VEHICLE_ICONS.taxi;
  if (key.includes('moto')) return VEHICLE_ICONS.moto;
  if (key.includes('combi')) return VEHICLE_ICONS.combi;
  if (key.includes('bus')) return VEHICLE_ICONS.bus;
  if (key.includes('camioneta') || key.includes('camión')) return VEHICLE_ICONS.camioneta;
  return <CarIcon sx={{ fontSize: 32 }} />;
}

function sumConteos(conteos) {
  return Object.values(conteos).reduce((a, b) => a + b, 0);
}

export function ConteoVehicularPage() {
  const { franjaId } = useParams();
  const navigate = useNavigate();
  const { usuario } = useAuth();
  const { turnoActivo } = useTurno();
  const [vehiculos, setVehiculos] = useState([]);
  const [franja, setFranja] = useState(null);
  const [puntoInfo, setPuntoInfo] = useState(null);
  const [conteos, setConteos] = useState({});
  const [ocupaciones, setOcupaciones] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [snack, setSnack] = useState(null);
  const [segundosRestantes, setSegundosRestantes] = useState(0);
  const [tiempoTotal, setTiempoTotal] = useState(0);
  const lastTap = useRef(null);
  const prevConteos = useRef(conteos);
  const autoCerrado = useRef(false);
  const prevSegundos = useRef(-1);
  const [conteoAnim, setConteoAnim] = useState({});

  const ocVehiculos = vehiculos.filter(v =>
    v.tipo?.toLowerCase().includes('combi') || v.tipo?.toLowerCase().includes('bus')
  );

  const totalVehiculos = sumConteos(conteos);
  const totalTransporte = sumConteos(
    Object.fromEntries(
      Object.entries(conteos).filter(([id]) => {
        const v = vehiculos.find(x => String(x.id_vehiculo) === String(id));
        return v && ['bus'].some(k => v.tipo?.toLowerCase().includes(k));
      })
    )
  );
  const totalLivianos = sumConteos(
    Object.fromEntries(
      Object.entries(conteos).filter(([id]) => {
        const v = vehiculos.find(x => String(x.id_vehiculo) === String(id));
        if (!v) return false;
        return ['auto', 'taxi', 'moto', 'combi'].some(k => v.tipo?.toLowerCase().includes(k));
      })
    )
  );
  const totalCarga = sumConteos(
    Object.fromEntries(
      Object.entries(conteos).filter(([id]) => {
        const v = vehiculos.find(x => String(x.id_vehiculo) === String(id));
        return v && ['camioneta'].some(k => v.tipo?.toLowerCase().includes(k));
      })
    )
  );
  const totalOcupacion = sumConteos(ocupaciones);

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

  // Auto-cerrar solo cuando el timer pasa de >0 a 0
  useEffect(() => {
    if (prevSegundos.current > 0 && segundosRestantes === 0 && !autoCerrado.current && franja) {
      autoCerrado.current = true;
      const cerrar = async () => {
        try { await franjaService.cerrar(franjaId); } catch {}
        navigate('/aforador/franjas/1');
      };
      cerrar();
    }
    prevSegundos.current = segundosRestantes;
  }, [segundosRestantes, franja, franjaId, navigate]);

  useEffect(() => {
    const entries = Object.entries(conteos);
    const prev = Object.entries(prevConteos.current);
    if (entries.length !== prev.length) {
      prevConteos.current = conteos;
      return;
    }
    for (let i = 0; i < entries.length; i++) {
      const [key, val] = entries[i];
      const prevVal = prevConteos.current[key] || 0;
      if (val !== prevVal) {
        setConteoAnim(prev => ({ ...prev, [key]: Date.now() }));
        break;
      }
    }
    prevConteos.current = conteos;
  }, [conteos]);

  useEffect(() => {
    window.history.pushState(null, '', window.location.href);
    const handlePop = () => window.history.pushState(null, '', window.location.href);
    window.addEventListener('popstate', handlePop);
    return () => window.removeEventListener('popstate', handlePop);
  }, []);

  const registrarConteo = useCallback(async (vehiculo, accion) => {
    const key = vehiculo.id_vehiculo;
    setConteos((prev) => ({
      ...prev,
      [key]: (prev[key] || 0) + (accion === '+1' ? 1 : -1),
    }));

    const payload = {
      franjaId: Number(franjaId),
      vehiculoId: vehiculo.id_vehiculo,
      cantidad: 1,
      accion,
    };

    try {
      await conteoService.registrarVehicular(payload);
      lastTap.current = { tipo: vehiculo.tipo, accion };
      setSnack(`${vehiculo.tipo}: ${accion === '+1' ? 'Registrado' : 'Corregido'}`);
    } catch {
      offlineStorage.addConteoPendiente(payload);
      setSnack('Guardado localmente (sin conexión)');
    }
  }, [franjaId]);

  const registrarOcupacion = useCallback(async (vehiculo, nivel, accion) => {
    const key = ocupacionKey(vehiculo.id_vehiculo, nivel);
    setOcupaciones((prev) => ({
      ...prev,
      [key]: (prev[key] || 0) + (accion === '+1' ? 1 : -1),
    }));

    const payload = {
      franjaId: Number(franjaId),
      vehiculoId: vehiculo.id_vehiculo,
      ocupacion: nivel,
      cantidad: 1,
    };

    try {
      await conteoService.registrarOcupacion(payload);
      setSnack(`${vehiculo.tipo} (${nivel}): Registrado`);
    } catch {
      offlineStorage.addOcupacionPendiente(payload);
      setSnack('Guardado localmente (sin conexión)');
    }
  }, [franjaId]);

  const handleCerrarFranja = async () => {
    try {
      setError('');
      await franjaService.cerrar(franjaId);
    } catch {
      await offlineStorage.addFranjaPendiente({ franjaId, accion: 'cerrar' });
    }
    setSuccess('Franja completada exitosamente');
    setTimeout(() => navigate('/aforador/franjas/1'), 1500);
  };

  const progreso = tiempoTotal > 0 ? ((tiempoTotal - segundosRestantes) / tiempoTotal) * 100 : 0;
  const minutos = Math.floor(segundosRestantes / 60);
  const segundos = segundosRestantes % 60;
  const tiempoFormato = `${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}`;

  let timerColor = '#FFFFFF';
  if (segundosRestantes < 60) timerColor = '#E53935';
  else if (segundosRestantes < 180) timerColor = '#FF9800';

  const puntoAforoNombre = puntoInfo?.puntoAforo?.nombre_punto || null;
  const sentido = puntoInfo?.sentido || null;

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
        <Box data-tour="conteo-header" sx={{
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
            <CarIcon sx={{ fontSize: 22, color: '#FFFFFF' }} />
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography sx={{ fontSize: 15, fontWeight: 700, color: '#FFFFFF', lineHeight: 1.2 }}>
              Conteo Vehicular
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
            <Alert severity="success" sx={{ mb: 1.5, borderRadius: '12px', fontSize: 13 }}>
              {success}
            </Alert>
          )}

          {/* ── TURN INFO CARD ── */}
          <Card data-tour="conteo-timer" sx={{
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

          {/* ── SUMMARY BAR ── */}
          <Card sx={{
            borderRadius: '16px', mb: 2, border: '1px solid #E5E7EB',
            boxShadow: '0 2px 8px rgba(0,0,0,.04)',
          }}>
            <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
              <Grid container spacing={1}>
                <Grid size={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography sx={{ fontSize: 20, fontWeight: 800, color: '#0D5BFF', lineHeight: 1.1 }}>
                      {totalVehiculos}
                    </Typography>
                    <Typography sx={{ fontSize: 10, color: '#666', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.3px' }}>
                      Total veh.
                    </Typography>
                  </Box>
                </Grid>
                <Grid size={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography sx={{ fontSize: 20, fontWeight: 800, color: '#E65100', lineHeight: 1.1 }}>
                      {totalTransporte}
                    </Typography>
                    <Typography sx={{ fontSize: 10, color: '#666', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.3px' }}>
                      Transporte
                    </Typography>
                  </Box>
                </Grid>
                <Grid size={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography sx={{ fontSize: 20, fontWeight: 800, color: '#2E7D32', lineHeight: 1.1 }}>
                      {totalLivianos}
                    </Typography>
                    <Typography sx={{ fontSize: 10, color: '#666', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.3px' }}>
                      Livianos
                    </Typography>
                  </Box>
                </Grid>
                <Grid size={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography sx={{ fontSize: 20, fontWeight: 800, color: '#7B1FA2', lineHeight: 1.1 }}>
                      {totalOcupacion}
                    </Typography>
                    <Typography sx={{ fontSize: 10, color: '#666', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.3px' }}>
                      Ocupación
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* ── CONTEO POR TIPO DE VEHÍCULO ── */}
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5, px: 0.5 }}>
              <Box sx={{ bgcolor: '#0D5BFF', borderRadius: '10px', p: 0.6, display: 'flex', color: '#FFFFFF' }}>
                <CarIcon sx={{ fontSize: 22 }} />
              </Box>
              <Typography sx={{ fontSize: 15, fontWeight: 700, color: '#0A2A66', letterSpacing: '0.3px' }}>
                Conteo por tipo de vehículo
              </Typography>
              <Box sx={{ flex: 1, height: 1, bgcolor: '#E8F0FE' }} />
            </Box>

            <Grid container spacing={1.5} data-tour="conteo-counter">
              {vehiculos.map((v) => {
                const count = conteos[v.id_vehiculo] || 0;
                const animKey = conteoAnim[v.id_vehiculo];
                return (
                  <Grid size={{ xs: 6 }} key={v.id_vehiculo}>
                    <Card sx={{
                      borderRadius: '16px',
                      bgcolor: '#FFFFFF',
                      boxShadow: '0 2px 12px rgba(0,0,0,.06)',
                      border: '1px solid #E5E7EB',
                      transition: 'all 0.15s ease',
                      '&:hover': { boxShadow: '0 4px 16px rgba(0,0,0,.1)' },
                    }}>
                      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 }, textAlign: 'center' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 0.5 }}>
                          <Box sx={{ color: '#0D5BFF', opacity: 0.85 }}>
                            {getVehicleIcon(v.tipo)}
                          </Box>
                        </Box>
                        <Typography sx={{ fontSize: 14, fontWeight: 700, color: '#0A2A66' }}>
                          {v.tipo}
                        </Typography>
                        <Box sx={{ position: 'relative', my: 0.5 }}>
                          <Typography
                            key={`count_${v.id_vehiculo}_${count}_${animKey || ''}`}
                            sx={{
                              fontSize: 40, fontWeight: 800, color: '#0D5BFF',
                              lineHeight: 1.1, fontFamily: "'Inter', 'Segoe UI', monospace",
                              '@keyframes popIn': {
                                '0%': { transform: 'scale(1)' },
                                '40%': { transform: 'scale(1.15)' },
                                '100%': { transform: 'scale(1)' },
                              },
                              animation: 'popIn 0.3s ease',
                            }}
                          >
                            {String(count).padStart(3, '0')}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                          <Button
                            variant="contained"
                            fullWidth
                            onClick={() => registrarConteo(v, '+1')}
                            sx={{
                              py: 1.5, fontSize: 16, fontWeight: 700,
                              bgcolor: '#0D5BFF', borderRadius: '12px',
                              minHeight: 52,
                              boxShadow: '0 4px 12px rgba(13,91,255,.3)',
                              '&:hover': { bgcolor: '#0A4ADF' },
                              '&:active': { transform: 'scale(0.96)' },
                              transition: 'all 0.12s ease',
                            }}
                            startIcon={<AddIcon sx={{ fontSize: 22 }} />}
                          >
                            +1
                          </Button>
                          <Button
                            variant="contained"
                            onClick={() => registrarConteo(v, '-1')}
                            disabled={!count}
                            sx={{
                              py: 1.5, minWidth: 52, fontSize: 16, fontWeight: 700,
                              bgcolor: '#DC2626', borderRadius: '12px',
                              minHeight: 52,
                              boxShadow: '0 4px 12px rgba(220,38,38,.3)',
                              '&:hover': { bgcolor: '#B91C1C' },
                              '&:disabled': { bgcolor: '#E5E7EB', boxShadow: 'none' },
                              '&:active': { transform: 'scale(0.96)' },
                              transition: 'all 0.12s ease',
                            }}
                            startIcon={<RemoveIcon sx={{ fontSize: 22 }} />}
                          >
                            -1
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          </Box>

          {/* ── CONTEO POR NIVEL DE OCUPACIÓN ── */}
          {ocVehiculos.length > 0 && (
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5, px: 0.5 }}>
                <Box sx={{ bgcolor: '#7B1FA2', borderRadius: '10px', p: 0.6, display: 'flex', color: '#FFFFFF' }}>
                  <BusIcon sx={{ fontSize: 22 }} />
                </Box>
                <Typography sx={{ fontSize: 15, fontWeight: 700, color: '#7B1FA2', letterSpacing: '0.3px' }}>
                  Conteo por nivel de ocupación
                </Typography>
                <Box sx={{ flex: 1, height: 1, bgcolor: '#F3E5F5' }} />
              </Box>

              {ocVehiculos.map((v) => {
                const headerKey = Object.keys(OCUPACION_HEADERS)
                  .sort((a, b) => b.length - a.length)
                  .find(k => v.tipo?.toLowerCase().includes(k));
                const header = headerKey ? OCUPACION_HEADERS[headerKey] : null;
                return (
                  <Box key={`oc_${v.id_vehiculo}`} sx={{ mb: 2 }}>
                    {/* Subgroup header */}
                    {header && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, px: 0.5 }}>
                        <Box sx={{ bgcolor: header.color, borderRadius: '8px', p: 0.4, display: 'flex', color: '#FFFFFF' }}>
                          {header.icon}
                        </Box>
                        <Typography sx={{ fontSize: 14, fontWeight: 700, color: header.color }}>
                          {header.label}
                        </Typography>
                        <Box sx={{ flex: 1, height: 1, bgcolor: header.color + '18' }} />
                      </Box>
                    )}

                    <Card sx={{
                      borderRadius: '16px', bgcolor: '#FFFFFF', border: '1px solid #E5E7EB',
                      boxShadow: '0 2px 8px rgba(0,0,0,.04)',
                    }}>
                      <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
                        <Box sx={{ display: 'flex', borderRadius: '16px', overflow: 'hidden' }}>
                          {NIVELES_OCUPACION.map((nivel, idx) => {
                            const key = ocupacionKey(v.id_vehiculo, nivel);
                            const c = OCUPACION_COLORS[nivel] || { bg: '#F5F5F5', dot: '#999', text: '#333' };
                            const val = ocupaciones[key] || 0;
                            return (
                              <Box key={key} sx={{
                                flex: 1, bgcolor: c.bg, p: 1.2, textAlign: 'center',
                                borderRight: idx < NIVELES_OCUPACION.length - 1 ? '1px solid rgba(0,0,0,0.06)' : 'none',
                                transition: 'all 0.15s ease',
                              }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.4, mb: 0.2 }}>
                                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: c.dot, boxShadow: `0 0 6px ${c.dot}60`, flexShrink: 0 }} />
                                  <Typography sx={{ fontSize: 10, fontWeight: 700, color: c.text, textTransform: 'capitalize' }}>
                                    {nivel}
                                  </Typography>
                                </Box>
                                <Typography
                                  key={`oc_${v.id_vehiculo}_${nivel}_${val}`}
                                  sx={{
                                    fontSize: 26, fontWeight: 800, color: c.text,
                                    lineHeight: 1.1, fontFamily: "'Inter', 'Segoe UI', monospace",
                                    '@keyframes popIn': {
                                      '0%': { transform: 'scale(1)' },
                                      '40%': { transform: 'scale(1.15)' },
                                      '100%': { transform: 'scale(1)' },
                                    },
                                    animation: 'popIn 0.25s ease',
                                  }}
                                >
                                  {val}
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 0.3, justifyContent: 'center', mt: 0.3 }}>
                                  <IconButton
                                    size="small"
                                    onClick={() => registrarOcupacion(v, nivel, '+1')}
                                    sx={{
                                      bgcolor: c.dot, color: '#FFFFFF', borderRadius: '6px',
                                      p: 0.3, width: 28, height: 28,
                                      '&:hover': { opacity: 0.85 },
                                      '&:active': { transform: 'scale(0.92)' },
                                      boxShadow: `0 2px 6px ${c.dot}50`,
                                      transition: 'all 0.12s ease',
                                    }}
                                  >
                                    <AddIcon sx={{ fontSize: 16 }} />
                                  </IconButton>
                                  <IconButton
                                    size="small"
                                    onClick={() => registrarOcupacion(v, nivel, '-1')}
                                    disabled={!val}
                                    sx={{
                                      bgcolor: '#FFFFFF', color: c.dot, borderRadius: '6px',
                                      p: 0.3, width: 28, height: 28,
                                      border: '1px solid',
                                      borderColor: val ? c.dot : '#E0E0E0',
                                      '&:hover': { bgcolor: '#F5F5F5' },
                                      '&:disabled': { opacity: 0.3 },
                                      transition: 'all 0.12s ease',
                                    }}
                                  >
                                    <RemoveIcon sx={{ fontSize: 16 }} />
                                  </IconButton>
                                </Box>
                              </Box>
                            );
                          })}
                        </Box>
                      </CardContent>
                    </Card>
                  </Box>
                );
              })}
            </Box>
          )}

          {/* ── TOTAL GENERAL ── */}
          <Box sx={{
            textAlign: 'center', py: 1.5, px: 2,
            bgcolor: '#FFFFFF', borderRadius: '16px',
            border: '1px solid #E5E7EB',
            boxShadow: '0 2px 8px rgba(0,0,0,.04)',
          }}>
            <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#666', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Total vehículos registrados
            </Typography>
            <Typography sx={{
              fontSize: 36, fontWeight: 800, color: '#0D5BFF',
              fontFamily: "'Inter', 'Segoe UI', monospace",
            }}>
              {String(totalVehiculos).padStart(3, '0')}
            </Typography>
            {totalCarga > 0 && (
              <Typography sx={{ fontSize: 12, color: '#666' }}>
                Incluye {totalCarga} vehículo{totalCarga > 1 ? 's' : ''} de carga
              </Typography>
            )}
          </Box>
        </Box>

        <Snackbar
          open={!!snack}
          autoHideDuration={2000}
          onClose={() => setSnack(null)}
          message={snack}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          ContentProps={{
            sx: {
              fontWeight: 600, borderRadius: '12px', fontSize: 14,
              bgcolor: '#0A2A66',
              boxShadow: '0 8px 24px rgba(0,0,0,.2)',
            },
          }}
        />
      </Box>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
      <HelpButton steps={tours.aforador.conteo} />
    </AforadorLayout>
  );
}
