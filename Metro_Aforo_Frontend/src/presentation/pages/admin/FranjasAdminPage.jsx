import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Button, Alert, Card, CardContent, Dialog, DialogTitle, DialogContent,
  IconButton, Chip, Grid,
} from '@mui/material';
import {
  Home as HomeIcon, CalendarMonth as CalendarIcon, AccessTime as TimeIcon,
  LocationOn as LocationIcon, PhotoCamera as PhotoIcon, Close as CloseIcon,
  ExpandMore as ExpandIcon, Public as PublicIcon,
} from '@mui/icons-material';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { turnoService } from '../../../application/services/turnoService';
import { franjaService } from '../../../application/services/franjaService';
import { API_URL } from '../../../domain/constants';
import { HelpButton } from '../../components/tours/HelpButton';
import { tours } from '../../components/tours/tourConfig';

const font = "'Inter', 'Poppins', 'Segoe UI', sans-serif";

const estadoColor = { pendiente: '#F59E0B', activo: '#2563EB', activa: '#2563EB', completado: '#10B981', completada: '#10B981', omitida: '#EF4444' };

function estadoTurno(t) {
  if (t.activo === false && !t.fecha_fin) return 'pendiente';
  if (t.activo === true) return 'activo';
  return 'completado';
}

function puntoNombre(t) {
  return t.puntosAsignados?.[0]?.puntoAforo?.nombre_punto || t.punto_aforo?.nombre_punto || t.puntoAforo?.nombre_punto || 'Sin punto';
}

