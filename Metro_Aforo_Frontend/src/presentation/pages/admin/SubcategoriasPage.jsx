import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, TextField, MenuItem, Grid, Alert, Card, CardContent } from '@mui/material';
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
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { control, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(subcategoriaSchema),
    defaultValues: { categoria_id: '', nombre: '', descripcion: '' },
  });

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
      reset({ categoria_id: '', nombre: '', descripcion: '' }); setEditing(null); load();
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
      <Box sx={{ maxWidth: 1100, mx: 'auto', fontFamily: font }}>
        <Card data-tour="subcategorias-header" sx={{ borderRadius: '16px', mb: 3, boxShadow: '0 4px 16px rgba(0,0,0,.06)' }}>
          <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 }, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{
              width: 44, height: 44, borderRadius: '12px',
              background: 'linear-gradient(135deg, #0284c7, #38bdf8)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#FFFFFF', boxShadow: '0 4px 12px rgba(2,132,199,.3)',
            }}>
              <CategoryIcon sx={{ fontSize: 22 }} />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ fontSize: 18, fontWeight: 700, color: '#1F2937', fontFamily: font }}>Subcategorías Vehiculares</Typography>
              <Typography sx={{ fontSize: 13, color: '#6B7280', fontFamily: font }}>
                {data.length} subcategoría{data.length !== 1 ? 's' : ''} registrada{data.length !== 1 ? 's' : ''}
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

        <Card data-tour="subcategorias-form" sx={{ borderRadius: '16px', mb: 3, boxShadow: '0 4px 16px rgba(0,0,0,.06)' }}>
          <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
            <Box component="form" onSubmit={handleSubmit(onSubmit)}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Box sx={{ color: '#0284c7' }}><CategoryIcon /></Box>
                <Typography sx={{ fontSize: 15, fontWeight: 700, color: '#1F2937', fontFamily: font }}>
                  {editing ? 'Editar Subcategoría' : 'Registrar Subcategoría'}
                </Typography>
                {editing && (
                  <Button size="small" variant="text" sx={{ ml: 'auto', textTransform: 'none', fontWeight: 600, fontSize: 13, color: '#6B7280' }}
                    onClick={() => { setEditing(null); reset({ categoria_id: '', nombre: '', descripcion: '' }); }}>
                    Cancelar edición
                  </Button>
                )}
              </Box>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Controller
                    name="categoria_id"
                    control={control}
                    render={({ field: { value, onChange } }) => (
                      <TextField select fullWidth label="Categoría" size="small" value={value ?? ''} onChange={onChange} error={!!errors.categoria_id}
                        slotProps={{ input: { sx: { borderRadius: '10px', bgcolor: '#F9FAFB' } } }}>
                        <MenuItem value="">-- Seleccione --</MenuItem>
                        {categorias.map((c) => <MenuItem key={c.id_categoria} value={String(c.id_categoria)}>{c.nombre}</MenuItem>)}
                      </TextField>
                    )}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Controller
                    name="nombre"
                    control={control}
                    render={({ field: { value, onChange } }) => (
                      <TextField fullWidth label="Nombre" size="small" value={value ?? ''} onChange={onChange} error={!!errors.nombre} helperText={errors.nombre?.message}
                        slotProps={{ input: { sx: { borderRadius: '10px', bgcolor: '#F9FAFB' } } }} />
                    )}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
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
                    background: editing ? 'linear-gradient(90deg, #0284c7, #38bdf8)' : 'linear-gradient(90deg, #0D5BFF, #0052CC)',
                    boxShadow: editing ? '0 4px 12px rgba(2,132,199,.3)' : '0 4px 12px rgba(13,91,255,.3)',
                    '&:hover': { transform: 'translateY(-1px)', boxShadow: '0 6px 16px rgba(13,91,255,.4)' },
                    transition: 'all 0.2s ease',
                  }}>
                  {editing ? 'Actualizar' : 'Registrar Subcategoría'}
                </Button>
                {editing && (
                  <Button variant="outlined" onClick={() => { setEditing(null); reset({ categoria_id: '', nombre: '', descripcion: '' }); }} sx={{ borderRadius: '10px', fontWeight: 600 }}>
                    Cancelar
                  </Button>
                )}
              </Box>
            </Box>
          </CardContent>
        </Card>

        <div data-tour="subcategorias-table">
        <DataTable columns={columns} data={data} total={data.length} page={0} rowsPerPage={Math.max(5, data.length)} onEdit={handleEdit} onDelete={handleDelete} />
      </div>
      </Box>
      <HelpButton steps={tours.admin.subcategorias} />
    </AdminLayout>
  );
}