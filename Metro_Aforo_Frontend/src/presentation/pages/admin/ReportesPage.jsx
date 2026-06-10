import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Tabs, Tab, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Alert, TextField, MenuItem, Grid,
} from '@mui/material';
import { Download as DownloadIcon, Assessment as AssessmentIcon, Home as HomeIcon, Search as SearchIcon } from '@mui/icons-material';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { reporteService } from '../../../application/services/reporteService';
import { puntoAforoService } from '../../../application/services/puntoAforoService';
import { turnoService } from '../../../application/services/turnoService';
import { usuarioService } from '../../../application/services/usuarioService';
import { HelpButton } from '../../components/tours/HelpButton';
import { tours } from '../../components/tours/tourConfig';

const font = "'Inter', 'Poppins', 'Segoe UI', sans-serif";

const tableHeadSx = { fontWeight: 700, whiteSpace: 'nowrap', fontSize: 12, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.3px', fontFamily: font, py: 1.5, bgcolor: '#F8FAFC' };
const cellSx = { fontSize: 13, fontFamily: font, color: '#374151', py: 1.2 };

export function ReportesPage() {
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [data, setData] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [puntos, setPuntos] = useState([]);
  const [aforadores, setAforadores] = useState([]);
  const [filtros, setFiltros] = useState({
    puntoAforoId: '', aforadorId: '', fechaInicio: '', fechaFin: '',
  });

  useEffect(() => {
    Promise.all([
      puntoAforoService.listar(),
      usuarioService.listar({ rol: 'aforador', activo: true }),
    ]).then(([pRes, uRes]) => {
      setPuntos(pRes.data || []);
      setAforadores(uRes.data || []);
    }).catch(() => setError('Error al cargar filtros'));
  }, []);

  const buildParams = () => {
    const params = {};
    if (filtros.puntoAforoId) params.puntoAforoId = filtros.puntoAforoId;
    if (filtros.aforadorId) params.aforadorId = filtros.aforadorId;
    if (filtros.fechaInicio) params.fechaInicio = filtros.fechaInicio;
    if (filtros.fechaFin) params.fechaFin = filtros.fechaFin;
    return params;
  };

  const loadData = async (type) => {
    try {
      setLoading(true);
      setError('');
      const params = buildParams();
      let res;
      if (type === 'paradas') res = await reporteService.getParadas(params);
      else if (type === 'colas') res = await reporteService.getColas(params);
      else res = await reporteService.getConteos(params);
      setData(res.data || []);
    } catch (err) {
      setError(err.message || 'Error al cargar');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (e, v) => {
    setTabValue(v);
    setData([]);
  };

  const handleBuscar = () => {
    loadData(tabValue === 0 ? 'paradas' : 'colas');
  };

  const handleExport = async (formato) => {
    try {
      const params = { ...buildParams(), formato };
      const service = tabValue === 0 ? reporteService.exportarSubidasBajadas : reporteService.exportarColas;
      const res = await service(params);
      const blob = new Blob([res], { type: formato === 'csv' ? 'text/csv' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `reporte_${tabValue === 0 ? 'paradas' : 'colas'}.${formato}`; a.click();
      URL.revokeObjectURL(url);
    } catch {
      setError('Error al exportar');
    }
  };

  return (
    <AdminLayout>
      <Box sx={{ maxWidth: 1200, mx: 'auto', fontFamily: font }}>
        {/* ── HEADER ── */}
        <Paper data-tour="reportes-header" elevation={0} sx={{ borderRadius: '16px', mb: 3, p: 2.5, boxShadow: '0 4px 16px rgba(0,0,0,.06)', display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{
            width: 44, height: 44, borderRadius: '12px',
            background: 'linear-gradient(135deg, #dc2626, #f87171)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#FFF', boxShadow: '0 4px 12px rgba(220,38,38,.3)',
          }}>
            <AssessmentIcon sx={{ fontSize: 22 }} />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography sx={{ fontSize: 18, fontWeight: 700, color: '#1F2937', fontFamily: font }}>Reportes</Typography>
            <Typography sx={{ fontSize: 13, color: '#6B7280', fontFamily: font }}>
              {data.length} registro{data.length !== 1 ? 's' : ''}
            </Typography>
          </Box>
          <Button size="small" startIcon={<HomeIcon />} onClick={() => navigate('/admin/dashboard')}
            sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 600, fontSize: 13, color: '#6B7280', '&:hover': { bgcolor: '#F3F4F6' } }}>
            Volver al inicio
          </Button>
          <Box data-tour="reportes-export" sx={{ display: 'flex', gap: 1 }}>
            <Button size="small" startIcon={<DownloadIcon />} onClick={() => handleExport('csv')}
              sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 600, fontSize: 13, color: '#374151', bgcolor: '#F3F4F6', '&:hover': { bgcolor: '#E5E7EB' } }}>
              Exportar CSV
            </Button>
            <Button size="small" startIcon={<DownloadIcon />} onClick={() => handleExport('xlsx')}
              sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 600, fontSize: 13, color: '#374151', bgcolor: '#F3F4F6', '&:hover': { bgcolor: '#E5E7EB' } }}>
              Exportar XLSX
            </Button>
          </Box>
        </Paper>

        {error && <Alert severity="error" sx={{ mb: 2, borderRadius: '12px' }}>{error}</Alert>}

        {/* ── FILTROS ── */}
        <Paper data-tour="reportes-filters" elevation={0} sx={{ borderRadius: '16px', mb: 3, p: 2.5, boxShadow: '0 4px 16px rgba(0,0,0,.06)' }}>
          <Typography sx={{ fontSize: 15, fontWeight: 700, color: '#1F2937', mb: 2, fontFamily: font }}>Filtros</Typography>
          <Grid container spacing={1.5} sx={{ alignItems: 'center' }}>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField select fullWidth label="Paradero" size="small" value={filtros.puntoAforoId}
                onChange={(e) => setFiltros({ ...filtros, puntoAforoId: e.target.value })}
                slotProps={{ input: { sx: { borderRadius: '10px', bgcolor: '#F9FAFB' } } }}>
                <MenuItem value="">Todos</MenuItem>
                {puntos.map((p) => <MenuItem key={p.id_punto_aforo} value={p.id_punto_aforo}>{p.nombre_punto}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField select fullWidth label="Aforador" size="small" value={filtros.aforadorId}
                onChange={(e) => setFiltros({ ...filtros, aforadorId: e.target.value })}
                slotProps={{ input: { sx: { borderRadius: '10px', bgcolor: '#F9FAFB' } } }}>
                <MenuItem value="">Todos</MenuItem>
                {aforadores.map((u) => <MenuItem key={u.id_usuario} value={u.id_usuario}>{u.nombres} {u.apellidos}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, md: 2 }}>
              <TextField fullWidth label="Fecha desde" type="date" size="small" value={filtros.fechaInicio}
                onChange={(e) => setFiltros({ ...filtros, fechaInicio: e.target.value })}
                slotProps={{ inputLabel: { shrink: true }, input: { sx: { borderRadius: '10px', bgcolor: '#F9FAFB' } }, htmlInput: { sx: { '&::-webkit-datetime-edit': { color: '#6B7280' } } } }} />
            </Grid>
            <Grid size={{ xs: 12, md: 2 }}>
              <TextField fullWidth label="Fecha hasta" type="date" size="small" value={filtros.fechaFin}
                onChange={(e) => setFiltros({ ...filtros, fechaFin: e.target.value })}
                slotProps={{ inputLabel: { shrink: true }, input: { sx: { borderRadius: '10px', bgcolor: '#F9FAFB' } }, htmlInput: { sx: { '&::-webkit-datetime-edit': { color: '#6B7280' } } } }} />
            </Grid>
            <Grid size={{ xs: 12, md: 2 }}>
              <Button variant="contained" fullWidth startIcon={<SearchIcon />} onClick={handleBuscar} disabled={loading}
                sx={{ borderRadius: '10px', fontWeight: 700, py: 1, textTransform: 'none', background: 'linear-gradient(90deg, #0D5BFF, #0052CC)', boxShadow: '0 4px 12px rgba(13,91,255,.3)', '&:hover': { transform: 'translateY(-1px)', boxShadow: '0 6px 16px rgba(13,91,255,.4)' }, transition: 'all 0.2s ease' }}>
                Buscar
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {/* ── TABS ── */}
        <Tabs data-tour="reportes-tabs" value={tabValue} onChange={handleTabChange} sx={{
          mb: 3, '& .MuiTab-root': { textTransform: 'none', fontWeight: 600, fontFamily: font, fontSize: 14 },
          '& .Mui-selected': { color: '#2563EB' },
          '& .MuiTabs-indicator': { bgcolor: '#2563EB' },
        }}>
          <Tab label="TAB A - Subidas y Bajadas" />
          <Tab label="TAB B - Cola Vehicular" />
        </Tabs>

        {/* ── TABLA ── */}
        <Paper elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 16px rgba(0,0,0,.04)' }}>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  {tabValue === 0 ? (
                    <>
                      <TableCell sx={tableHeadSx}>ID</TableCell>
                      <TableCell sx={tableHeadSx}>Vehículo</TableCell>
                      <TableCell sx={tableHeadSx}>Suben</TableCell>
                      <TableCell sx={tableHeadSx}>Bajan</TableCell>
                      <TableCell sx={tableHeadSx}>Insatisfechos</TableCell>
                      <TableCell sx={tableHeadSx}>Fecha/Hora</TableCell>
                      <TableCell sx={tableHeadSx}>Estado</TableCell>
                    </>
                  ) : (
                    <>
                      <TableCell sx={tableHeadSx}>ID</TableCell>
                      <TableCell sx={tableHeadSx}>Cantidad en cola</TableCell>
                      <TableCell sx={tableHeadSx}>Observaciones</TableCell>
                      <TableCell sx={tableHeadSx}>Fecha/Hora</TableCell>
                      <TableCell sx={tableHeadSx}>Estado</TableCell>
                    </>
                  )}
                </TableRow>
              </TableHead>
              <TableBody>
                {!loading && data.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={tabValue === 0 ? 7 : 5} align="center" sx={{ py: 6, color: '#9CA3AF', fontFamily: font, fontSize: 13 }}>
                      Use los filtros y haga clic en Buscar para cargar datos
                    </TableCell>
                  </TableRow>
                )}
                {tabValue === 0 && data.map((r, idx) => (
                  <TableRow key={r.id_parada || idx} hover sx={{ '&:hover': { bgcolor: '#EFF6FF' } }}>
                    <TableCell sx={cellSx}>{r.id_parada || idx + 1}</TableCell>
                    <TableCell sx={cellSx}>{r.vehiculo?.tipo || '-'}</TableCell>
                    <TableCell sx={cellSx}>{r.suben}</TableCell>
                    <TableCell sx={cellSx}>{r.bajan}</TableCell>
                    <TableCell sx={cellSx}>{r.insatisfechos}</TableCell>
                    <TableCell sx={cellSx}>{r.fecha_hora ? new Date(r.fecha_hora).toLocaleString('es-PE') : '-'}</TableCell>
                    <TableCell sx={cellSx}>{r.estado_sincronizacion}</TableCell>
                  </TableRow>
                ))}
                {tabValue === 1 && data.map((r, idx) => (
                  <TableRow key={r.id_cola || idx} hover sx={{ '&:hover': { bgcolor: '#EFF6FF' } }}>
                    <TableCell sx={cellSx}>{r.id_cola || idx + 1}</TableCell>
                    <TableCell sx={cellSx}>{r.cantidad_cola}</TableCell>
                    <TableCell sx={cellSx}>{r.observaciones || '-'}</TableCell>
                    <TableCell sx={cellSx}>{r.fecha_hora ? new Date(r.fecha_hora).toLocaleString('es-PE') : '-'}</TableCell>
                    <TableCell sx={cellSx}>{r.estado_sincronizacion}</TableCell>
                  </TableRow>
                ))}
                {loading && (
                  <TableRow>
                    <TableCell colSpan={tabValue === 0 ? 7 : 5} align="center" sx={{ py: 6, color: '#9CA3AF', fontFamily: font, fontSize: 13 }}>
                      Cargando...
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Box>
      <HelpButton steps={tours.admin.reportes} />
    </AdminLayout>
  );
}