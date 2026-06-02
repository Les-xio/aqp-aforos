import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Button, Card, CardContent, Alert,
} from '@mui/material';
import { DirectionsCar as CarIcon, Stop as StopIcon } from '@mui/icons-material';
import { AforadorLayout } from '../../components/aforador/AforadorLayout';
import { useTurno } from '../../../application/hooks/useTurno';

export function MenuPrincipalPage() {
  const navigate = useNavigate();
  const { turnoActivo, verificarTurnoActivo, cerrarTurno } = useTurno();
  const [hora, setHora] = useState(new Date());
  const [error, setError] = useState('');

  useEffect(() => {
    const check = async () => {
      const activo = await verificarTurnoActivo();
      if (!activo) navigate('/aforador/iniciar-turno');
    };
    check();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setHora(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

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
      <Box sx={{ maxWidth: 500, mx: 'auto', mt: 2, textAlign: 'center' }}>
        <Card sx={{ mb: 2, bgcolor: 'primary.main', color: 'white' }}>
          <CardContent>
            <Typography variant="h5" fontWeight={700}>{horaStr}</Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>{fechaStr}</Typography>
          </CardContent>
        </Card>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Button
          variant="contained"
          size="large"
          fullWidth
          sx={{ py: 4, mb: 2, fontSize: '1.3rem', bgcolor: 'primary.main', '&:hover': { bgcolor: 'primary.dark' } }}
          startIcon={<CarIcon sx={{ fontSize: 40 }} />}
          onClick={() => navigate('/aforador/franjas/1')}
        >
          CONTEO VEHICULAR
        </Button>

        <Button
          variant="contained"
          size="large"
          fullWidth
          sx={{ py: 4, mb: 3, fontSize: '1.3rem', bgcolor: 'secondary.main', '&:hover': { bgcolor: 'secondary.dark' } }}
          startIcon={<StopIcon sx={{ fontSize: 40 }} />}
          onClick={() => navigate('/aforador/franjas/2')}
        >
          PARADAS Y COLAS
        </Button>

        <Button
          variant="outlined"
          color="error"
          fullWidth
          sx={{ py: 1.5 }}
          onClick={handleCerrarTurno}
        >
          CERRAR TURNO
        </Button>
      </Box>
    </AforadorLayout>
  );
}
