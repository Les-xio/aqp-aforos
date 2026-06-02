import { useState } from 'react';
import {
  Box, Typography, Tabs, Tab, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Alert,
} from '@mui/material';
import { Download as DownloadIcon } from '@mui/icons-material';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { reporteService } from '../../../application/services/reporteService';

export function ReportesPage() {
  const [tabValue, setTabValue] = useState(0);
  const [data, setData] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const loadData = async (type) => {
    try {
      setLoading(true);
      setError('');
      let res;
      if (type === 'paradas') res = await reporteService.getParadas();
      else if (type === 'colas') res = await reporteService.getColas();
      else res = await reporteService.getConteos();
      setData(res.data || []);
    } catch (err) {
      setError(err.message || 'Error al cargar');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (e, v) => {
    setTabValue(v);
    loadData(v === 0 ? 'paradas' : 'colas');
  };

  const handleExport = async (formato) => {
    try {
      const service = tabValue === 0 ? reporteService.exportarSubidasBajadas : reporteService.exportarColas;
      const res = await service({ formato });
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
      <Box sx={{ maxWidth: 1200 }}>
        <Typography variant="h5" fontWeight={700} gutterBottom>Reportes</Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <Button size="small" startIcon={<DownloadIcon />} onClick={() => handleExport('csv')}>Exportar CSV</Button>
          <Button size="small" startIcon={<DownloadIcon />} onClick={() => handleExport('xlsx')}>Exportar XLSX</Button>
        </Box>

        <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 2 }}>
          <Tab label="TAB A - Subidas y Bajadas" />
          <Tab label="TAB B - Cola Vehicular" />
        </Tabs>

        {tabValue === 0 && (
          <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: 'grey.100' }}>
                  <TableCell sx={{ fontWeight: 700 }}>ID</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Vehículo</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Suben</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Bajan</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Insatisfechos</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Fecha/Hora</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Estado</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(loading ? [] : data).length === 0 && !loading && (
                  <TableRow><TableCell colSpan={7} align="center" sx={{ py: 4 }}>Haga clic en la pestaña para cargar datos</TableCell></TableRow>
                )}
                {data.map((r, idx) => (
                  <TableRow key={r.id_parada || idx} hover>
                    <TableCell>{r.id_parada || idx + 1}</TableCell>
                    <TableCell>{r.vehiculo?.tipo || '-'}</TableCell>
                    <TableCell>{r.suben}</TableCell>
                    <TableCell>{r.bajan}</TableCell>
                    <TableCell>{r.insatisfechos}</TableCell>
                    <TableCell>{r.fecha_hora ? new Date(r.fecha_hora).toLocaleString('es-PE') : '-'}</TableCell>
                    <TableCell>{r.estado_sincronizacion}</TableCell>
                  </TableRow>
                ))}
                {loading && <TableRow><TableCell colSpan={7} align="center">Cargando...</TableCell></TableRow>}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {tabValue === 1 && (
          <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: 'grey.100' }}>
                  <TableCell sx={{ fontWeight: 700 }}>ID</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Vehículos en cola</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Observaciones</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Fecha/Hora</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Estado</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(loading ? [] : data).length === 0 && !loading && (
                  <TableRow><TableCell colSpan={5} align="center" sx={{ py: 4 }}>Haga clic en la pestaña para cargar datos</TableCell></TableRow>
                )}
                {data.map((r, idx) => (
                  <TableRow key={r.id_cola || idx} hover>
                    <TableCell>{r.id_cola || idx + 1}</TableCell>
                    <TableCell>{r.cantidad_cola}</TableCell>
                    <TableCell>{r.observaciones || '-'}</TableCell>
                    <TableCell>{r.fecha_hora ? new Date(r.fecha_hora).toLocaleString('es-PE') : '-'}</TableCell>
                    <TableCell>{r.estado_sincronizacion}</TableCell>
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
