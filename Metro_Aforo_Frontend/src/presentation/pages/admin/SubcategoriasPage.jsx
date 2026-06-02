import { useState, useEffect, useCallback } from 'react';
import { Box, Typography, Button, TextField, MenuItem, Grid, Alert } from '@mui/material';
import { Add as AddIcon, Save as SaveIcon } from '@mui/icons-material';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { DataTable } from '../../components/admin/DataTable';
import { vehiculoService } from '../../../application/services/vehiculoService';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const subcategoriaSchema = z.object({
  categoria_id: z.string().min(1, 'Requerido'),
  nombre: z.string().min(1, 'Requerido'),
  descripcion: z.string().optional(),
});

const columns = [
  { key: 'id_subcategoria', label: 'ID' },
  { key: 'nombre', label: 'Nombre' },
  { key: 'descripcion', label: 'Descripción', render: (v) => v || '-' },
  { key: 'categoria_nombre', label: 'Categoría', render: (v, row) => row.categoria?.nombre || '-' },
];

export function SubcategoriasPage() {
  const [data, setData] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { register, handleSubmit, reset, formState: { errors } } = useForm({ resolver: zodResolver(subcategoriaSchema) });

  const load = useCallback(async () => {
    try {
      const [catRes] = await Promise.all([
        vehiculoService.getCategorias(),
      ]);
      setCategorias(catRes.data || []);
      const subcats = [];
      (catRes.data || []).forEach((cat) => {
        (cat.subcategorias || []).forEach((sub) => {
          subcats.push({ ...sub, categoria_nombre: cat.nombre, categoria: cat });
        });
      });
      setData(subcats);
    } catch { setError('Error al cargar'); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const onSubmit = async (formData) => {
    try {
      setError('');
      const payload = { ...formData, categoria_id: Number(formData.categoria_id) };
      if (editing) {
        await vehiculoService.actualizarSubcategoria(editing.id_subcategoria, payload);
        setSuccess('Actualizada');
      } else {
        await vehiculoService.crearSubcategoria(payload);
        setSuccess('Registrada');
      }
      reset({}); setEditing(null); load();
    } catch (err) { setError(err.message || 'Error'); }
  };

  const handleEdit = (row) => {
    setEditing(row);
    reset({ categoria_id: row.categoria_id?.toString() || '', nombre: row.nombre, descripcion: row.descripcion });
  };

  const handleDelete = async (row) => {
    try { await vehiculoService.eliminarSubcategoria(row.id_subcategoria); setSuccess('Eliminada'); load(); }
    catch (err) { setError(err.message || 'Error'); }
  };

  return (
    <AdminLayout>
      <Box sx={{ maxWidth: 1000 }}>
        <Typography variant="h5" fontWeight={700} gutterBottom>Subcategorías Vehiculares</Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

        <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mb: 3, p: 2, bgcolor: 'background.paper', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>{editing ? 'Editar' : 'Registrar'} Subcategoría</Typography>
          <Grid container spacing={1.5}>
            <Grid item xs={4}>
              <TextField select fullWidth label="Categoría" size="small" {...register('categoria_id')} error={!!errors.categoria_id}>
                <MenuItem value="">-- Seleccione --</MenuItem>
                {categorias.map((c) => <MenuItem key={c.id_categoria} value={c.id_categoria}>{c.nombre}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={4}><TextField fullWidth label="Nombre" size="small" {...register('nombre')} error={!!errors.nombre} helperText={errors.nombre?.message} /></Grid>
            <Grid item xs={4}><TextField fullWidth label="Descripción" size="small" {...register('descripcion')} /></Grid>
          </Grid>
          <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
            <Button type="submit" variant="contained" startIcon={editing ? <SaveIcon /> : <AddIcon />}>{editing ? 'Actualizar' : 'Registrar Subcategoría'}</Button>
            {editing && <Button variant="outlined" onClick={() => { setEditing(null); reset({}); }}>Cancelar</Button>}
          </Box>
        </Box>
        <DataTable columns={columns} data={data} total={data.length} page={0} rowsPerPage={data.length} onEdit={handleEdit} onDelete={handleDelete} />
      </Box>
    </AdminLayout>
  );
}
