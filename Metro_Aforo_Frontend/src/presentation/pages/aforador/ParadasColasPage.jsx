import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box, Typography, Tabs, Tab, Button, Card, CardContent, TextField,
  MenuItem, Grid, Alert, IconButton, Dialog, DialogTitle, DialogContent, DialogActions,
} from '@mui/material';
import {
  Add as AddIcon, ArrowBack as BackIcon, Save as SaveIcon,
  DirectionsBus as BusIcon,
} from '@mui/icons-material';
import { AforadorLayout } from '../../components/aforador/AforadorLayout';
import { Cronometro } from '../../components/aforador/Cronometro';
import { vehiculoService } from '../../../application/services/vehiculoService';
import { paradaService } from '../../../application/services/paradaService';
import { franjaService } from '../../../application/services/franjaService';
import { offlineStorage } from '../../../infrastructure/storage/offlineStorage';

export function ParadasColasPage() {
  const { franjaId } = useParams();
  const navigate = useNavigate();
  const [franja, setFranja] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [vehiculos, setVehiculos] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [openModal, setOpenModal] = useState(false);
  const [selectedVehiculo, setSelectedVehiculo] = useState('');
  const [suben, setSuben] = useState(0);
  const [bajan, setBajan] = useState(0);
  const [insatisfechos, setInsatisfechos] = useState(0);

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
        suben: Number(suben),
        bajan: Number(bajan),
        insatisfechos: Number(insatisfechos),
      };
      await paradaService.registrarSubidasBajadas(payload);
      setSuccess('Conteo de parada registrado');
      setOpenModal(false);
      setSuben(0);
      setBajan(0);
      setInsatisfechos(0);
      setSelectedVehiculo('');
    } catch (err) {
      offlineStorage.addParadaPendiente({
        franjaId: Number(franjaId),
        vehiculoId: Number(selectedVehiculo),
        suben: Number(suben),
        bajan: Number(bajan),
        insatisfechos: Number(insatisfechos),
      });
      setSuccess('Guardado localmente (sin conexión)');
      setOpenModal(false);
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
        cantidadCola: Number(colaCantidad),
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
      await franjaService.cerrar(franjaId);
      setSuccess('Franja completada');
      setTimeout(() => navigate('/aforador/franjas/2'), 1500);
    } catch (err) {
      setError(err.message || 'Error al cerrar franja');
    }
  };

  if (!franja) return <AforadorLayout><Typography>Cargando...</Typography></AforadorLayout>;

  return (
    <AforadorLayout>
      <Box sx={{ maxWidth: 600, mx: 'auto' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <IconButton size="small" onClick={() => navigate('/aforador/franjas/2')}>
            <BackIcon />
          </IconButton>
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle2" fontWeight={600}>Paradas y Colas</Typography>
          </Box>
          <Button variant="outlined" color="error" size="small" onClick={handleCerrarFranja}>
            Cerrar Franja
          </Button>
        </Box>

        {franja.inicio && <Cronometro inicio={franja.inicio} duracionMin={15} />}

        {error && <Alert severity="error" sx={{ mb: 1 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 1 }} onClose={() => setSuccess('')}>{success}</Alert>}

        <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} variant="fullWidth" sx={{ mb: 2 }}>
          <Tab label="Subidas y Bajadas" />
          <Tab label="Cola en Semáforo" />
        </Tabs>

        {tabValue === 0 && (
          <Box>
            <Button
              variant="contained"
              size="large"
              fullWidth
              startIcon={<AddIcon />}
              onClick={() => setOpenModal(true)}
              sx={{ py: 3, mb: 2, fontSize: '1.1rem' }}
            >
              + REGISTRAR NUEVO CONTEO DE PARADA
            </Button>

            <Button
              variant="outlined"
              size="large"
              fullWidth
              startIcon={<BusIcon />}
              sx={{ py: 2 }}
              onClick={() => {
                const bus = vehiculos.find(v => v.tipo?.toLowerCase().includes('bus'));
                if (bus) {
                  setSelectedVehiculo(bus.id_vehiculo.toString());
                  setOpenModal(true);
                }
              }}
            >
              Bus SIT M3 (Registro rápido)
            </Button>

            <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="sm" fullWidth>
              <DialogTitle>Registrar Conteo de Parada</DialogTitle>
              <DialogContent>
                <TextField
                  select
                  fullWidth
                  label="Tipo de vehículo"
                  value={selectedVehiculo}
                  onChange={(e) => setSelectedVehiculo(e.target.value)}
                  margin="normal"
                >
                  {vehiculos.map((v) => (
                    <MenuItem key={v.id_vehiculo} value={v.id_vehiculo}>{v.tipo}</MenuItem>
                  ))}
                </TextField>
                <Grid container spacing={1} sx={{ mt: 1 }}>
                  <Grid item xs={4}>
                    <TextField fullWidth label="Suben" type="number" value={suben} onChange={(e) => setSuben(e.target.value)} inputProps={{ min: 0 }} />
                  </Grid>
                  <Grid item xs={4}>
                    <TextField fullWidth label="Bajan" type="number" value={bajan} onChange={(e) => setBajan(e.target.value)} inputProps={{ min: 0 }} />
                  </Grid>
                  <Grid item xs={4}>
                    <TextField fullWidth label="Insatisfechos" type="number" value={insatisfechos} onChange={(e) => setInsatisfechos(e.target.value)} inputProps={{ min: 0 }} />
                  </Grid>
                </Grid>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setOpenModal(false)}>Cancelar</Button>
                <Button variant="contained" startIcon={<SaveIcon />} onClick={handleGuardarParada}>
                  GUARDAR CONTEO DE PARADA
                </Button>
              </DialogActions>
            </Dialog>
          </Box>
        )}

        {tabValue === 1 && (
          <Card>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                N° de vehículos en cola
              </Typography>
              <TextField
                fullWidth
                type="number"
                value={colaCantidad}
                onChange={(e) => setColaCantidad(e.target.value)}
                inputProps={{ min: 0 }}
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
                sx={{ mt: 2, py: 1.5 }}
              >
                GUARDAR COLA
              </Button>
            </CardContent>
          </Card>
        )}
      </Box>
    </AforadorLayout>
  );
}
