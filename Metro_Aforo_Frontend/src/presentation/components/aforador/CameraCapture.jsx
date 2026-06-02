import { useRef, useState, useEffect } from 'react';
import { Box, Button, Typography, CircularProgress } from '@mui/material';
import { CameraAlt as CameraIcon, CheckCircle as CheckIcon } from '@mui/icons-material';

export function CameraCapture({ onCapture, onSkip }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [captured, setCaptured] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    iniciarCamara();
    return () => detenerCamara();
  }, []);

  const iniciarCamara = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = s;
      }
      setStream(s);
      setLoading(false);
    } catch (err) {
      setError('No se pudo acceder a la cámara. Permisos denegados.');
      setLoading(false);
    }
  };

  const detenerCamara = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
  };

  const capturar = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);
    canvas.toBlob((blob) => {
      setCaptured(URL.createObjectURL(blob));
      detenerCamara();
      if (onCapture) onCapture(blob);
    }, 'image/jpeg', 0.8);
  };

  const retomar = () => {
    setCaptured(null);
    setError(null);
    iniciarCamara();
  };

  return (
    <Box sx={{ textAlign: 'center' }}>
      <Box sx={{ position: 'relative', bgcolor: 'black', borderRadius: 2, overflow: 'hidden', minHeight: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {!captured && (
          <video ref={videoRef} autoPlay playsInline style={{ width: '100%', maxHeight: 400 }} />
        )}
        {captured && (
          <Box component="img" src={captured} sx={{ width: '100%', maxHeight: 400, objectFit: 'contain' }} />
        )}
        {loading && <CircularProgress sx={{ position: 'absolute' }} />}
        {error && (
          <Typography color="error" sx={{ position: 'absolute', bgcolor: 'rgba(0,0,0,0.7)', color: 'white', p: 2 }}>
            {error}
          </Typography>
        )}
      </Box>
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      <Box sx={{ display: 'flex', gap: 1, mt: 2, justifyContent: 'center' }}>
        {!captured ? (
          <Button variant="contained" size="large" startIcon={<CameraIcon />} onClick={capturar} disabled={loading || !!error} fullWidth>
            TOMAR FOTO
          </Button>
        ) : (
          <>
            <CheckIcon color="success" sx={{ fontSize: 40 }} />
            <Typography variant="body2" color="success.main" sx={{ alignSelf: 'center' }}>
              Foto capturada
            </Typography>
          </>
        )}
      </Box>
      {captured && (
        <Button variant="outlined" onClick={retomar} sx={{ mt: 1 }}>
          Retomar foto
        </Button>
      )}
    </Box>
  );
}
