import { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';

export function Cronometro({ inicio, duracionMin = 15, onTerminar }) {
  const [segundosRestantes, setSegundosRestantes] = useState(0);

  useEffect(() => {
    if (!inicio) return;
    const fin = new Date(new Date(inicio).getTime() + duracionMin * 60000);

    const actualizar = () => {
      const ahora = new Date();
      const diff = Math.max(0, Math.floor((fin - ahora) / 1000));
      setSegundosRestantes(diff);
      if (diff <= 0 && onTerminar) onTerminar();
    };

    actualizar();
    const interval = setInterval(actualizar, 1000);
    return () => clearInterval(interval);
  }, [inicio, duracionMin, onTerminar]);

  const minutos = Math.floor(segundosRestantes / 60);
  const segundos = segundosRestantes % 60;

  const formato = `${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}`;

  return (
    <Box sx={{ textAlign: 'center', py: 1 }}>
      <Typography
        variant="h3"
        fontWeight={700}
        fontFamily="monospace"
        color={segundosRestantes < 60 ? 'error.main' : 'text.primary'}
      >
        {formato}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        Tiempo restante
      </Typography>
    </Box>
  );
}
