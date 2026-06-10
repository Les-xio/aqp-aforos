import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, TextField, Grid, Alert, Card, CardContent } from '@mui/material';
import { Add as AddIcon, Save as SaveIcon, Home as HomeIcon, Category as CategoryIcon } from '@mui/icons-material';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { DataTable } from '../../components/admin/DataTable';
import { vehiculoService } from '../../../application/services/vehiculoService';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { HelpButton } from '../../components/tours/HelpButton';
import { tours } from '../../components/tours/tourConfig';

const font = "'Inter', 'Poppins', 'Segoe UI', sans-serif";

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
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { control, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(categoriaSchema),
    defaultValues: { nombre: '', descripcion: '' },
  });

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
      reset({ nombre: '', descripcion: '' }); setEditing(null); load();
    } catch (err) { setError(err.message || 'Error al guardar'); }
  };

  const handleEdit = (row) => { setEditing(row); reset({ nombre: row.nombre, descripcion: row.descripcion }); };
  const handleDelete = async (row) => {
    try { await vehiculoService.eliminarCategoria(row.id_categoria); setSuccess('Eliminada'); load(); }
    catch (err) { setError(err.message || 'Error'); }
  };

  return (
    <AdminLayout>
      <Box sx={{ maxWidth: 1100, mx: 'auto', fontFamily: font }}>
        <Card data-tour="categorias-header" sx={{ borderRadius: '16px', mb: 3, boxShadow: '0 4px 16px rgba(0,0,0,.06)' }}>
          <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 }, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{
              width: 44, height: 44, borderRadius: '12px',
              background: 'linear-gradient(135deg, #2e7d32, #43a047)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#FFFFFF', boxShadow: '0 4px 12px rgba(46,125,50,.3)',
            }}>
              <CategoryIcon sx={{ fontSize: 22 }} />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ fontSize: 18, fontWeight: 700, color: '#1F2937', fontFamily: font }}>Categorías Vehiculares</Typography>
              <Typography sx={{ fontSize: 13, color: '#6B7280', fontFamily: font }}>
                {data.length} categoría{data.length !== 1 ? 's' : ''} registrada{data.length !== 1 ? 's' : ''}
              </Typography>
            </Box>
            <Button size="small" startIcon={<HomeIcon />} onClick={() => navigate('/admin/dashboard')}
              sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 600, fontSize: 13, color: '#6B7280', '&:hover': { bgcolor: '#F3F4F6' } }}>
              Volver al inicio
            </Button>
          </CardContent>
        </Card>

        {error && <Alert severity="error" sx={{ mb: 2, borderRadius: '12px' }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2, borderRadius: '12px' }} onClose={() => setSuccess('')}>{success}</Alert>}

        <Card data-tour="categorias-form" sx={{ borderRadius: '16px', mb: 3, boxShadow: '0 4px 16px rgba(0,0,0,.06)' }}>
          <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
            <Box component="form" onSubmit={handleSubmit(onSubmit)}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Box sx={{ color: '#2e7d32' }}><CategoryIcon /></Box>
                <Typography sx={{ fontSize: 15, fontWeight: 700, color: '#1F2937', fontFamily: font }}>
                  {editing ? 'Editar Categoría' : 'Registrar Categoría'}
                </Typography>
                {editing && (
                  <Button size="small" variant="text" sx={{ ml: 'auto', textTransform: 'none', fontWeight: 600, fontSize: 13, color: '#6B7280' }}
                    onClick={() => { setEditing(null); reset({ nombre: '', descripcion: '' }); }}>
                    Cancelar edición
                  </Button>
                )}
              </Box>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Controller
                    name="nombre"
                    control={control}
                    render={({ field: { value, onChange } }) => (
                      <TextField fullWidth label="Nombre" size="small" value={value ?? ''} onChange={onChange} error={!!errors.nombre} helperText={errors.nombre?.message}
                        slotProps={{ input: { sx: { borderRadius: '10px', bgcolor: '#F9FAFB' } } }} />
                    )}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Controller
                    name="descripcion"
                    control={control}
                    render={({ field: { value, onChange } }) => (
                      <TextField fullWidth label="Descripción" size="small" value={value ?? ''} onChange={onChange}
                        slotProps={{ input: { sx: { borderRadius: '10px', bgcolor: '#F9FAFB' } } }} />
                    )}
                  />
                </Grid>
              </Grid>
              <Box sx={{ mt: 2.5, display: 'flex', gap: 1 }}>
                <Button type="submit" variant="contained" startIcon={editing ? <SaveIcon /> : <AddIcon />}
                  sx={{
                    borderRadius: '10px', fontWeight: 700, fontSize: 13, py: 1, px: 3,
                    background: editing ? 'linear-gradient(90deg, #2e7d32, #43a047)' : 'linear-gradient(90deg, #0D5BFF, #0052CC)',
                    boxShadow: editing ? '0 4px 12px rgba(46,125,50,.3)' : '0 4px 12px rgba(13,91,255,.3)',
                    '&:hover': { transform: 'translateY(-1px)', boxShadow: '0 6px 16px rgba(13,91,255,.4)' },
                    transition: 'all 0.2s ease',
                  }}>
                  {editing ? 'Actualizar' : 'Registrar Categoría'}
                </Button>
                {editing && (
                  <Button variant="outlined" onClick={() => { setEditing(null); reset({ nombre: '', descripcion: '' }); }} sx={{ borderRadius: '10px', fontWeight: 600 }}>
                    Cancelar
                  </Button>
                )}
              </Box>
            </Box>
          </CardContent>
        </Card>

        <div data-tour="categorias-table">
        <DataTable columns={columns} data={data} total={data.length} page={0} rowsPerPage={Math.max(5, data.length)} onEdit={handleEdit} onDelete={handleDelete} />
      </div>
      </Box>
      <HelpButton steps={tours.admin.categorias} />
    </AdminLayout>
  );
}