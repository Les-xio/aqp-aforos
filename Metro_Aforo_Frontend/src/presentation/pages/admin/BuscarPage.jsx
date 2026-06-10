import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Grid, TextField, MenuItem, Button, Alert, Card, CardContent,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, CircularProgress,
} from '@mui/material';
import { Search as SearchIcon, Download as DownloadIcon, Home as HomeIcon, FilterList as FilterIcon } from '@mui/icons-material';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { puntoAforoService } from '../../../application/services/puntoAforoService';
import { reporteService } from '../../../application/services/reporteService';
import { turnoService } from '../../../application/services/turnoService';
import { HelpButton } from '../../components/tours/HelpButton';
import { tours } from '../../components/tours/tourConfig';

const font = "'Inter', 'Poppins', 'Segoe UI', sans-serif";

const typeGradients = {
  'Auto': 'linear-gradient(135deg, #2563EB, #60A5FA)',
  'Camion': 'linear-gradient(135deg, #D97706, #FBBF24)',
  'Camioneta': 'linear-gradient(135deg, #059669, #34D399)',
  'Moto': 'linear-gradient(135deg, #7C3AED, #A78BFA)',
  'Bus': 'linear-gradient(135deg, #DC2626, #F87171)',
  'Bicicleta': 'linear-gradient(135deg, #0891B2, #22D3EE)',
};

function getGradient(tipo) {
  return typeGradients[tipo] || 'linear-gradient(135deg, #6B7280, #9CA3AF)';
}