export function FranjasAdminPage() {
  const navigate = useNavigate();
  const [turnos, setTurnos] = useState([]);
  const [franjas, setFranjas] = useState([]);
  const [turnoSeleccionado, setTurnoSeleccionado] = useState(null);
  const [franjaDetalle, setFranjaDetalle] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadTurnos = useCallback(async () => {
    try {
      setLoading(true);
      const res = await turnoService.listar({ limit: 100 });
      setTurnos(res.data || []);
    } catch { setError('Error al cargar turnos'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadTurnos(); }, [loadTurnos]);

  const handleSelectTurno = async (turno) => {
    if (turnoSeleccionado?.id_turno === turno.id_turno) {
      setTurnoSeleccionado(null);
      setFranjas([]);
      return;
    }
    try {
      setTurnoSeleccionado(turno);
      const res = await turnoService.getFranjas(turno.id_turno);
      setFranjas(res.data || []);
    } catch { setError('Error al cargar franjas'); }
  };

  const handleAbrirDetalle = async (franja) => {
    try {
      const res = await franjaService.getById(franja.id_franja);
      setFranjaDetalle(res.data || res);
    } catch { setError('Error al cargar detalle'); }
  };

  const fotoUrl = (url) => url ? `${API_URL.replace('/api', '')}${url}` : null;
  const lat = franjaDetalle?.evidencias?.[0]?.latitud;
  const lon = franjaDetalle?.evidencias?.[0]?.longitud;

  return (
    <AdminLayout>
      <Box sx={{ maxWidth: 1100, mx: 'auto', fontFamily: font }}>
        {/* ── HEADER ── */}
        <Card data-tour="franjas-header" sx={{ borderRadius: '16px', mb: 3, boxShadow: '0 4px 16px rgba(0,0,0,.06)' }}>
          <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 }, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{
              width: 44, height: 44, borderRadius: '12px',
              background: 'linear-gradient(135deg, #0D5BFF, #38bdf8)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#FFF', boxShadow: '0 4px 12px rgba(13,91,255,.3)',
            }}>
              <PublicIcon sx={{ fontSize: 22 }} />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ fontSize: 18, fontWeight: 700, color: '#1F2937', fontFamily: font }}>Franjas Horarias</Typography>
              <Typography sx={{ fontSize: 13, color: '#6B7280', fontFamily: font }}>
                {turnos.length} turno{turnos.length !== 1 ? 's' : ''} registrado{turnos.length !== 1 ? 's' : ''}
              </Typography>
            </Box>
            <Button size="small" startIcon={<HomeIcon />} onClick={() => navigate('/admin/dashboard')}
              sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 600, fontSize: 13, color: '#6B7280', '&:hover': { bgcolor: '#F3F4F6' } }}>
              Volver al inicio
            </Button>
          </CardContent>
        </Card>

        {error && <Alert severity="error" sx={{ mb: 2, borderRadius: '12px' }} onClose={() => setError('')}>{error}</Alert>}

        {/* ── LISTA DE TURNOS ── */}
        {loading && <Typography sx={{ textAlign: 'center', py: 4, color: '#9CA3AF', fontFamily: font }}>Cargando turnos...</Typography>}
        {!loading && turnos.length === 0 && (
          <Typography sx={{ textAlign: 'center', py: 4, color: '#9CA3AF', fontFamily: font }}>No hay turnos registrados</Typography>
        )}

        <Grid container spacing={2} data-tour="franjas-accordion">
          {turnos.map((turno) => {
            const isOpen = turnoSeleccionado?.id_turno === turno.id_turno;
            return (
              <Grid size={{ xs: 12 }} key={turno.id_turno}>
                <Card sx={{
                  borderRadius: '16px', boxShadow: '0 4px 16px rgba(0,0,0,.06)',
                  border: isOpen ? '2px solid #2563EB' : '1px solid #E5E7EB',
                  transition: 'all 0.2s',
                }}>
                  <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, cursor: 'pointer' }}
                      onClick={() => handleSelectTurno(turno)}>
                      <Box sx={{
                        width: 40, height: 40, borderRadius: '10px',
                        background: 'linear-gradient(135deg, #0D5BFF, #38bdf8)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF',
                      }}>
                        <CalendarIcon sx={{ fontSize: 20 }} />
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography sx={{ fontWeight: 600, fontSize: 14, color: '#1F2937', fontFamily: font }}>
                          Turno #{turno.id_turno} — {turno.fecha ? new Date(turno.fecha).toLocaleDateString('es-PE') : '-'}
                        </Typography>
                        <Typography sx={{ fontSize: 12, color: '#6B7280', fontFamily: font }}>
                          {puntoNombre(turno)} · {turno.usuario?.nombres || ''} {turno.usuario?.apellidos || ''}
                        </Typography>
                      </Box>
                      <Chip label={estadoTurno(turno)} size="small"
                        sx={{ fontWeight: 600, fontSize: 11, fontFamily: font, bgcolor: estadoColor[estadoTurno(turno)] || '#9CA3AF', color: '#FFF' }} />
                      <ExpandIcon sx={{ color: '#9CA3AF', transform: isOpen ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
                    </Box>

                    {/* ── FRANJAS DEL TURNO ── */}
                    {isOpen && (
                      <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid #E5E7EB' }}>
                        {franjas.length === 0 && (
                          <Typography sx={{ fontSize: 13, color: '#9CA3AF', fontFamily: font, textAlign: 'center', py: 2 }}>
                            No hay franjas en este turno
                          </Typography>
                        )}
                        <Grid container spacing={1.5}>
                          {franjas.map((f) => (
                            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={f.id_franja}>
                              <Card sx={{
                                borderRadius: '12px', cursor: 'pointer',
                                border: '1px solid #E5E7EB', transition: 'all 0.2s',
                                '&:hover': { borderColor: '#2563EB', boxShadow: '0 4px 12px rgba(13,91,255,.12)' },
                              }} onClick={() => handleAbrirDetalle(f)}>
                                <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                    <TimeIcon sx={{ fontSize: 16, color: '#6B7280' }} />
                                    <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#1F2937', fontFamily: font }}>
                                      {f.inicio ? new Date(f.inicio).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }) : '-'}
                                    </Typography>
                                    <Typography sx={{ fontSize: 12, color: '#9CA3AF', fontFamily: font }}>→</Typography>
                                    <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#1F2937', fontFamily: font }}>
                                      {f.fin ? new Date(f.fin).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }) : '-'}
                                    </Typography>
                                  </Box>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Chip label={f.estado} size="small"
                                      sx={{ fontWeight: 600, fontSize: 10, fontFamily: font, height: 22, bgcolor: estadoColor[f.estado] || '#9CA3AF', color: '#FFF' }} />
                                    <PhotoIcon sx={{ fontSize: 14, color: '#9CA3AF' }} />
                                    <LocationIcon sx={{ fontSize: 14, color: '#9CA3AF' }} />
                                  </Box>
                                </CardContent>
                              </Card>
                            </Grid>
                          ))}
                        </Grid>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>

        {/* ── MODAL DE DETALLE ── */}
        <Dialog data-tour="franjas-modal" open={!!franjaDetalle} onClose={() => setFranjaDetalle(null)} maxWidth="md" fullWidth
          slotProps={{ paper: { sx: { borderRadius: '16px' } } }}>
          {franjaDetalle && (
            <>
              <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: font }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PublicIcon sx={{ color: '#2563EB' }} />
                  <span>Franja #{franjaDetalle.id_franja}</span>
                  <Chip label={franjaDetalle.estado} size="small"
                    sx={{ fontWeight: 600, fontSize: 11, fontFamily: font, bgcolor: estadoColor[franjaDetalle.estado] || '#9CA3AF', color: '#FFF' }} />
                </Box>
                <IconButton onClick={() => setFranjaDetalle(null)}><CloseIcon /></IconButton>
              </DialogTitle>
              <DialogContent dividers sx={{ fontFamily: font }}>
                <Grid container spacing={2}>
                  {/* Info */}
                  <Grid size={{ xs: 12, md: 4 }}>
                    <Box sx={{ p: 2, bgcolor: '#F9FAFB', borderRadius: '12px' }}>
                      <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#374151', mb: 1.5, fontFamily: font }}>Información</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <TimeIcon sx={{ fontSize: 16, color: '#6B7280' }} />
                        <Typography sx={{ fontSize: 13, color: '#374151', fontFamily: font }}>
                          Inicio: {franjaDetalle.inicio ? new Date(franjaDetalle.inicio).toLocaleString('es-PE') : '-'}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <TimeIcon sx={{ fontSize: 16, color: '#6B7280' }} />
                        <Typography sx={{ fontSize: 13, color: '#374151', fontFamily: font }}>
                          Fin: {franjaDetalle.fin ? new Date(franjaDetalle.fin).toLocaleString('es-PE') : '-'}
                        </Typography>
                      </Box>
                      {franjaDetalle.motivo && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography sx={{ fontSize: 13, color: '#374151', fontFamily: font }}>
                            Motivo: {franjaDetalle.motivo}
                          </Typography>
                        </Box>
                      )}

                      {/* GPS */}
                      {lat && lon && (
                        <Box sx={{ mt: 2 }}>
                          <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#374151', mb: 1, fontFamily: font }}>
                            <LocationIcon sx={{ fontSize: 16, verticalAlign: 'middle', mr: 0.5 }} />
                            Ubicación GPS
                          </Typography>
                          <Typography sx={{ fontSize: 12, color: '#6B7280', fontFamily: font, mb: 1 }}>
                            Lat: {lat} · Lon: {lon}
                          </Typography>
                          <Box sx={{
                            width: '100%', height: 200, borderRadius: '10px', overflow: 'hidden',
                            border: '1px solid #E5E7EB', position: 'relative',
                          }}>
                            <iframe
                              title="mapa"
                              width="100%" height="100%"
                              frameBorder="0" scrolling="no" marginHeight={0} marginWidth={0}
                              src={`https://maps.google.com/maps?q=${lat},${lon}&z=15&output=embed`}
                              style={{ borderRadius: '10px' }}
                            />
                            <a
                              href={`https://www.google.com/maps?q=${lat},${lon}`}
                              target="_blank" rel="noopener noreferrer"
                              style={{
                                position: 'absolute', bottom: 8, right: 8,
                                background: '#FFFFFF', color: '#2563EB', fontSize: 12,
                                padding: '4px 12px', borderRadius: '8px', textDecoration: 'none',
                                fontWeight: 600, fontFamily: font,
                                boxShadow: '0 2px 8px rgba(0,0,0,.15)',
                              }}
                            >
                              Ver en Google Maps
                            </a>
                          </Box>
                        </Box>
                      )}
                    </Box>
                  </Grid>

                  {/* Foto */}
                  <Grid size={{ xs: 12, md: 8 }}>
                    {franjaDetalle.evidencias?.[0]?.foto_url ? (
                      <Box sx={{
                        borderRadius: '12px', overflow: 'hidden',
                        border: '1px solid #E5E7EB', textAlign: 'center',
                      }}>
                        <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#374151', p: 1.5, fontFamily: font }}>
                          <PhotoIcon sx={{ fontSize: 16, verticalAlign: 'middle', mr: 0.5 }} />
                          Foto del paradero
                        </Typography>
                        <Box sx={{ position: 'relative', width: '100%', maxHeight: 420, overflow: 'hidden' }}>
                          <img
                            src={fotoUrl(franjaDetalle.evidencias[0].foto_url)}
                            alt="Evidencia del paradero"
                            style={{ width: '100%', height: 'auto', display: 'block', objectFit: 'contain', maxHeight: 420 }}
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                          <Box sx={{ display: 'none', alignItems: 'center', justifyContent: 'center', height: 200, bgcolor: '#F3F4F6', color: '#9CA3AF', fontSize: 13, fontFamily: font }}>
                            No se pudo cargar la imagen
                          </Box>
                        </Box>
                      </Box>
                    ) : (
                      <Box sx={{
                        height: 200, borderRadius: '12px', bgcolor: '#F3F4F6',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                        color: '#9CA3AF', fontFamily: font, fontSize: 13,
                      }}>
                        <PhotoIcon sx={{ fontSize: 40, mb: 1, opacity: 0.4 }} />
                        Sin foto disponible
                      </Box>
                    )}
                  </Grid>
                </Grid>
              </DialogContent>
            </>
          )}
        </Dialog>
      </Box>
      <HelpButton steps={tours.admin.franjas} />
    </AdminLayout>
  );
}