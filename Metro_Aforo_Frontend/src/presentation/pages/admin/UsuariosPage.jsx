import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Button, TextField, MenuItem, Grid, Alert, CircularProgress,
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions,
  IconButton, Tooltip, Card, CardContent,
} from '@mui/material';
import {
  Add as AddIcon, Save as SaveIcon, Home as HomeIcon, RestorePage as ReactivarIcon,
  Person as PersonIcon, People as PeopleIcon, Search as SearchIcon,
} from '@mui/icons-material';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { DataTable } from '../../components/admin/DataTable';
import { usuarioService } from '../../../application/services/usuarioService';
import { reniecService } from '../../../application/services/reniecService';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { HelpButton } from '../../components/tours/HelpButton';
import { tours } from '../../components/tours/tourConfig';

const font = "'Inter', 'Poppins', 'Segoe UI', sans-serif";

const usuarioSchema = z.object({
  nombres: z.string().min(1, 'Requerido'),
  apellidos: z.string().min(1, 'Requerido'),
  dni: z.string().min(8, '8 dígitos').max(8),
  celular: z.string().min(9, '9 dígitos').max(9),
  correo: z.string().email('Correo inválido'),
  username: z.string().min(1, 'Requerido'),
  rol: z.string().min(1, 'Requerido'),
});

const columns = [
  { key: 'nombres', label: 'Nombres' },
  { key: 'apellidos', label: 'Apellidos' },
  { key: 'dni', label: 'DNI' },
  { key: 'correo', label: 'Correo' },
  { key: 'username', label: 'Usuario' },
  { key: 'rol', label: 'Rol', render: (v) => v?.charAt(0).toUpperCase() + v?.slice(1) },
  { key: 'activo', label: 'Estado', render: (v) => v ? 'Activo' : 'Inactivo' },
];

