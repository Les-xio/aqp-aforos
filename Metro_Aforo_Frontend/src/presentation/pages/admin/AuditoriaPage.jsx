import { useState, useEffect } from 'react';
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Alert,
} from '@mui/material';
import { AdminLayout } from '../../components/admin/AdminLayout';
import axiosClient from '../../../api/axiosClient';

export function AuditoriaPage() {
  const [data, setData] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await axiosClient.get('/usuarios/auditoria');
        setData(res.data || []);
      } catch (err) {
        if (err.status === 404) {
          setData([]);
        } else {
          setError('Error al cargar auditoría');
        }
      }
    };
    load();
  }, []);

  return (
    <AdminLayout>
      <Box sx={{ maxWidth: 1200 }}>
        <Typography variant="h5" fontWeight={700} gutterBottom>Auditoría</Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>Registro de solo lectura - no se permite editar ni eliminar</Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.100' }}>
                <TableCell sx={{ fontWeight: 700 }}>ID</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Usuario</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Acción</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Entidad</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Detalle</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>IP</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.length === 0 && (
                <TableRow><TableCell colSpan={6} align="center" sx={{ py: 4 }}>No hay registros de auditoría</TableCell></TableRow>
              )}
              {data.map((r, idx) => (
                <TableRow key={r.id_auditoria || idx} hover>
                  <TableCell>{r.id_auditoria || idx + 1}</TableCell>
                  <TableCell>{r.Usuario?.nombres || r.usuario_id || '-'}</TableCell>
                  <TableCell>{r.accion}</TableCell>
                  <TableCell>{r.entidad}</TableCell>
                  <TableCell sx={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {r.detalle ? JSON.stringify(r.detalle) : '-'}
                  </TableCell>
                  <TableCell>{r.direccion_ip || '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </AdminLayout>
  );
}
