import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, TextField, MenuItem, Grid, Alert, Card, CardContent } from '@mui/material';
import { Add as AddIcon, Save as SaveIcon, Home as HomeIcon, TimeToLeave as TimeToLeaveIcon } from '@mui/icons-material';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { DataTable } from '../../components/admin/DataTable';
import { vehiculoService } from '../../../application/services/vehiculoService';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { HelpButton } from '../../components/tours/HelpButton';
import { tours } from '../../components/tours/tourConfig';

const font = "'Inter', 'Poppins', 'Segoe UI', sans-serif";

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
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { control, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(vehiculoSchema),
    defaultValues: { subcategoria_id: '', tipo: '' },
  });

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
      reset({ subcategoria_id: '', tipo: '' }); setEditing(null); load();
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
      <Box sx={{ maxWidth: 1100, mx: 'auto', fontFamily: font }}>
        <Card data-tour="vehiculos-header" sx={{ borderRadius: '16px', mb: 3, boxShadow: '0 4px 16px rgba(0,0,0,.06)' }}>
          <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 }, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{
              width: 44, height: 44, borderRadius: '12px',
              background: 'linear-gradient(135deg, #7c3aed, #a78bfa)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#FFFFFF', boxShadow: '0 4px 12px rgba(124,58,237,.3)',
            }}>
              <TimeToLeaveIcon sx={{ fontSize: 22 }} />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ fontSize: 18, fontWeight: 700, color: '#1F2937', fontFamily: font }}>Vehículos</Typography>
              <Typography sx={{ fontSize: 13, color: '#6B7280', fontFamily: font }}>
                {data.length} vehículo{data.length !== 1 ? 's' : ''} registrado{data.length !== 1 ? 's' : ''}
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

        <Card data-tour="vehiculos-form" sx={{ borderRadius: '16px', mb: 3, boxShadow: '0 4px 16px rgba(0,0,0,.06)' }}>
          <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
            <Box component="form" onSubmit={handleSubmit(onSubmit)}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Box sx={{ color: '#7c3aed' }}><TimeToLeaveIcon /></Box>
                <Typography sx={{ fontSize: 15, fontWeight: 700, color: '#1F2937', fontFamily: font }}>
                  {editing ? 'Editar Vehículo' : 'Registrar Vehículo'}
                </Typography>
                {editing && (
                  <Button size="small" variant="text" sx={{ ml: 'auto', textTransform: 'none', fontWeight: 600, fontSize: 13, color: '#6B7280' }}
                    onClick={() => { setEditing(null); reset({ subcategoria_id: '', tipo: '' }); }}>
                    Cancelar edición
                  </Button>
                )}
              </Box>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Controller
                    name="subcategoria_id"
                    control={control}
                    render={({ field: { value, onChange } }) => (
                      <TextField select fullWidth label="Subcategoría" size="small" value={value ?? ''} onChange={onChange} error={!!errors.subcategoria_id}
                        slotProps={{ input: { sx: { borderRadius: '10px', bgcolor: '#F9FAFB' } } }}>
                        <MenuItem value="">-- Seleccione --</MenuItem>
                        {allSubcats.map((s) => <MenuItem key={s.id_subcategoria} value={String(s.id_subcategoria)}>{s.categoriaNombre} - {s.nombre}</MenuItem>)}
                      </TextField>
                    )}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Controller
                    name="tipo"
                    control={control}
                    render={({ field: { value, onChange } }) => (
                      <TextField fullWidth label="Tipo (auto, taxi, bus...)" size="small" value={value ?? ''} onChange={onChange} error={!!errors.tipo} helperText={errors.tipo?.message}
                        slotProps={{ input: { sx: { borderRadius: '10px', bgcolor: '#F9FAFB' } } }} />
                    )}
                  />
                </Grid>
              </Grid>
              <Box sx={{ mt: 2.5, display: 'flex', gap: 1 }}>
                <Button type="submit" variant="contained" startIcon={editing ? <SaveIcon /> : <AddIcon />}
                  sx={{
                    borderRadius: '10px', fontWeight: 700, fontSize: 13, py: 1, px: 3,
                    background: editing ? 'linear-gradient(90deg, #7c3aed, #a78bfa)' : 'linear-gradient(90deg, #0D5BFF, #0052CC)',
                    boxShadow: editing ? '0 4px 12px rgba(124,58,237,.3)' : '0 4px 12px rgba(13,91,255,.3)',
                    '&:hover': { transform: 'translateY(-1px)', boxShadow: '0 6px 16px rgba(13,91,255,.4)' },
                    transition: 'all 0.2s ease',
                  }}>
                  {editing ? 'Actualizar' : 'Registrar Vehículo'}
                </Button>
                {editing && (
                  <Button variant="outlined" onClick={() => { setEditing(null); reset({ subcategoria_id: '', tipo: '' }); }} sx={{ borderRadius: '10px', fontWeight: 600 }}>
                    Cancelar
                  </Button>
                )}
              </Box>
            </Box>
          </CardContent>
        </Card>

        <div data-tour="vehiculos-table">
        <DataTable columns={columns} data={data} total={data.length} page={0} rowsPerPage={Math.max(5, data.length)} onEdit={handleEdit} onDelete={handleDelete} />
      </div>
      </Box>
      <HelpButton steps={tours.admin.vehiculos} />
    </AdminLayout>
  );
}