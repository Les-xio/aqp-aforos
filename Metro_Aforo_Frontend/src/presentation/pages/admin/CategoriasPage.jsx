import { useState, useEffect, useCallback } from 'react';
import { Box, Typography, Button, TextField, Grid, Alert } from '@mui/material';
import { Add as AddIcon, Save as SaveIcon } from '@mui/icons-material';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { DataTable } from '../../components/admin/DataTable';
import { vehiculoService } from '../../../application/services/vehiculoService';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const categoriaSchema = z.object({
  nombre: z.string().min(1, 'Requerido'),
  descripcion: z.string().optional(),
});

const columns = [
  { key: 'id_categoria', label: 'ID' },
  { key: 'nombre', label: 'Nombre' },
  { key: 'descripcion', label: 'Descripción', render: (v) => v || '-' },
];

export function CategoriasPage() {
  const [data, setData] = useState([]);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { register, handleSubmit, reset, formState: { errors } } = useForm({ resolver: zodResolver(categoriaSchema) });

  const load = useCallback(async () => {
    try { const res = await vehiculoService.getCategorias(); setData(res.data || []); }
    catch { setError('Error al cargar'); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const onSubmit = async (formData) => {
    try {
      setError('');
      if (editing) {
        await vehiculoService.actualizarCategoria(editing.id_categoria, formData);
        setSuccess('Categoría actualizada');
      } else {
        await vehiculoService.crearCategoria(formData);
        setSuccess('Categoría registrada');
      }
      reset({}); setEditing(null); load();
    } catch (err) { setError(err.message || 'Error al guardar'); }
  };

  const handleEdit = (row) => { setEditing(row); reset({ nombre: row.nombre, descripcion: row.descripcion }); };
  const handleDelete = async (row) => {
    try { await vehiculoService.eliminarCategoria(row.id_categoria); setSuccess('Eliminada'); load(); }
    catch (err) { setError(err.message || 'Error'); }
  };

  return (
    <AdminLayout>
      <Box sx={{ maxWidth: 1000 }}>
        <Typography variant="h5" fontWeight={700} gutterBottom>Categorías Vehiculares</Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

        <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mb: 3, p: 2, bgcolor: 'background.paper', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>{editing ? 'Editar' : 'Registrar'} Categoría</Typography>
          <Grid container spacing={1.5}>
            <Grid item xs={6}><TextField fullWidth label="Nombre" size="small" {...register('nombre')} error={!!errors.nombre} helperText={errors.nombre?.message} /></Grid>
            <Grid item xs={6}><TextField fullWidth label="Descripción" size="small" {...register('descripcion')} /></Grid>
          </Grid>
          <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
            <Button type="submit" variant="contained" startIcon={editing ? <SaveIcon /> : <AddIcon />}>{editing ? 'Actualizar' : 'Registrar Categoría'}</Button>
            {editing && <Button variant="outlined" onClick={() => { setEditing(null); reset({}); }}>Cancelar</Button>}
          </Box>
        </Box>
        <DataTable columns={columns} data={data} total={data.length} page={0} rowsPerPage={data.length} onEdit={handleEdit} onDelete={handleDelete} />
      </Box>
    </AdminLayout>
  );
}
