import { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  Box, Typography, Button, Alert, Card, CardContent, CircularProgress, Avatar,
} from '@mui/material';
import {
  CameraAlt as CameraIcon, ArrowForward as NextIcon,
  CheckCircle as CheckIcon, ArrowBack as BackIcon,
  DirectionsCar as CarIcon, Stop as StopIcon,
  LocationOn as LocationIcon, SwapHoriz as SentidoIcon,
} from '@mui/icons-material';
import { HelpButton } from '../../components/tours/HelpButton';
import { tours } from '../../components/tours/tourConfig';
import { AforadorLayout } from '../../components/aforador/AforadorLayout';
import { useAuth } from '../../../application/hooks/useAuth';
import { useTurno } from '../../../application/hooks/useTurno';
import { turnoService } from '../../../application/services/turnoService';
import { franjaService } from '../../../application/services/franjaService';
import { evidenciaService } from '../../../application/services/evidenciaService';
import { offlineStorage } from '../../../infrastructure/storage/offlineStorage';

export function ValidarFranjaPage() {
  const { franjaId } = useParams();
  const [searchParams] = useSearchParams();
  const formato = searchParams.get('formato') || '1';
  const navigate = useNavigate();
  const { usuario } = useAuth();
  const { turnoActivo } = useTurno();
  const [puntoInfo, setPuntoInfo] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [fotoBlob, setFotoBlob] = useState(null);
  const [fotoPreview, setFotoPreview] = useState('');
  const [gps, setGps] = useState(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const streamRef = useRef(null);
  const esFormato1 = formato === '1';

  useEffect(() => {
    if (!turnoActivo) return;
    turnoService.getPuntos(turnoActivo.id_turno)
      .then(res => {
        if (res.data?.length > 0) setPuntoInfo(res.data[0]);
      })
      .catch(() => {});
  }, [turnoActivo]);

  useEffect(() => {
    iniciarCamara();
    return () => {
      if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const iniciarCamara = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      if (videoRef.current) videoRef.current.srcObject = s;
      streamRef.current = s;
    } catch {
      setError('No se pudo acceder a la cámara');
    }
  };

  const capturarFoto = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    canvas.toBlob((blob) => {
      if (!blob) {
        setError('Error al capturar la foto');
        return;
      }
      setFotoBlob(blob);
      setFotoPreview(URL.createObjectURL(blob));
      if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
      obtenerGps();
    }, 'image/jpeg', 0.8);
  };

  const obtenerGps = () => {
    setGpsLoading(true);
    if (!navigator.geolocation) {
      setGps({ latitud: -16.4090, longitud: -71.5375 });
      setGpsLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGps({ latitud: pos.coords.latitude, longitud: pos.coords.longitude });
        setGpsLoading(false);
      },
      () => {
        setGps({ latitud: -16.4090, longitud: -71.5375 });
        setGpsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
    );
  };

  const handleContinuar = async () => {
    if (!fotoBlob || !gps) {
      setError('Debe capturar la foto');
      return;
    }
    try {
      setError('');
      setSubmitting(true);

      try {
        await franjaService.iniciar(franjaId);
      } catch {
        await offlineStorage.addFranjaPendiente({ franjaId, accion: 'iniciar' });
      }

      const formData = new FormData();
      formData.append('foto', fotoBlob, `evidencia_${Date.now()}.jpg`);
      formData.append('franjaId', franjaId);
      formData.append('latitud', gps.latitud);
      formData.append('longitud', gps.longitud);

      try {
        await evidenciaService.registrar(formData);
      } catch {
        await offlineStorage.addEvidenciaPendiente({
          franjaId,
          latitud: gps.latitud,
          longitud: gps.longitud,
          fotoBlob,
        });
      }

      if (esFormato1) {
        navigate(`/aforador/conteo/${franjaId}`);
      } else {
        navigate(`/aforador/paradas/${franjaId}`);
      }
    } catch (err) {
      setError(err.message || 'Error al procesar la evidencia');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AforadorLayout>
      <Box sx={{ maxWidth: 500, mx: 'auto', px: 1, pt: 1 }}>
        {/* Header */}
        <Card data-tour="validar-header" sx={{
          mb: 2, borderRadius: '20px',
          background: 'linear-gradient(135deg, #0D5BFF 0%, #0052CC 100%)',
          color: '#FFFFFF', boxShadow: '0 8px 24px rgba(13,91,255,.25)',
        }}>
          <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
              <Button
                onClick={() => navigate('/aforador/menu')}
                sx={{ color: 'rgba(255,255,255,0.8)', minWidth: 0, p: 0.5, '&:hover': { color: '#FFFFFF' } }}
              >
                <BackIcon />
              </Button>
              <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 36, height: 36 }}>
                {esFormato1 ? <CarIcon sx={{ fontSize: 20 }} /> : <StopIcon sx={{ fontSize: 20 }} />}
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography sx={{ fontSize: 18, fontWeight: 700, lineHeight: 1.2 }}>
                  Evidencia fotográfica
                </Typography>
                <Typography sx={{ fontSize: 12, opacity: 0.85 }}>
                  {usuario?.nombres} {usuario?.apellidos}
                </Typography>
              </Box>
            </Box>

            {puntoInfo && (
              <Box data-tour="validar-info" sx={{
                display: 'flex', gap: 2.5, flexWrap: 'wrap',
                pt: 1.5, mt: 0.5,
                borderTop: '1px solid rgba(255,255,255,0.15)',
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <LocationIcon sx={{ fontSize: 14, opacity: 0.8 }} />
                  <Typography sx={{ fontSize: 12, opacity: 0.8, fontWeight: 500 }}>
                    Punto:
                  </Typography>
                  <Typography sx={{ fontSize: 12, fontWeight: 700 }}>
                    {puntoInfo.puntoAforo?.nombre_punto || '—'}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <SentidoIcon sx={{ fontSize: 14, opacity: 0.8 }} />
                  <Typography sx={{ fontSize: 12, opacity: 0.8, fontWeight: 500 }}>
                    Sentido:
                  </Typography>
                  <Typography sx={{ fontSize: 12, fontWeight: 700 }}>
                    {puntoInfo.sentido || '—'}
                  </Typography>
                </Box>
              </Box>
            )}
          </CardContent>
        </Card>

        {error && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: '12px' }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* Cámara / Foto */}
        <Card sx={{ mb: 2, borderRadius: '20px', boxShadow: '0 4px 20px rgba(0,0,0,.08)', overflow: 'hidden' }}>
          {!fotoPreview ? (
            <Box>
              <Box sx={{ bgcolor: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
                <video ref={videoRef} autoPlay playsInline style={{ width: '100%', maxHeight: 350, display: 'block' }} />
              </Box>
              <canvas ref={canvasRef} style={{ display: 'none' }} />
              <Box sx={{ p: 2 }}>
                <Button
                  variant="contained"
                  size="large"
                  fullWidth
                  startIcon={<CameraIcon />}
                  onClick={capturarFoto}
                  sx={{
                    height: 56, borderRadius: '14px', fontSize: 15, fontWeight: 700,
                    background: 'linear-gradient(90deg, #0D5BFF, #0052CC)',
                    boxShadow: '0 6px 16px rgba(13,91,255,.3)',
                    '&:hover': { transform: 'translateY(-1px)', boxShadow: '0 8px 20px rgba(13,91,255,.4)' },
                    transition: 'all 0.2s ease',
                  }}
                >
                  CAPTURAR FOTO
                </Button>
              </Box>
            </Box>
          ) : (
            <Box>
              <Box
                component="img"
                src={fotoPreview}
                sx={{ width: '100%', maxHeight: 350, objectFit: 'contain', bgcolor: '#F5F5F5' }}
              />
              <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                <CheckIcon sx={{ fontSize: 20, color: '#059669' }} />
                <Typography sx={{ fontSize: 14, fontWeight: 600, color: '#059669' }}>
                  Foto capturada correctamente
                </Typography>
              </Box>
            </Box>
          )}
        </Card>

        {/* GPS oculto visualmente pero sigue funcionando */}
        {gpsLoading && (
          <Box data-tour="validar-gps" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 2 }}>
            <CircularProgress size={16} />
            <Typography sx={{ fontSize: 13, color: '#666666' }}>Obteniendo ubicación...</Typography>
          </Box>
        )}

        <Button
          variant="contained"
          size="large"
          fullWidth
          sx={{
            height: 60, borderRadius: '14px', fontSize: 15, fontWeight: 700,
            background: 'linear-gradient(90deg, #0D5BFF, #0052CC)',
            boxShadow: '0 6px 16px rgba(13,91,255,.3)',
            '&:hover': { transform: 'translateY(-1px)', boxShadow: '0 8px 20px rgba(13,91,255,.4)' },
            '&:disabled': { background: '#E0E0E0', boxShadow: 'none' },
            transition: 'all 0.2s ease',
          }}
          startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : <NextIcon />}
          onClick={handleContinuar}
          disabled={!fotoBlob || !gps || submitting}
        >
          {submitting ? 'PROCESANDO...' : 'CONTINUAR PARA HACER LA MEDICIÓN'}
        </Button>
      </Box>
      <HelpButton steps={tours.aforador.validar} />
    </AforadorLayout>
  );
}
