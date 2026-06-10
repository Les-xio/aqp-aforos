import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from '../../components/admin/AdminLayout';
import {
  Box, Typography, Card, CardContent, Grid, Button, TextField,
  Avatar, Alert, Snackbar, CircularProgress, Chip,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
} from '@mui/material';
import { AccessTime, Home as HomeIcon, Add, Person, History as HistoryIcon } from '@mui/icons-material';
import { usuarioService } from '../../../application/services/usuarioService';
import { turnoService } from '../../../application/services/turnoService';
import { HelpButton } from '../../components/tours/HelpButton';
import { tours } from '../../components/tours/tourConfig';

const font = "'Inter', 'Poppins', 'Segoe UI', sans-serif";

function toISOLocal(d) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function roundNext15(date) {
  const d = new Date(date);
  const m = d.getMinutes();
  const r = Math.ceil(m / 15) * 15;
  d.setMinutes(r, 0, 0);
  return d;
}

const durMs = (inicio, fin) => {
  if (!fin) return null;
  return Math.round((new Date(fin) - new Date(inicio)) / 3600000 * 10) / 10;
};

function defaultFechaHora() {
  const r = roundNext15(new Date());
  return { fecha: r.toISOString().slice(0, 10), hora: `${String(r.getHours()).padStart(2,'0')}:${String(r.getMinutes()).padStart(2,'0')}` };
}

