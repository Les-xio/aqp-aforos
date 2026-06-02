import { useState, useEffect } from 'react';
import {
  Box, Typography, Grid, TextField, MenuItem, Button, Alert,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton,
} from '@mui/material';
import { Search as SearchIcon, Download as DownloadIcon, Visibility as ViewIcon, Block as BlockIcon } from '@mui/icons-material';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { puntoAforoService } from '../../../application/services/puntoAforoService';
import { reporteService } from '../../../application/services/reporteService';
import { turnoService } from '../../../application/services/turnoService';

export function BuscarPage() {
  const [puntos, setPuntos] = useState([]);
  const [aforadores, setAforadores] = useState([]);
  const [filtros, setFiltros] = useState({ punto_aforo_id: '', usuario_id: '', fecha_desde: '', fecha_hasta: '' });
  const [resultados, setResultados] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
      <Box sx={{ maxWidth: 1200 }}>
        <Typography variant="h5" fontWeight={700} gutterBottom>Buscar Registros</Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 2, border: '1px solid', borderColor: 'divider', mb: 3 }}>
          <Grid container spacing={1.5} alignItems="center">
            <Grid item xs={3}>
              <TextField select fullWidth label="Punto de aforo" size="small" value={filtros.punto_aforo_id} onChange={(e) => setFiltros({ ...filtros, punto_aforo_id: e.target.value })}>
                <MenuItem value="">Todos</MenuItem>
                {puntos.map((p) => <MenuItem key={p.id_punto_aforo} value={p.id_punto_aforo}>{p.nombre_punto}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={3}>
              <TextField select fullWidth label="Aforador" size="small" value={filtros.usuario_id} onChange={(e) => setFiltros({ ...filtros, usuario_id: e.target.value })}>
                <MenuItem value="">Todos</MenuItem>
                {aforadores.map((u) => <MenuItem key={u.id_usuario} value={u.id_usuario}>{u.nombres} {u.apellidos}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={2}><TextField fullWidth label="Fecha desde" type="date" size="small" InputLabelProps={{ shrink: true }} value={filtros.fecha_desde} onChange={(e) => setFiltros({ ...filtros, fecha_desde: e.target.value })} /></Grid>
            <Grid item xs={2}><TextField fullWidth label="Fecha hasta" type="date" size="small" InputLabelProps={{ shrink: true }} value={filtros.fecha_hasta} onChange={(e) => setFiltros({ ...filtros, fecha_hasta: e.target.value })} /></Grid>
            <Grid item xs={2}>
              <Button variant="contained" fullWidth startIcon={<SearchIcon />} onClick={handleBuscar} disabled={loading}>Buscar</Button>
            </Grid>
          </Grid>
          <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
            <Button size="small" startIcon={<DownloadIcon />} onClick={() => handleExport('csv')}>Exportar CSV</Button>
            <Button size="small" startIcon={<DownloadIcon />} onClick={() => handleExport('xlsx')}>Exportar XLSX</Button>
          </Box>
        </Box>

        {resultados.length > 0 && (
          <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: 'grey.100' }}>
                  <TableCell sx={{ fontWeight: 700 }}>ID</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Vehículo</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Cantidad</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Acción</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Fecha/Hora</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Estado</TableCell>
                  <TableCell sx={{ fontWeight: 700, textAlign: 'center' }}>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {resultados.map((r, idx) => (
                  <TableRow key={r.id_conteo || idx} hover>
                    <TableCell>{r.id_conteo || idx + 1}</TableCell>
                    <TableCell>{r.vehiculo?.tipo || '-'}</TableCell>
                    <TableCell>{r.cantidad}</TableCell>
                    <TableCell>{r.accion}</TableCell>
                    <TableCell>{r.fecha_hora ? new Date(r.fecha_hora).toLocaleString('es-PE') : '-'}</TableCell>
                    <TableCell>{r.estado_sincronizacion}</TableCell>
                    <TableCell align="center">
                      <IconButton size="small" color="info"><ViewIcon fontSize="small" /></IconButton>
                      <IconButton size="small" color="warning"><BlockIcon fontSize="small" /></IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>
    </AdminLayout>
  );
}