export function BuscarPage() {
  const navigate = useNavigate();
  const [puntos, setPuntos] = useState([]);
  const [aforadores, setAforadores] = useState([]);
  const [filtros, setFiltros] = useState({ punto_aforo_id: '', usuario_id: '', fecha_desde: '', fecha_hasta: '' });
  const [resultados, setResultados] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const totalsByType = {};
  resultados.forEach((r) => {
    const tipo = r.vehiculo?.tipo || 'Sin tipo';
    totalsByType[tipo] = (totalsByType[tipo] || 0) + (r.cantidad || 0);
  });

  useEffect(() => {
    Promise.all([
      puntoAforoService.listar(),
      turnoService.listar({ limit: 100 }),
    ]).then(([pRes, tRes]) => {
      setPuntos(pRes.data || []);
      const users = [];
      const seen = new Set();
      (tRes.data || []).forEach((t) => {
        if (t.usuario && !seen.has(t.usuario.id_usuario)) {
          seen.add(t.usuario.id_usuario);
          users.push(t.usuario);
        }
      });
      setAforadores(users);
    }).catch(() => setError('Error al cargar filtros'));
  }, []);

  const handleBuscar = async () => {
    try {
      setLoading(true);
      setError('');
      const params = {};
      if (filtros.punto_aforo_id) params.punto_aforo_id = filtros.punto_aforo_id;
      if (filtros.usuario_id) params.usuario_id = filtros.usuario_id;
      if (filtros.fecha_desde) params.fecha_desde = filtros.fecha_desde;
      if (filtros.fecha_hasta) params.fecha_hasta = filtros.fecha_hasta;

      const [conteos] = await Promise.all([
        reporteService.getConteos(params).catch(() => ({ data: [] })),
      ]);
      setResultados(conteos.data || []);
    } catch (err) {
      setError(err.message || 'Error al buscar');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (formato) => {
    try {
      const params = { formato, ...filtros };
      Object.keys(params).forEach((k) => { if (!params[k]) delete params[k]; });
      const res = await reporteService.exportarConteos(params);
      const blob = new Blob([res], { type: formato === 'csv' ? 'text/csv' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `reporte_conteos.${formato}`; a.click();
      URL.revokeObjectURL(url);
    } catch {
      setError('Error al exportar');
    }
  };

  return (
    <AdminLayout>
      <Box sx={{ maxWidth: 1200, mx: 'auto', fontFamily: font }}>
        {/* ── HEADER ── */}
        <Card data-tour="buscar-header" sx={{
          borderRadius: '20px', mb: 3, overflow: 'hidden',
          background: 'linear-gradient(135deg, #0891b2 0%, #22d3ee 100%)',
          color: '#FFFFFF', boxShadow: '0 8px 24px rgba(8,145,178,.25)',
        }}>
          <CardContent sx={{ p: 3, '&:last-child': { pb: 3 }, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{
              width: 48, height: 48, borderRadius: '14px',
              bgcolor: 'rgba(255,255,255,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <SearchIcon sx={{ fontSize: 24 }} />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ fontSize: 20, fontWeight: 700, fontFamily: font }}>Buscar Registros</Typography>
              <Typography sx={{ fontSize: 12, opacity: 0.75, fontFamily: font }}>
                {resultados.length} resultado{resultados.length !== 1 ? 's' : ''} encontrado{resultados.length !== 1 ? 's' : ''}
              </Typography>
            </Box>
            <Button size="small" startIcon={<HomeIcon />} onClick={() => navigate('/admin/dashboard')}
              sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 600, fontSize: 13, color: '#FFFFFF', bgcolor: 'rgba(255,255,255,0.15)', '&:hover': { bgcolor: 'rgba(255,255,255,0.25)' } }}>
              Volver al inicio
            </Button>
          </CardContent>
        </Card>

        {error && <Alert severity="error" sx={{ mb: 2, borderRadius: '12px' }}>{error}</Alert>}

        {/* ── FILTROS ── */}
        <Paper data-tour="buscar-filters" elevation={0} sx={{ borderRadius: '16px', mb: 3, p: 2.5, boxShadow: '0 4px 16px rgba(0,0,0,.06)' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <FilterIcon sx={{ fontSize: 18, color: '#6B7280' }} />
            <Typography sx={{ fontSize: 15, fontWeight: 700, color: '#1F2937', fontFamily: font }}>Filtros de búsqueda</Typography>
          </Box>
          <Grid container spacing={1.5} sx={{ alignItems: 'center' }}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField select fullWidth label="Punto de aforo" size="small" value={filtros.punto_aforo_id}
                onChange={(e) => setFiltros({ ...filtros, punto_aforo_id: e.target.value })}
                slotProps={{ input: { sx: { borderRadius: '10px', bgcolor: '#F9FAFB' } } }}>
                <MenuItem value="">Todos</MenuItem>
                {puntos.map((p) => <MenuItem key={p.id_punto_aforo} value={p.id_punto_aforo}>{p.nombre_punto}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField select fullWidth label="Aforador" size="small" value={filtros.usuario_id}
                onChange={(e) => setFiltros({ ...filtros, usuario_id: e.target.value })}
                slotProps={{ input: { sx: { borderRadius: '10px', bgcolor: '#F9FAFB' } } }}>
                <MenuItem value="">Todos</MenuItem>
                {aforadores.map((u) => <MenuItem key={u.id_usuario} value={u.id_usuario}>{u.nombres} {u.apellidos}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid size={{ xs: 6, sm: 3, md: 2 }}>
              <TextField fullWidth label="Fecha desde" type="date" size="small"
                value={filtros.fecha_desde} onChange={(e) => setFiltros({ ...filtros, fecha_desde: e.target.value })}
                slotProps={{ inputLabel: { shrink: true }, input: { sx: { borderRadius: '10px', bgcolor: '#F9FAFB' } } }} />
            </Grid>
            <Grid size={{ xs: 6, sm: 3, md: 2 }}>
              <TextField fullWidth label="Fecha hasta" type="date" size="small"
                value={filtros.fecha_hasta} onChange={(e) => setFiltros({ ...filtros, fecha_hasta: e.target.value })}
                slotProps={{ inputLabel: { shrink: true }, input: { sx: { borderRadius: '10px', bgcolor: '#F9FAFB' } } }} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <Button variant="contained" fullWidth startIcon={loading ? <CircularProgress size={16} sx={{ color: '#FFF' }} /> : <SearchIcon />} onClick={handleBuscar} disabled={loading}
                sx={{ borderRadius: '10px', fontWeight: 700, py: 1, textTransform: 'none', background: 'linear-gradient(90deg, #0D5BFF, #0052CC)', boxShadow: '0 4px 12px rgba(13,91,255,.3)', '&:hover': { transform: 'translateY(-1px)', boxShadow: '0 6px 16px rgba(13,91,255,.4)' }, transition: 'all 0.2s ease' }}>
                {loading ? 'Buscando...' : 'Buscar'}
              </Button>
            </Grid>
          </Grid>
          {resultados.length > 0 && (
            <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
              <Button size="small" startIcon={<DownloadIcon />} onClick={() => handleExport('csv')}
                sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 600, fontSize: 13, color: '#374151', bgcolor: '#F3F4F6', '&:hover': { bgcolor: '#E5E7EB' } }}>
                Exportar CSV
              </Button>
              <Button size="small" startIcon={<DownloadIcon />} onClick={() => handleExport('xlsx')}
                sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 600, fontSize: 13, color: '#374151', bgcolor: '#F3F4F6', '&:hover': { bgcolor: '#E5E7EB' } }}>
                Exportar XLSX
              </Button>
            </Box>
          )}
        </Paper>

        {/* ── TOTALES POR TIPO ── */}
        {Object.keys(totalsByType).length > 0 && (
          <Paper data-tour="buscar-totals" elevation={0} sx={{ borderRadius: '16px', mb: 2, p: 2, boxShadow: '0 4px 16px rgba(0,0,0,.04)', border: '1px solid #E5E7EB' }}>
            <Typography sx={{ fontSize: 14, fontWeight: 700, color: '#1F2937', mb: 1.5, fontFamily: font }}>Totales por tipo de vehículo</Typography>
            <Grid container spacing={1.5}>
              {Object.entries(totalsByType).map(([tipo, total]) => (
                <Grid size={{ xs: 6, sm: 4, md: 2 }} key={tipo}>
                  <Box sx={{
                    p: 1.5, borderRadius: '12px', textAlign: 'center',
                    background: getGradient(tipo), color: '#FFFFFF',
                    boxShadow: `0 4px 12px ${typeGradients[tipo] ? 'rgba(0,0,0,.15)' : 'rgba(0,0,0,.08)'}`,
                  }}>
                    <Typography sx={{ fontSize: 22, fontWeight: 800, fontFamily: font, lineHeight: 1.2 }}>{total}</Typography>
                    <Typography sx={{ fontSize: 11, fontWeight: 600, fontFamily: font, opacity: 0.85, textTransform: 'capitalize' }}>{tipo}</Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Paper>
        )}

        {/* ── RESULTADOS ── */}
        {resultados.length > 0 && (
          <Paper elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 16px rgba(0,0,0,.04)' }}>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, whiteSpace: 'nowrap', fontSize: 12, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.3px', fontFamily: font, py: 1.5, bgcolor: '#F8FAFC' }}>ID</TableCell>
                    <TableCell sx={{ fontWeight: 700, whiteSpace: 'nowrap', fontSize: 12, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.3px', fontFamily: font, py: 1.5, bgcolor: '#F8FAFC' }}>Vehículo</TableCell>
                    <TableCell sx={{ fontWeight: 700, whiteSpace: 'nowrap', fontSize: 12, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.3px', fontFamily: font, py: 1.5, bgcolor: '#F8FAFC' }}>Cantidad</TableCell>
                    <TableCell sx={{ fontWeight: 700, whiteSpace: 'nowrap', fontSize: 12, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.3px', fontFamily: font, py: 1.5, bgcolor: '#F8FAFC' }}>Acción</TableCell>
                    <TableCell sx={{ fontWeight: 700, whiteSpace: 'nowrap', fontSize: 12, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.3px', fontFamily: font, py: 1.5, bgcolor: '#F8FAFC' }}>Fecha/Hora</TableCell>
                    <TableCell sx={{ fontWeight: 700, whiteSpace: 'nowrap', fontSize: 12, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.3px', fontFamily: font, py: 1.5, bgcolor: '#F8FAFC' }}>Estado</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {resultados.map((r, idx) => (
                    <TableRow key={r.id_conteo || idx} hover sx={{ '&:hover': { bgcolor: '#EFF6FF' }, '&:nth-of-type(even)': { bgcolor: '#FAFBFC' } }}>
                      <TableCell sx={{ fontSize: 13, fontFamily: font, color: '#374151', py: 1.2 }}>{r.id_conteo || idx + 1}</TableCell>
                      <TableCell sx={{ fontSize: 13, fontFamily: font, color: '#374151', py: 1.2 }}>
                        <Chip label={r.vehiculo?.tipo || '-'} size="small"
                          sx={{ fontWeight: 600, fontSize: 11, fontFamily: font, background: getGradient(r.vehiculo?.tipo), color: '#FFFFFF' }} />
                      </TableCell>
                      <TableCell sx={{ fontSize: 13, fontFamily: font, color: '#374151', py: 1.2, fontWeight: 600 }}>{r.cantidad}</TableCell>
                      <TableCell sx={{ fontSize: 13, fontFamily: font, color: '#374151', py: 1.2 }}>
                        <Chip label={r.accion} size="small"
                          sx={{ fontWeight: 600, fontSize: 11, fontFamily: font, bgcolor: r.accion === '+1' ? '#DCFCE7' : '#FEE2E2', color: r.accion === '+1' ? '#16A34A' : '#DC2626' }} />
                      </TableCell>
                      <TableCell sx={{ fontSize: 13, fontFamily: font, color: '#374151', py: 1.2 }}>{r.fecha_hora ? new Date(r.fecha_hora).toLocaleString('es-PE') : '-'}</TableCell>
                      <TableCell sx={{ fontSize: 13, fontFamily: font, color: '#374151', py: 1.2 }}>
                        <Chip label={r.estado_sincronizacion} size="small"
                          sx={{ fontWeight: 600, fontSize: 10, fontFamily: font, bgcolor: r.estado_sincronizacion === 'SINCRONIZADO' ? '#DBEAFE' : '#FEF3C7', color: r.estado_sincronizacion === 'SINCRONIZADO' ? '#2563EB' : '#D97706' }} />
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow sx={{ bgcolor: '#EFF6FF' }}>
                    <TableCell sx={{ fontSize: 13, fontFamily: font, color: '#1F2937', py: 1.5, fontWeight: 700 }}>
                      Total vehículos
                    </TableCell>
                    <TableCell sx={{ fontSize: 13, fontFamily: font, color: '#1F2937', py: 1.5 }} />
                    <TableCell sx={{ fontSize: 15, fontFamily: font, color: '#0D5BFF', py: 1.5, fontWeight: 800 }}>
                      {Object.values(totalsByType).reduce((a, b) => a + b, 0)}
                    </TableCell>
                    <TableCell sx={{ fontSize: 13, fontFamily: font, color: '#1F2937', py: 1.5 }} />
                    <TableCell sx={{ fontSize: 13, fontFamily: font, color: '#1F2937', py: 1.5 }} />
                    <TableCell sx={{ fontSize: 13, fontFamily: font, color: '#1F2937', py: 1.5 }} />
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        )}
      </Box>
      <HelpButton steps={tours.admin.buscar} />
    </AdminLayout>
  );
}