export function TurnosPage() {
  const navigate = useNavigate();
  const [aforadores, setAforadores] = useState([]);
  const [horasMap, setHorasMap] = useState({});
  const [fechaMap, setFechaMap] = useState({});
  const [horaMap, setHoraMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [generando, setGenerando] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const [turnosList, setTurnosList] = useState([]);
  const [turnosLoading, setTurnosLoading] = useState(true);

  const fetchAforadores = useCallback(async () => {
    try {
      setLoading(true);
      const res = await usuarioService.listar({ rol: 'aforador', limit: 100 });
      const data = res.data?.data || res.data || [];
      setAforadores(data);
      const hMap = {}, fMap = {}, tMap = {};
      const def = defaultFechaHora();
      data.forEach((a) => {
        hMap[a.id_usuario] = 4;
        fMap[a.id_usuario] = def.fecha;
        tMap[a.id_usuario] = def.hora;
      });
      setHorasMap(hMap);
      setFechaMap(fMap);
      setHoraMap(tMap);
    } catch {
      setSnackbar({ open: true, message: 'Error al cargar aforadores', severity: 'error' });
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTurnos = useCallback(async () => {
    try {
      setTurnosLoading(true);
      const res = await turnoService.listar({ limit: 100 });
      setTurnosList(res.data?.data || res.data || []);
    } catch {
      setSnackbar({ open: true, message: 'Error al cargar historial de turnos', severity: 'error' });
    } finally {
      setTurnosLoading(false);
    }
  }, []);

  useEffect(() => { fetchAforadores(); fetchTurnos(); }, [fetchAforadores, fetchTurnos]);

  const handleHorasChange = (id, value) => {
    const v = Math.max(1, Math.min(24, Number(value) || 1));
    setHorasMap((prev) => ({ ...prev, [id]: v }));
  };

  const handleGenerar = async (usuario) => {
    try {
      setGenerando(true);
      const horas = horasMap[usuario.id_usuario] || 4;
      const fecha = fechaMap[usuario.id_usuario];
      const hora = horaMap[usuario.id_usuario];
      const fechaInicio = `${fecha}T${hora}:00`;
      await turnoService.generarAdmin(usuario.id_usuario, horas, fechaInicio);
      setSnackbar({ open: true, message: `Turno de ${horas}h generado para ${usuario.nombres} ${usuario.apellidos}`, severity: 'success' });
      fetchTurnos();
    } catch (err) {
      const msg = err.response?.data?.message || 'Error al generar turno';
      setSnackbar({ open: true, message: msg, severity: 'error' });
    } finally {
      setGenerando(false);
    }
  };

  return (
    <AdminLayout>
      <Box sx={{ maxWidth: 1100, mx: 'auto', fontFamily: font }}>
        <Paper data-tour="turnos-header" elevation={0} sx={{ borderRadius: '16px', mb: 3, p: 2.5, boxShadow: '0 4px 16px rgba(0,0,0,.06)', display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{
            width: 44, height: 44, borderRadius: '12px',
            background: 'linear-gradient(135deg, #98b2df, #7a9ad4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#FFF', boxShadow: '0 4px 12px rgba(152,178,223,.4)',
          }}>
            <AccessTime sx={{ fontSize: 22 }} />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography sx={{ fontSize: 18, fontWeight: 700, color: '#1F2937', fontFamily: font }}>Gestión de Turnos</Typography>
            <Typography sx={{ fontSize: 13, color: '#6B7280', fontFamily: font }}>
              Asigna las horas de trabajo a cada aforador y genera sus franjas de 15 min
            </Typography>
          </Box>
          <Button size="small" startIcon={<HomeIcon />} onClick={() => navigate('/admin/dashboard')}
            sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 600, fontSize: 13, color: '#6B7280', '&:hover': { bgcolor: '#F3F4F6' } }}>
            Volver al inicio
          </Button>
        </Paper>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Typography sx={{ fontSize: 15, fontWeight: 700, color: '#1F2937', mb: 2, fontFamily: font }}>
              Asignar turnos
            </Typography>
            <Grid container spacing={2} data-tour="turnos-card" sx={{ mb: 4 }}>
              {aforadores.map((aforador) => (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={aforador.id_usuario}>
                  <Card sx={{
                    borderRadius: '16px',
                    boxShadow: '0 2px 8px rgba(0,0,0,.06)',
                    border: '1px solid #E5E7EB',
                    transition: 'all 0.2s',
                    '&:hover': { boxShadow: '0 8px 24px rgba(0,0,0,.1)' },
                  }}>
                    <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                        <Avatar sx={{ bgcolor: '#98b2df', width: 40, height: 40 }}>
                          <Person />
                        </Avatar>
                        <Box>
                          <Typography sx={{ fontSize: 14, fontWeight: 700, fontFamily: font }}>
                            {aforador.nombres} {aforador.apellidos}
                          </Typography>
                          <Typography sx={{ fontSize: 11, color: '#6B7280', fontFamily: font }}>
                            DNI: {aforador.dni} | {aforador.correo}
                          </Typography>
                        </Box>
                      </Box>

                      <Grid container spacing={1}>
                        <Grid size={6}>
                          <TextField fullWidth label="Fecha" type="date" size="small"
                            value={fechaMap[aforador.id_usuario] || ''}
                            onChange={(e) => setFechaMap((p) => ({ ...p, [aforador.id_usuario]: e.target.value }))}
                            slotProps={{ inputLabel: { shrink: true }, input: { sx: { borderRadius: '10px', bgcolor: '#F9FAFB' } } }} />
                        </Grid>
                        <Grid size={6}>
                          <TextField fullWidth label="Hora inicio" type="time" size="small"
                            value={horaMap[aforador.id_usuario] || ''}
                            onChange={(e) => setHoraMap((p) => ({ ...p, [aforador.id_usuario]: e.target.value }))}
                            slotProps={{ inputLabel: { shrink: true }, input: { sx: { borderRadius: '10px', bgcolor: '#F9FAFB' } } }} />
                        </Grid>
                        <Grid size={6}>
                          <TextField label="Horas" type="number" size="small"
                            value={horasMap[aforador.id_usuario] ?? 4}
                            onChange={(e) => handleHorasChange(aforador.id_usuario, e.target.value)}
                            slotProps={{ htmlInput: { min: 1, max: 24 }, input: { sx: { borderRadius: '10px', bgcolor: '#F9FAFB' } } }}
                            sx={{
                              '& .MuiInputLabel-root': { fontFamily: font, fontSize: 13 },
                              '& .MuiOutlinedInput-input': { fontFamily: font, fontWeight: 600 },
                            }} />
                        </Grid>
                        <Grid size={6}>
                          <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', pl: 1 }}>
                            <Typography sx={{ fontSize: 12, color: '#6B7280', fontFamily: font }}>
                              ≈ {(horasMap[aforador.id_usuario] || 4) * 4} franjas
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>

                      <Button
                        variant="contained"
                        fullWidth
                        startIcon={<Add />}
                        onClick={() => handleGenerar(aforador)}
                        disabled={generando}
                        sx={{
                          mt: 2, py: 1, borderRadius: '10px', textTransform: 'none',
                          fontFamily: font, fontWeight: 600,
                          background: 'linear-gradient(135deg, #2563EB, #003da5)',
                          '&:hover': { background: 'linear-gradient(135deg, #1d4ed8, #002a7a)' },
                        }}
                      >
                        {generando ? <CircularProgress size={20} sx={{ color: '#FFF' }} /> : 'Generar Turno'}
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </>
        )}

        {/* ── HISTORIAL DE TURNOS ── */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <HistoryIcon sx={{ fontSize: 20, color: '#6B7280' }} />
          <Typography sx={{ fontSize: 15, fontWeight: 700, color: '#1F2937', fontFamily: font }}>
            Historial de turnos
          </Typography>
          {turnosLoading && <CircularProgress size={16} sx={{ color: '#9CA3AF' }} />}
        </Box>

        <Paper data-tour="turnos-table" elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 16px rgba(0,0,0,.04)' }}>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, whiteSpace: 'nowrap', fontSize: 12, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.3px', fontFamily: font, py: 1.5, bgcolor: '#F8FAFC' }}>Aforador</TableCell>
                  <TableCell sx={{ fontWeight: 700, whiteSpace: 'nowrap', fontSize: 12, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.3px', fontFamily: font, py: 1.5, bgcolor: '#F8FAFC' }}>Fecha</TableCell>
                  <TableCell sx={{ fontWeight: 700, whiteSpace: 'nowrap', fontSize: 12, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.3px', fontFamily: font, py: 1.5, bgcolor: '#F8FAFC' }}>Inicio</TableCell>
                  <TableCell sx={{ fontWeight: 700, whiteSpace: 'nowrap', fontSize: 12, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.3px', fontFamily: font, py: 1.5, bgcolor: '#F8FAFC' }}>Fin</TableCell>
                  <TableCell sx={{ fontWeight: 700, whiteSpace: 'nowrap', fontSize: 12, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.3px', fontFamily: font, py: 1.5, bgcolor: '#F8FAFC' }}>Duración</TableCell>
                  <TableCell sx={{ fontWeight: 700, whiteSpace: 'nowrap', fontSize: 12, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.3px', fontFamily: font, py: 1.5, bgcolor: '#F8FAFC' }}>Punto / Sentido</TableCell>
                  <TableCell sx={{ fontWeight: 700, whiteSpace: 'nowrap', fontSize: 12, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.3px', fontFamily: font, py: 1.5, bgcolor: '#F8FAFC' }}>Estado</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {turnosList.length === 0 && !turnosLoading && (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 6, color: '#9CA3AF', fontFamily: font, fontSize: 13 }}>
                      No hay turnos registrados aún
                    </TableCell>
                  </TableRow>
                )}
                {turnosLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 6, color: '#9CA3AF', fontFamily: font, fontSize: 13 }}>
                      Cargando...
                    </TableCell>
                  </TableRow>
                ) : (
                  turnosList.map((t) => {
                    const inicio = new Date(t.fecha_inicio);
                    const fin = t.fecha_fin ? new Date(t.fecha_fin) : null;
                    const duracion = durMs(t.fecha_inicio, t.fecha_fin);
                    const punto = t.puntosAsignados?.[0]?.puntoAforo?.nombre_punto || '-';
                    const sentido = t.puntosAsignados?.[0]?.sentido || '-';
                    return (
                      <TableRow key={t.id_turno} hover sx={{ '&:hover': { bgcolor: '#EFF6FF' } }}>
                        <TableCell sx={{ fontSize: 13, fontFamily: font, color: '#374151', py: 1.2 }}>
                          {t.usuario?.nombres} {t.usuario?.apellidos}
                        </TableCell>
                        <TableCell sx={{ fontSize: 13, fontFamily: font, color: '#374151', py: 1.2 }}>
                          {inicio.toLocaleDateString('es-PE')}
                        </TableCell>
                        <TableCell sx={{ fontSize: 13, fontFamily: font, color: '#374151', py: 1.2 }}>
                          {inicio.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}
                        </TableCell>
                        <TableCell sx={{ fontSize: 13, fontFamily: font, color: '#374151', py: 1.2 }}>
                          {fin ? fin.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }) : '-'}
                        </TableCell>
                        <TableCell sx={{ fontSize: 13, fontFamily: font, color: '#374151', py: 1.2, fontWeight: 600 }}>
                          {duracion !== null ? `${duracion}h` : '-'}
                        </TableCell>
                        <TableCell sx={{ fontSize: 13, fontFamily: font, color: '#374151', py: 1.2 }}>
                          {punto} / {sentido}
                        </TableCell>
                        <TableCell sx={{ py: 1.2 }}>
                          <Chip
                            label={t.activo ? 'En curso' : 'Finalizado'}
                            size="small"
                            sx={{
                              fontWeight: 600, fontSize: 11, fontFamily: font,
                              bgcolor: t.activo ? '#DCFCE7' : '#F3F4F6',
                              color: t.activo ? '#16A34A' : '#6B7280',
                            }}
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert
            onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
            severity={snackbar.severity}
            variant="filled"
            sx={{ borderRadius: '12px', fontFamily: font }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
      <HelpButton steps={tours.admin.turnos} />
    </AdminLayout>
  );
}
