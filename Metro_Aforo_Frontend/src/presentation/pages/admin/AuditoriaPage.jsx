import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Alert, Button,
} from '@mui/material';
import { Security as SecurityIcon, Home as HomeIcon } from '@mui/icons-material';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { usuarioService } from '../../../application/services/usuarioService';
import { HelpButton } from '../../components/tours/HelpButton';
import { tours } from '../../components/tours/tourConfig';

const font = "'Inter', 'Poppins', 'Segoe UI', sans-serif";

const tableHeadSx = { fontWeight: 700, whiteSpace: 'nowrap', fontSize: 12, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.3px', fontFamily: font, py: 1.5, bgcolor: '#F8FAFC' };
const cellSx = { fontSize: 13, fontFamily: font, color: '#374151', py: 1.2 };

export function AuditoriaPage() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await usuarioService.getAuditoria();
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
      <Box sx={{ maxWidth: 1200, mx: 'auto', fontFamily: font }}>
        {/* ── HEADER ── */}
        <Paper data-tour="auditoria-header" elevation={0} sx={{ borderRadius: '16px', mb: 3, p: 2.5, boxShadow: '0 4px 16px rgba(0,0,0,.06)', display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{
            width: 44, height: 44, borderRadius: '12px',
            background: 'linear-gradient(135deg, #6b21a8, #a855f7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#FFF', boxShadow: '0 4px 12px rgba(107,33,168,.3)',
          }}>
            <SecurityIcon sx={{ fontSize: 22 }} />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography sx={{ fontSize: 18, fontWeight: 700, color: '#1F2937', fontFamily: font }}>Auditoría</Typography>
            <Typography sx={{ fontSize: 13, color: '#6B7280', fontFamily: font }}>
              Registro de solo lectura — {data.length} registro{data.length !== 1 ? 's' : ''}
            </Typography>
          </Box>
          <Button size="small" startIcon={<HomeIcon />} onClick={() => navigate('/admin/dashboard')}
            sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 600, fontSize: 13, color: '#6B7280', '&:hover': { bgcolor: '#F3F4F6' } }}>
            Volver al inicio
          </Button>
        </Paper>

        {error && <Alert severity="error" sx={{ mb: 2, borderRadius: '12px' }}>{error}</Alert>}

        {/* ── TABLA ── */}
        <Paper data-tour="auditoria-table" elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 16px rgba(0,0,0,.04)' }}>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={tableHeadSx}>ID</TableCell>
                  <TableCell sx={tableHeadSx}>Usuario</TableCell>
                  <TableCell sx={tableHeadSx}>Rol</TableCell>
                  <TableCell sx={tableHeadSx}>Acción</TableCell>
                  <TableCell sx={tableHeadSx}>Entidad afectada</TableCell>
                  <TableCell sx={tableHeadSx}>Detalle</TableCell>
                  <TableCell sx={tableHeadSx}>IP</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 6, color: '#9CA3AF', fontFamily: font, fontSize: 13 }}>
                      No hay registros de auditoría
                    </TableCell>
                  </TableRow>
                )}
                {data.map((r, idx) => (
                  <TableRow key={r.id_auditoria || idx} hover sx={{ '&:hover': { bgcolor: '#EFF6FF' } }}>
                    <TableCell sx={cellSx}>{r.id_auditoria || idx + 1}</TableCell>
                    <TableCell sx={cellSx}>
                      {r.usuario?.nombres
                        ? `${r.usuario.nombres} ${r.usuario.apellidos}`
                        : r.usuario?.correo || r.usuario?.username || `ID ${r.usuario_id}` || '-'}
                    </TableCell>
                    <TableCell sx={cellSx}>
                      {r.usuario?.rol ? r.usuario.rol.charAt(0).toUpperCase() + r.usuario.rol.slice(1) : '-'}
                    </TableCell>
                    <TableCell sx={cellSx}>{r.accion}</TableCell>
                    <TableCell sx={cellSx}>{r.entidad}</TableCell>
                    <TableCell sx={{ ...cellSx, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                      {r.detalle ? JSON.stringify(r.detalle, null, 2) : '-'}
                    </TableCell>
                    <TableCell sx={cellSx}>{r.direccion_ip || '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Box>
      <HelpButton steps={tours.admin.auditoria} />
    </AdminLayout>
  );
}