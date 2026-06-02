import { useState, useEffect, useCallback } from 'react';
import { Box, Typography, Button, TextField, Grid, Alert } from '@mui/material';
import { Add as AddIcon, Save as SaveIcon } from '@mui/icons-material';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { DataTable } from '../../components/admin/DataTable';
import { puntoAforoService } from '../../../application/services/puntoAforoService';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({ nombre_punto: z.string().min(1, 'Requerido') });
const columns = [
  { key: 'id_punto_aforo', label: 'ID' },
  { key: 'nombre_punto', label: 'Nombre del punto' },
];

export function PuntosAforoPage() {
  const [data, setData] = useState([]);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { register, handleSubmit, reset, formState: { errors } } = useForm({ resolver: zodResolver(schema) });

  const load = useCallback(async () => {
    try { const res = await puntoAforoService.listar(); setData(res.data || []); }
    catch { setError('Error al cargar'); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const onSubmit = async (formData) => {
    try {
      setError('');
      if (editing) {
        await puntoAforoService.actualizar(editing.id_punto_aforo, formData);
        setSuccess('Actualizado');
      } else {
        await puntoAforoService.crear(formData);
        setSuccess('Registrado');
      }
      reset({}); setEditing(null); load();
    } catch (err) { setError(err.message || 'Error'); }
  };

  const handleEdit = (row) => { setEditing(row); reset({ nombre_punto: row.nombre_punto }); };
  const handleDelete = async (row) => {
    try { await puntoAforoService.eliminar(row.id_punto_aforo); setSuccess('Eliminado'); load(); }
    catch (err) { setError(err.message || 'Error'); }
  };

  return (
    <AdminLayout>
      <Box sx={{ maxWidth: 1000 }}>
        <Typography variant="h5" fontWeight={700} gutterBottom>Puntos de Aforo</Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

        <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mb: 3, p: 2, bgcolor: 'background.paper', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>{editing ? 'Editar' : 'Registrar'} Punto de Aforo</Typography>
          <Grid container spacing={1.5}>
            <Grid item xs={6}><TextField fullWidth label="Nombre del punto" size="small" {...register('nombre_punto')} error={!!errors.nombre_punto} helperText={errors.nombre_punto?.message} /></Grid>
          </Grid>
          <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
            <Button type="submit" variant="contained" startIcon={editing ? <SaveIcon /> : <AddIcon />}>
              {editing ? 'Actualizar' : 'Registrar Punto'}
            </Button>
            {editing && <Button variant="outlined" onClick={() => { setEditing(null); reset({}); }}>Cancelar</Button>}
          </Box>
        </Box>
        <DataTable columns={columns} data={data} total={data.length} page={0} rowsPerPage={data.length} onEdit={handleEdit} onDelete={handleDelete} />
      </Box>
    </AdminLayout>
  );
}