export function UsuariosPage() {
  const navigate = useNavigate();
  const [usuarios, setUsuarios] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [userToDeactivate, setUserToDeactivate] = useState(null);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [newPasswordTemp, setNewPasswordTemp] = useState('');
  const [newUserName, setNewUserName] = useState('');
  const [dniLoading, setDniLoading] = useState(false);

  const handleDniLookup = async () => {
    const dniVal = document.querySelector('[name="dni"]')?.value || '';
    if (dniVal.length !== 8) { setError('El DNI debe tener 8 dígitos'); return; }
    setDniLoading(true);
    setError('');
    try {
      const res = await reniecService.consultarDni(dniVal);
      const data = res.data;
      setValue('nombres', data.nombres || '');
      setValue('apellidos', [data.apellidoPaterno || '', data.apellidoMaterno || ''].filter(Boolean).join(' '));
    } catch (err) {
      setError(err.message || 'Error al consultar DNI');
    } finally {
      setDniLoading(false);
    }
  };

  const { register, handleSubmit, reset, control, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(editing ? usuarioSchema.partial() : usuarioSchema),
    defaultValues: { nombres: '', apellidos: '', dni: '', celular: '', correo: '', username: '', rol: 'aforador' },
  });

  const loadUsuarios = useCallback(async () => {
    try {
      const res = await usuarioService.listar({ page: page + 1, limit: rowsPerPage });
      setUsuarios(res.data || []);
      setTotal(res.pagination?.total || 0);
    } catch (err) {
      setError('Error al cargar usuarios');
    }
  }, [page, rowsPerPage]);

  useEffect(() => { loadUsuarios(); }, [loadUsuarios]);

  const onSubmit = async (data) => {
    try {
      setError('');
      if (editing) {
        const { dni, username, ...updateData } = data;
        await usuarioService.actualizar(editing.id_usuario, updateData);
        setSuccess('Usuario actualizado');
        reset({});
        setEditing(null);
      } else {
        const res = await usuarioService.crear(data);
        const usuario = res.data?.usuario || res.usuario;
        const pwd = res.data?.passwordTemporal || res.passwordTemporal;
        setNewPasswordTemp(pwd || '');
        setNewUserName(`${usuario?.nombres || ''} ${usuario?.apellidos || ''}`);
        setPasswordDialogOpen(true);
        reset({});
      }
      loadUsuarios();
    } catch (err) {
      setError(err.message || 'Error al guardar');
    }
  };

  const handleEdit = (row) => {
    setEditing(row);
    reset({
      nombres: row.nombres, apellidos: row.apellidos, dni: row.dni,
      celular: row.celular, correo: row.correo, username: row.username, rol: row.rol,
    });
  };

  const handleDeactivateClick = (row) => {
    setUserToDeactivate(row);
    setConfirmOpen(true);
  };

  const handleReactivar = async (row) => {
    try {
      await usuarioService.reactivar(row.id_usuario);
      setSuccess(`Usuario "${row.nombres} ${row.apellidos}" reactivado`);
      loadUsuarios();
    } catch (err) {
      setError(err.message || 'Error al reactivar');
    }
  };

  const handleConfirmDeactivate = async () => {
    if (!userToDeactivate) return;
    try {
      await usuarioService.eliminar(userToDeactivate.id_usuario);
      setSuccess(`Usuario "${userToDeactivate.nombres} ${userToDeactivate.apellidos}" desactivado`);
      loadUsuarios();
    } catch (err) {
      setError(err.message || 'Error al desactivar');
    } finally {
      setConfirmOpen(false);
      setUserToDeactivate(null);
    }
  };

  return (
    <AdminLayout>
      <Box sx={{ maxWidth: 1100, mx: 'auto', fontFamily: font }}>
        {/* ── HEADER ── */}
        <Card data-tour="usuarios-header" sx={{ borderRadius: '16px', mb: 3, boxShadow: '0 4px 16px rgba(0,0,0,.06)' }}>
          <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 }, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{
              width: 44, height: 44, borderRadius: '12px',
              background: 'linear-gradient(135deg, #1565c0, #1976d2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#FFFFFF', boxShadow: '0 4px 12px rgba(21,101,192,.3)',
            }}>
              <PeopleIcon sx={{ fontSize: 22 }} />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ fontSize: 18, fontWeight: 700, color: '#1F2937', fontFamily: font }}>
                Usuarios
              </Typography>
              <Typography sx={{ fontSize: 13, color: '#6B7280', fontFamily: font }}>
                {total} usuario{total !== 1 ? 's' : ''} registrado{total !== 1 ? 's' : ''}
              </Typography>
            </Box>
            <Button
              size="small"
              startIcon={<HomeIcon />}
              onClick={() => navigate('/admin/dashboard')}
              sx={{
                borderRadius: '10px', textTransform: 'none', fontWeight: 600, fontSize: 13,
                color: '#6B7280', '&:hover': { bgcolor: '#F3F4F6' },
              }}
            >
              Volver al inicio
            </Button>
          </CardContent>
        </Card>

        {error && <Alert severity="error" sx={{ mb: 2, borderRadius: '12px' }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2, borderRadius: '12px' }} onClose={() => setSuccess('')}>{success}</Alert>}

        {/* ── FORM ── */}
        <Card data-tour="usuarios-form" sx={{ borderRadius: '16px', mb: 3, boxShadow: '0 4px 16px rgba(0,0,0,.06)' }}>
          <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
            <Box component="form" onSubmit={handleSubmit(onSubmit)}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Box sx={{ color: '#1565c0' }}><PersonIcon /></Box>
                <Typography sx={{ fontSize: 15, fontWeight: 700, color: '#1F2937', fontFamily: font }}>
                  {editing ? 'Editar Usuario' : 'Registrar Usuario'}
                </Typography>
                {editing && (
                  <Button
                    size="small"
                    variant="text"
                    sx={{ ml: 'auto', textTransform: 'none', fontWeight: 600, fontSize: 13, color: '#6B7280' }}
                    onClick={() => { setEditing(null); reset({}); }}
                  >
                    Cancelar edición
                  </Button>
                )}
              </Box>
              <Grid container spacing={1.5}>
                <Grid size={{ xs: 6 }}>
                  <Controller name="nombres" control={control} defaultValue="" render={({ field: { value, onChange } }) => (
                    <TextField fullWidth label="Nombres" size="small" value={value} onChange={onChange} error={!!errors.nombres} helperText={errors.nombres?.message} slotProps={{ inputLabel: { shrink: true }, input: { sx: { borderRadius: '10px', bgcolor: '#F9FAFB' } } }} />
                  )} />
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Controller name="apellidos" control={control} defaultValue="" render={({ field: { value, onChange } }) => (
                    <TextField fullWidth label="Apellidos" size="small" value={value} onChange={onChange} error={!!errors.apellidos} helperText={errors.apellidos?.message} slotProps={{ inputLabel: { shrink: true }, input: { sx: { borderRadius: '10px', bgcolor: '#F9FAFB' } } }} />
                  )} />
                </Grid>
                <Grid size={{ xs: 4 }}>
                  <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'flex-start' }}>
                    <TextField fullWidth label="DNI" size="small" {...register('dni')} error={!!errors.dni} helperText={errors.dni?.message} slotProps={{ input: { sx: { borderRadius: '10px', bgcolor: '#F9FAFB' } } }} />
                    <IconButton size="small" onClick={handleDniLookup} disabled={dniLoading}
                      sx={{ mt: 0.5, bgcolor: '#DBEAFE', color: '#2563EB', borderRadius: '8px', '&:hover': { bgcolor: '#BFDBFE' } }}>
                      {dniLoading ? <CircularProgress size={18} /> : <SearchIcon fontSize="small" />}
                    </IconButton>
                  </Box>
                </Grid>
                <Grid size={{ xs: 4 }}><TextField fullWidth label="Celular" size="small" {...register('celular')} error={!!errors.celular} helperText={errors.celular?.message} slotProps={{ input: { sx: { borderRadius: '10px', bgcolor: '#F9FAFB' } } }} /></Grid>
                <Grid size={{ xs: 4 }}>
                  <TextField select fullWidth label="Rol" size="small" defaultValue="aforador" {...register('rol')} slotProps={{ input: { sx: { borderRadius: '10px', bgcolor: '#F9FAFB' } } }}>
                    <MenuItem value="administrador">Administrador</MenuItem>
                    <MenuItem value="aforador">Aforador</MenuItem>
                  </TextField>
                </Grid>
                <Grid size={{ xs: 6 }}><TextField fullWidth label="Correo" size="small" {...register('correo')} error={!!errors.correo} helperText={errors.correo?.message} slotProps={{ input: { sx: { borderRadius: '10px', bgcolor: '#F9FAFB' } } }} /></Grid>
                <Grid size={{ xs: 6 }}><TextField fullWidth label="Usuario" size="small" {...register('username')} error={!!errors.username} helperText={errors.username?.message} slotProps={{ input: { sx: { borderRadius: '10px', bgcolor: '#F9FAFB' } } }} /></Grid>
              </Grid>
              <Box sx={{ mt: 2.5, display: 'flex', gap: 1 }}>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={editing ? <SaveIcon /> : <AddIcon />}
                  sx={{
                    borderRadius: '10px', fontWeight: 700, fontSize: 13, py: 1, px: 3,
                    background: 'linear-gradient(90deg, #0D5BFF, #0052CC)',
                    boxShadow: '0 4px 12px rgba(13,91,255,.3)',
                    '&:hover': { transform: 'translateY(-1px)', boxShadow: '0 6px 16px rgba(13,91,255,.4)' },
                    transition: 'all 0.2s ease',
                  }}
                >
                  {editing ? 'Actualizar' : 'Registrar Usuario'}
                </Button>
                {editing && (
                  <Button variant="outlined" onClick={() => { setEditing(null); reset({}); }} sx={{ borderRadius: '10px', fontWeight: 600 }}>
                    Cancelar
                  </Button>
                )}
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* ── TABLE ── */}
        <div data-tour="usuarios-table">
        <DataTable
          columns={columns}
          data={usuarios}
          total={total}
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={(e, p) => setPage(p)}
          onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
          onEdit={handleEdit}
          onDelete={handleDeactivateClick}
          extraActions={(row) => !row.activo && (
            <Tooltip title="Reactivar">
              <IconButton size="small" color="success" onClick={() => handleReactivar(row)}>
                <ReactivarIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        />
      </div>

        {/* ── PASSWORD DIALOG ── */}
        <Dialog open={passwordDialogOpen} onClose={() => setPasswordDialogOpen(false)} maxWidth="xs" fullWidth>
          <DialogTitle sx={{ fontWeight: 700, color: '#1F2937' }}>Usuario registrado</DialogTitle>
          <DialogContent>
            <Typography variant="body2" gutterBottom color="#6B7280" sx={{ fontFamily: font }}>
              Usuario: <strong style={{ color: '#1F2937' }}>{newUserName}</strong>
            </Typography>
            <Typography variant="body2" gutterBottom color="#6B7280" sx={{ fontFamily: font }}>
              Contraseña temporal: <strong style={{ color: '#0D5BFF' }}>{newPasswordTemp}</strong>
            </Typography>
            <Alert severity="info" sx={{ mt: 2, borderRadius: '10px' }}>
              El usuario deberá cambiar su contraseña al iniciar sesión por primera vez.
            </Alert>
          </DialogContent>
          <DialogActions sx={{ p: 2, pt: 0 }}>
            <Button
              variant="contained"
              onClick={() => setPasswordDialogOpen(false)}
              sx={{
                borderRadius: '10px', fontWeight: 700,
                background: 'linear-gradient(90deg, #0D5BFF, #0052CC)',
              }}
            >
              Cerrar
            </Button>
          </DialogActions>
        </Dialog>

        {/* ── CONFIRM DIALOG ── */}
        <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)} maxWidth="xs" fullWidth>
          <DialogTitle sx={{ fontWeight: 700, color: '#DC2626' }}>Desactivar usuario</DialogTitle>
          <DialogContent>
            <DialogContentText sx={{ fontFamily: font }}>
              ¿Está seguro de desactivar al usuario <strong>{userToDeactivate?.nombres} {userToDeactivate?.apellidos}</strong>?
              Un usuario desactivado no podrá iniciar sesión.
            </DialogContentText>
          </DialogContent>
          <DialogActions sx={{ p: 2, pt: 0 }}>
            <Button onClick={() => setConfirmOpen(false)} sx={{ borderRadius: '10px', fontWeight: 600, color: '#6B7280' }}>
              Cancelar
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={handleConfirmDeactivate}
              sx={{ borderRadius: '10px', fontWeight: 700 }}
            >
              DESACTIVAR
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
      <HelpButton steps={tours.admin.usuarios} />
    </AdminLayout>
  );
}