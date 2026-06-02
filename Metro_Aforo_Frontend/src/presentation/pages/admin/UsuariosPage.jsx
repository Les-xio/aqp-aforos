import { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Button, TextField, MenuItem, Grid, Alert,
} from '@mui/material';
import { Add as AddIcon, Save as SaveIcon } from '@mui/icons-material';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { DataTable } from '../../components/admin/DataTable';
import { usuarioService } from '../../../application/services/usuarioService';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const usuarioSchema = z.object({
  nombres: z.string().min(1, 'Requerido'),
  apellidos: z.string().min(1, 'Requerido'),
  dni: z.string().min(8, '8 dígitos').max(8),
  celular: z.string().min(9, '9 dígitos').max(9),
  correo: z.string().email('Correo inválido'),
  user: z.string().min(1, 'Requerido'),
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
  const [usuarios, setUsuarios] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(editing ? usuarioSchema.partial() : usuarioSchema),
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
        const { dni, user, ...updateData } = data;
        await usuarioService.actualizar(editing.id_usuario, updateData);
        setSuccess('Usuario actualizado');
      } else {
        await usuarioService.crear(data);
        setSuccess('Usuario registrado');
      }
      reset({});
      setEditing(null);
      loadUsuarios();
    } catch (err) {
      setError(err.message || 'Error al guardar');
    }
  };

  const handleEdit = (row) => {
    setEditing(row);
    reset({
      nombres: row.nombres, apellidos: row.apellidos, dni: row.dni,
      celular: row.celular, correo: row.correo, user: row.username, rol: row.rol,
    });
  };

  const handleDelete = async (row) => {
    try {
      await usuarioService.eliminar(row.id_usuario);
      setSuccess('Usuario desactivado');
      loadUsuarios();
    } catch (err) {
      setError(err.message || 'Error al eliminar');
    }
  };

  return (
    <AdminLayout>
      <Box sx={{ maxWidth: 1000 }}>
        <Typography variant="h5" fontWeight={700} gutterBottom>Usuarios</Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

        <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mb: 3, p: 2, bgcolor: 'background.paper', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>
            {editing ? 'Editar Usuario' : 'Registrar Usuario'}
          </Typography>
          <Grid container spacing={1.5}>
            <Grid item xs={6}><TextField fullWidth label="Nombres" size="small" {...register('nombres')} error={!!errors.nombres} helperText={errors.nombres?.message} /></Grid>
            <Grid item xs={6}><TextField fullWidth label="Apellidos" size="small" {...register('apellidos')} error={!!errors.apellidos} helperText={errors.apellidos?.message} /></Grid>
            <Grid item xs={4}><TextField fullWidth label="DNI" size="small" {...register('dni')} error={!!errors.dni} helperText={errors.dni?.message} /></Grid>
            <Grid item xs={4}><TextField fullWidth label="Celular" size="small" {...register('celular')} error={!!errors.celular} helperText={errors.celular?.message} /></Grid>
            <Grid item xs={4}>
              <TextField select fullWidth label="Rol" size="small" defaultValue="aforador" {...register('rol')}>
                <MenuItem value="administrador">Administrador</MenuItem>
                <MenuItem value="aforador">Aforador</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={6}><TextField fullWidth label="Correo" size="small" {...register('correo')} error={!!errors.correo} helperText={errors.correo?.message} /></Grid>
            <Grid item xs={6}><TextField fullWidth label="Usuario" size="small" {...register('user')} error={!!errors.user} helperText={errors.user?.message} /></Grid>
          </Grid>
          <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
            <Button type="submit" variant="contained" startIcon={editing ? <SaveIcon /> : <AddIcon />}>
              {editing ? 'Actualizar' : 'Registrar Usuario'}
            </Button>
            {editing && <Button variant="outlined" onClick={() => { setEditing(null); reset({}); }}>Cancelar</Button>}
          </Box>
        </Box>

        <DataTable
          columns={columns}
          data={usuarios}
          total={total}
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={(e, p) => setPage(p)}
          onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </Box>
    </AdminLayout>
  );
}
