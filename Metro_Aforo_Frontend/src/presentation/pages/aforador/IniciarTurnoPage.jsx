import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Card, CardContent, Typography, Button, MenuItem, TextField, Alert, CircularProgress,
} from '@mui/material';
import { PlayArrow as PlayIcon } from '@mui/icons-material';
import { useTurno } from '../../../application/hooks/useTurno';
import { puntoAforoService } from '../../../application/services/puntoAforoService';
import { SENTIDOS } from '../../../domain/constants';

export function IniciarTurnoPage() {
  const navigate = useNavigate();
  const { turnoActivo, verificarTurnoActivo, iniciarTurno, loading } = useTurno();
  const [puntos, setPuntos] = useState([]);
  const [puntoAforoId, setPuntoAforoId] = useState('');
  const [sentido, setSentido] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
/*
  useEffect(() => {
    const init = async () => {
      const activo = await verificarTurnoActivo();
      if (activo) {
        navigate('/aforador/menu');
        return;
      }
      try {
        const res = await puntoAforoService.listar();
        setPuntos(res.data || []);
      } catch (err) {
        setError('Error al cargar puntos de aforo');
      }
    };
    init();
  }, []);*/
  
  useEffect(() => {
    console.log('IniciarTurnoPage montado');
    const init = async () => {
      console.log('Entró a init');
      try {
        const activo = await verificarTurnoActivo();
        console.log('Turno activo:', activo);
        
        if (activo) {
          console.log('Redirigiendo a menú');
          navigate('/aforador/menu');
          return;
        }
        
        const res = await puntoAforoService.listar();
        console.log('Puntos recibidos:', res);
        
        setPuntos(res.data || []);
      } catch (err) {
        console.error('ERROR:', err);
        setError('Error al cargar puntos de aforo');
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
      await iniciarTurno(Number(puntoAforoId), sentido);
      navigate('/aforador/menu');
    } catch (err) {
      setError(err.message || 'Error al iniciar turno');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'primary.dark', p: 2 }}>
      <Card sx={{ maxWidth: 420, width: '100%' }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h5" fontWeight={700} textAlign="center" gutterBottom color="primary.main">
            AQP Aforos
          </Typography>
          <Typography variant="body2" color="text.secondary" textAlign="center" mb={2}>
            Iniciar turno de aforo
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {loading && <CircularProgress sx={{ display: 'block', mx: 'auto', my: 2 }} />}

          {!loading && (
            <Box component="form" onSubmit={handleSubmit}>
              <TextField
                select
                fullWidth
                label="Punto de aforo"
                value={puntoAforoId}
                onChange={(e) => setPuntoAforoId(e.target.value)}
                margin="normal"
                required
              >
                <MenuItem value="">-- Seleccione --</MenuItem>
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
                margin="normal"
                required
              >
                <MenuItem value="">-- Seleccione --</MenuItem>
                {SENTIDOS.map((s) => (
                  <MenuItem key={s} value={s}>{s.toUpperCase()}</MenuItem>
                ))}
              </TextField>

              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                sx={{ mt: 3, py: 2 }}
                startIcon={<PlayIcon />}
                disabled={submitting}
              >
                {submitting ? 'INICIANDO...' : 'INICIAR TURNO'}
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
