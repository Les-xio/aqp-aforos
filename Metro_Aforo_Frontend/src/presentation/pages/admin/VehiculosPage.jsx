import { useState, useEffect, useCallback } from 'react';
import { Box, Typography, Button, TextField, MenuItem, Grid, Alert } from '@mui/material';
import { Add as AddIcon, Save as SaveIcon } from '@mui/icons-material';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { DataTable } from '../../components/admin/DataTable';
import { vehiculoService } from '../../../application/services/vehiculoService';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const vehiculoSchema = z.object({
  subcategoria_id: z.string().min(1, 'Requerido'),
  tipo: z.string().min(1, 'Requerido'),
});

const columns = [
  { key: 'id_vehiculo', label: 'ID' },
  { key: 'tipo', label: 'Tipo' },
  { key: 'subcategoria_nombre', label: 'Subcategoría', render: (v, row) => row.subcategoria?.nombre || '-' },
  { key: 'activo', label: 'Estado', render: (v) => v ? 'Activo' : 'Inactivo' },
];

export function VehiculosPage() {
  const [data, setData] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { register, handleSubmit, reset, formState: { errors } } = useForm({ resolver: zodResolver(vehiculoSchema) });

  const load = useCallback(async () => {
    try {
      const [catRes, vehRes] = await Promise.all([
        vehiculoService.getCategorias(),
        vehiculoService.listar(),
      ]);
      setCategorias(catRes.data || []);
      setData(vehRes.data || []);
    } catch { setError('Error al cargar'); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const onSubmit = async (formData) => {
    try {
      setError('');
      const payload = { subcategoria_id: Number(formData.subcategoria_id), tipo: formData.tipo };
      if (editing) {
        await vehiculoService.actualizar(editing.id_vehiculo, payload);
        setSuccess('Actualizado');
      } else {
        await vehiculoService.crear(payload);
        setSuccess('Registrado');
      }
      reset({}); setEditing(null); load();
    } catch (err) { setError(err.message || 'Error'); }
  };

  const handleEdit = (row) => {
    setEditing(row);
    reset({ subcategoria_id: row.subcategoria_id?.toString() || '', tipo: row.tipo });
  };

  const handleDelete = async (row) => {
    try { await vehiculoService.eliminar(row.id_vehiculo); setSuccess('Eliminado'); load(); }
    catch (err) { setError(err.message || 'Error'); }
  };

  const allSubcats = [];
  (categorias || []).forEach((cat) => {
    (cat.subcategorias || []).forEach((sub) => {
      allSubcats.push({ ...sub, categoriaNombre: cat.nombre });
    });
  });

  return (
    <AdminLayout>
      <Box sx={{ maxWidth: 1000 }}>
        <Typography variant="h5" fontWeight={700} gutterBottom>Vehículos</Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

        <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mb: 3, p: 2, bgcolor: 'background.paper', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>{editing ? 'Editar' : 'Registrar'} Vehículo</Typography>
          <Grid container spacing={1.5}>
            <Grid item xs={6}>
              <TextField select fullWidth label="Subcategoría" size="small" {...register('subcategoria_id')} error={!!errors.subcategoria_id}>
                <MenuItem value="">-- Seleccione --</MenuItem>
                {allSubcats.map((s) => <MenuItem key={s.id_subcategoria} value={s.id_subcategoria}>{s.categoriaNombre} - {s.nombre}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={6}><TextField fullWidth label="Tipo (auto, taxi, bus...)" size="small" {...register('tipo')} error={!!errors.tipo} helperText={errors.tipo?.message} /></Grid>
          </Grid>
          <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
            <Button type="submit" variant="contained" startIcon={editing ? <SaveIcon /> : <AddIcon />}>{editing ? 'Actualizar' : 'Registrar Vehículo'}</Button>
            {editing && <Button variant="outlined" onClick={() => { setEditing(null); reset({}); }}>Cancelar</Button>}
          </Box>
        </Box>
        <DataTable columns={columns} data={data} total={data.length} page={0} rowsPerPage={data.length} onEdit={handleEdit} onDelete={handleDelete} />
      </Box>
    </AdminLayout>
  );
}
