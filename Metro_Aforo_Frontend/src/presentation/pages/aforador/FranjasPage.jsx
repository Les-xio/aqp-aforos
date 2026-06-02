import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box, Typography, Grid, Card, CardContent, Button, Alert, Chip,
} from '@mui/material';
import {
  CheckCircle as CheckIcon, AccessTime as ClockIcon,
  Block as BlockIcon, ArrowBack as BackIcon,
} from '@mui/icons-material';
import { AforadorLayout } from '../../components/aforador/AforadorLayout';
import { useTurno } from '../../../application/hooks/useTurno';
import { turnoService } from '../../../application/services/turnoService';

export function FranjasPage() {
  const { formato } = useParams();
  const navigate = useNavigate();
  const { turnoActivo, verificarTurnoActivo } = useTurno();
  const [franjas, setFranjas] = useState([]);
  const [hora, setHora] = useState(new Date());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const check = async () => {
      const activo = await verificarTurnoActivo();
      if (!activo) navigate('/aforador/iniciar-turno');
    };
    check();
  }, []);

  useEffect(() => {
    if (!turnoActivo) return;
    const load = async () => {
      try {
        const res = await turnoService.getFranjas(turnoActivo.id_turno);
        setFranjas(res.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [turnoActivo]);

  useEffect(() => {
    const interval = setInterval(() => setHora(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

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

  const estadoColor = {
    completada: 'success.main',
    omitida: 'grey.500',
    activa: 'primary.main',
    futura: 'grey.300',
    pasada: 'grey.400',
  };

  const estadoBg = {
    completada: '#e8f5e9',
    omitida: '#f5f5f5',
    activa: '#e3f2fd',
    futura: '#fafafa',
    pasada: '#eeeeee',
  };

  const horaStr = hora.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  const handleFranjaClick = async (franja) => {
    const estado = getEstadoFranja(franja);
    if (estado !== 'activa') return;

    if (formato === '1') {
      navigate(`/aforador/validar/${franja.id_franja}?formato=1`);
    } else {
      navigate(`/aforador/validar/${franja.id_franja}?formato=2`);
    }
  };

  return (
    <AforadorLayout>
      <Box sx={{ maxWidth: 600, mx: 'auto' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <Button startIcon={<BackIcon />} onClick={() => navigate('/aforador/menu')} size="small">
            Volver
          </Button>
          <Box sx={{ flex: 1 }} />
          <Chip icon={<ClockIcon />} label={horaStr} color="primary" variant="outlined" />
        </Box>

        <Typography variant="h6" gutterBottom fontWeight={600}>
          {formato === '1' ? 'Franjas - Conteo Vehicular' : 'Franjas - Paradas y Colas'}
        </Typography>

        {loading ? (
          <Typography>Cargando franjas...</Typography>
        ) : franjas.length === 0 ? (
          <Alert severity="info">No hay franjas generadas para este turno.</Alert>
        ) : (
          <Grid container spacing={1}>
            {franjas.map((franja) => {
              const estado = getEstadoFranja(franja);
              const isClickable = estado === 'activa';
              const inicio = new Date(franja.inicio);
              const fin = new Date(franja.fin);

              return (
                <Grid item xs={4} sm={3} key={franja.id_franja}>
                  <Card
                    sx={{
                      bgcolor: estadoBg[estado],
                      cursor: isClickable ? 'pointer' : 'default',
                      opacity: estado === 'futura' || estado === 'pasada' ? 0.6 : 1,
                      border: estado === 'activa' ? 2 : 0,
                      borderColor: 'primary.main',
                      transition: 'transform 0.1s',
                      '&:hover': isClickable ? { transform: 'scale(1.05)' } : {},
                    }}
                    onClick={() => handleFranjaClick(franja)}
                  >
                    <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                      <Typography variant="caption" display="block" fontWeight={600}>
                        {inicio.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}
                      </Typography>
                      <Typography variant="caption" display="block" color="text.secondary">
                        {fin.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}
                      </Typography>
                      <Box sx={{ mt: 0.5, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        {estado === 'completada' && <CheckIcon sx={{ fontSize: 16, color: 'success.main' }} />}
                        {estado === 'omitida' && <BlockIcon sx={{ fontSize: 16, color: 'grey.500' }} />}
                        {estado === 'activa' && <ClockIcon sx={{ fontSize: 16, color: 'primary.main' }} />}
                        <Typography variant="caption" color={estadoColor[estado]}>
                          {estado === 'activa' ? 'ACTIVA' : estado.toUpperCase()}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}
      </Box>
    </AforadorLayout>
  );
}
