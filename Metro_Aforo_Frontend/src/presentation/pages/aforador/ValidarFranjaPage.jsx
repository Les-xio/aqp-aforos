import { useState, useRef } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  Box, Typography, Button, Alert, Card, CardContent, CircularProgress,
} from '@mui/material';
import { CameraAlt as CameraIcon, GpsFixed as GpsIcon, ArrowForward as NextIcon } from '@mui/icons-material';
import { AforadorLayout } from '../../components/aforador/AforadorLayout';
import { franjaService } from '../../../application/services/franjaService';
import { evidenciaService } from '../../../application/services/evidenciaService';

export function ValidarFranjaPage() {
  const { franjaId } = useParams();
  const [searchParams] = useSearchParams();
  const formato = searchParams.get('formato') || '1';
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [fotoBlob, setFotoBlob] = useState(null);
  const [fotoPreview, setFotoPreview] = useState('');
  const [gps, setGps] = useState(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [stream, setStream] = useState(null);

  const iniciarCamara = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      if (videoRef.current) videoRef.current.srcObject = s;
      setStream(s);
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
      setFotoBlob(blob);
      setFotoPreview(URL.createObjectURL(blob));
      if (stream) stream.getTracks().forEach((t) => t.stop());
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
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const handleContinuar = async () => {
    if (!fotoBlob || !gps) {
      setError('Debe capturar la foto y esperar la ubicación GPS');
      return;
    }
    try {
      setError('');
      setSubmitting(true);

      await franjaService.iniciar(franjaId);

      const formData = new FormData();
      formData.append('foto', fotoBlob, `evidencia_${Date.now()}.jpg`);
      formData.append('franjaId', franjaId);
      formData.append('latitud', gps.latitud);
      formData.append('longitud', gps.longitud);
      await evidenciaService.registrar(formData);

      if (formato === '1') {
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
      <Box sx={{ maxWidth: 500, mx: 'auto', textAlign: 'center' }}>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          Validación - Evidencia Fotográfica
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Card sx={{ mb: 2 }}>
          <CardContent>
            {!fotoPreview ? (
              <Box>
                <video ref={videoRef} autoPlay playsInline style={{ width: '100%', maxHeight: 350, borderRadius: 8, bgcolor: 'black' }} />
                <canvas ref={canvasRef} style={{ display: 'none' }} />
                <Button
                  variant="contained"
                  size="large"
                  fullWidth
                  startIcon={<CameraIcon />}
                  onClick={capturarFoto}
                  sx={{ mt: 2 }}
                >
                  CAPTURAR FOTO
                </Button>
              </Box>
            ) : (
              <Box>
                <Box component="img" src={fotoPreview} sx={{ width: '100%', maxHeight: 350, borderRadius: 2, objectFit: 'contain' }} />
                <Typography variant="body2" color="success.main" sx={{ mt: 1 }}>
                  Foto capturada correctamente
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>

        <Card sx={{ mb: 2 }}>
          <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'center' }}>
            <GpsIcon color={gps ? 'success' : 'action'} />
            <Typography variant="body2">
              {gpsLoading ? 'Obteniendo ubicación GPS...' : gps ? `GPS: ${gps.latitud.toFixed(5)}, ${gps.longitud.toFixed(5)}` : 'Esperando foto...'}
            </Typography>
            {gpsLoading && <CircularProgress size={16} />}
          </CardContent>
        </Card>

        <Button
          variant="contained"
          size="large"
          fullWidth
          sx={{ py: 2 }}
          startIcon={<NextIcon />}
          onClick={handleContinuar}
          disabled={!fotoBlob || !gps || submitting}
        >
          {submitting ? 'PROCESANDO...' : 'CONTINUAR PARA HACER LA MEDICIÓN'}
        </Button>
      </Box>
    </AforadorLayout>
  );
}
