import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box, Typography, Button, Grid, Chip, Alert, IconButton, Card, CardContent, Dialog, DialogTitle, DialogContent, DialogActions,
} from '@mui/material';
import {
  Add as AddIcon, Remove as RemoveIcon, Close as CloseIcon,
  ArrowBack as BackIcon, CheckCircle as CheckIcon,
} from '@mui/icons-material';
import { AforadorLayout } from '../../components/aforador/AforadorLayout';
import { Cronometro } from '../../components/aforador/Cronometro';
import { vehiculoService } from '../../../application/services/vehiculoService';
import { conteoService } from '../../../application/services/conteoService';
import { franjaService } from '../../../application/services/franjaService';
import { offlineStorage } from '../../../infrastructure/storage/offlineStorage';
import { NIVELES_OCUPACION } from '../../../domain/constants';

export function ConteoVehicularPage() {
  const { franjaId } = useParams();
  const navigate = useNavigate();
  const [vehiculos, setVehiculos] = useState([]);
  const [franja, setFranja] = useState(null);
  const [conteos, setConteos] = useState({});
  const [ocupaciones, setOcupaciones] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [openOcupacion, setOpenOcupacion] = useState(null);
  const [lastTap, setLastTap] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [vehRes, franjaRes] = await Promise.all([
          vehiculoService.listar(),
          franjaService.getById(franjaId),
        ]);
        setVehiculos(vehRes.data || []);
        setFranja(franjaRes.data);
      } catch (err) {
        setError('Error al cargar datos');
      }
    };
    load();
  }, [franjaId]);

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
      setLastTap({ vehiculo, accion });
      setTimeout(() => setLastTap(null), 1000);
    } catch {
      offlineStorage.addConteoPendiente(payload);
    }
  }, [franjaId]);

  const registrarOcupacion = async (vehiculo, nivel) => {
    const key = `oc_${vehiculo.id_vehiculo}`;
    setOcupaciones((prev) => ({
      ...prev,
      [key]: nivel,
    }));
    setOpenOcupacion(null);

    const payload = {
      franjaId: Number(franjaId),
      vehiculoId: vehiculo.id_vehiculo,
      ocupacion: nivel,
      cantidad: 1,
    };

    try {
      await conteoService.registrarOcupacion(payload);
    } catch {
      offlineStorage.addOcupacionPendiente(payload);
    }
  };

  const handleCerrarFranja = async () => {
    try {
      setError('');
      await franjaService.cerrar(franjaId);
      setSuccess('Franja completada exitosamente');
      setTimeout(() => {
        navigate('/aforador/franjas/1');
      }, 1500);
    } catch (err) {
      setError(err.message || 'Error al cerrar franja');
    }
  };

  if (!franja) return <AforadorLayout><Typography>Cargando...</Typography></AforadorLayout>;

  return (
    <AforadorLayout>
      <Box sx={{ maxWidth: 600, mx: 'auto' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <IconButton size="small" onClick={() => navigate('/aforador/franjas/1')}>
            <BackIcon />
          </IconButton>
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle2" fontWeight={600}>
              Conteo Vehicular
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {new Date(franja.inicio).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })} - {new Date(franja.fin).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}
            </Typography>
          </Box>
          <Button variant="outlined" color="error" size="small" onClick={handleCerrarFranja}>
            Cerrar Franja
          </Button>
        </Box>

        {franja.inicio && <Cronometro inicio={franja.inicio} duracionMin={15} />}

        {error && <Alert severity="error" sx={{ mb: 1 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 1 }}>{success}</Alert>}
        {lastTap && (
          <Alert severity="success" sx={{ mb: 1 }} icon={<CheckIcon fontSize="inherit" />}>
            {lastTap.accion === '+1' ? 'Registrado' : 'Corregido'}: {lastTap.vehiculo.tipo}
          </Alert>
        )}

        <Typography variant="subtitle2" fontWeight={600} gutterBottom sx={{ mt: 1 }}>
          Conteo por tipo de vehículo
        </Typography>

        <Grid container spacing={1}>
          {vehiculos.map((v) => (
            <Grid item xs={6} key={v.id_vehiculo}>
              <Card sx={{ textAlign: 'center', bgcolor: '#f5f5f5' }}>
                <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                  <Typography variant="body2" fontWeight={600}>{v.tipo}</Typography>
                  <Typography variant="h4" fontWeight={700} color="primary.main">
                    {conteos[v.id_vehiculo] || 0}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                    <Button
                      variant="contained"
                      color="primary"
                      size="small"
                      fullWidth
                      startIcon={<AddIcon />}
                      onClick={() => registrarConteo(v, '+1')}
                      sx={{ py: 1.5 }}
                    >
                      +1
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      startIcon={<RemoveIcon />}
                      onClick={() => registrarConteo(v, '-1')}
                      disabled={!conteos[v.id_vehiculo]}
                      sx={{ py: 1.5, minWidth: 40 }}
                    >
                      -1
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Ocupación para M2 y M3 */}
        <Typography variant="subtitle2" fontWeight={600} gutterBottom sx={{ mt: 2 }}>
          Nivel de Ocupación
        </Typography>

        <Grid container spacing={1}>
          {vehiculos.filter(v => v.tipo?.toLowerCase().includes('combi') || v.tipo?.toLowerCase().includes('bus')).map((v) => (
            <Grid item xs={6} key={`oc_${v.id_vehiculo}`}>
              <Card
                sx={{ textAlign: 'center', cursor: 'pointer', bgcolor: ocupaciones[`oc_${v.id_vehiculo}`] ? '#e8f5e9' : '#f5f5f5' }}
                onClick={() => setOpenOcupacion(v)}
              >
                <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                  <Typography variant="body2" fontWeight={600}>{v.tipo}</Typography>
                  <Typography variant="h5" fontWeight={700} color="secondary.main" sx={{ textTransform: 'capitalize' }}>
                    {ocupaciones[`oc_${v.id_vehiculo}`] || '---'}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Dialog open={!!openOcupacion} onClose={() => setOpenOcupacion(null)}>
          <DialogTitle>Ocupación - {openOcupacion?.tipo}</DialogTitle>
          <DialogContent>
            <Grid container spacing={1} sx={{ mt: 0.5 }}>
              {NIVELES_OCUPACION.map((nivel) => (
                <Grid item xs={6} key={nivel}>
                  <Button
                    variant="outlined"
                    fullWidth
                    sx={{ py: 2, textTransform: 'capitalize' }}
                    onClick={() => registrarOcupacion(openOcupacion, nivel)}
                  >
                    {nivel}
                  </Button>
                </Grid>
              ))}
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenOcupacion(null)}>Cancelar</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </AforadorLayout>
  );
}
