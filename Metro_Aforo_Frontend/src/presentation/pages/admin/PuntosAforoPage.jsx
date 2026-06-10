import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, TextField, Grid, Alert, Card, CardContent } from '@mui/material';
import { Add as AddIcon, Save as SaveIcon, Home as HomeIcon, Flag as FlagIcon } from '@mui/icons-material';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { DataTable } from '../../components/admin/DataTable';
import { puntoAforoService } from '../../../application/services/puntoAforoService';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { HelpButton } from '../../components/tours/HelpButton';
import { tours } from '../../components/tours/tourConfig';

const font = "'Inter', 'Poppins', 'Segoe UI', sans-serif";

const schema = z.object({ nombre_punto: z.string().min(1, 'Requerido') });
const columns = [
  { key: 'id_punto_aforo', label: 'ID' },
  { key: 'nombre_punto', label: 'Nombre del punto' },
];

export function PuntosAforoPage() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { control, handleSubmit, reset, formState: { errors } } = useForm({ resolver: zodResolver(schema), defaultValues: { nombre_punto: '' } });

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
      reset({ nombre_punto: '' }); setEditing(null); load();
    } catch (err) { setError(err.message || 'Error'); }
  };

  const handleEdit = (row) => { setEditing(row); reset({ nombre_punto: row.nombre_punto }); };
  const handleDelete = async (row) => {
    try { await puntoAforoService.eliminar(row.id_punto_aforo); setSuccess('Eliminado'); load(); }
    catch (err) { setError(err.message || 'Error'); }
  };

  return (
    <AdminLayout>
      <Box sx={{ maxWidth: 1100, mx: 'auto', fontFamily: font }}>
        <Card data-tour="puntos-header" sx={{ borderRadius: '16px', mb: 3, boxShadow: '0 4px 16px rgba(0,0,0,.06)' }}>
          <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 }, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{
              width: 44, height: 44, borderRadius: '12px',
              background: 'linear-gradient(135deg, #d97706, #f59e0b)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#FFFFFF', boxShadow: '0 4px 12px rgba(217,119,6,.3)',
            }}>
              <FlagIcon sx={{ fontSize: 22 }} />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ fontSize: 18, fontWeight: 700, color: '#1F2937', fontFamily: font }}>Puntos de Aforo</Typography>
              <Typography sx={{ fontSize: 13, color: '#6B7280', fontFamily: font }}>
                {data.length} punto{data.length !== 1 ? 's' : ''} de aforo registrado{data.length !== 1 ? 's' : ''}
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

        <Card data-tour="puntos-form" sx={{ borderRadius: '16px', mb: 3, boxShadow: '0 4px 16px rgba(0,0,0,.06)' }}>
          <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
            <Box component="form" onSubmit={handleSubmit(onSubmit)}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Box sx={{ color: '#d97706' }}><FlagIcon /></Box>
                <Typography sx={{ fontSize: 15, fontWeight: 700, color: '#1F2937', fontFamily: font }}>
                  {editing ? 'Editar Punto de Aforo' : 'Registrar Punto de Aforo'}
                </Typography>
                {editing && (
                  <Button size="small" variant="text" sx={{ ml: 'auto', textTransform: 'none', fontWeight: 600, fontSize: 13, color: '#6B7280' }}
                    onClick={() => { setEditing(null); reset({ nombre_punto: '' }); }}>
                    Cancelar edición
                  </Button>
                )}
              </Box>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Controller
                    name="nombre_punto"
                    control={control}
                    render={({ field: { value, onChange } }) => (
                      <TextField fullWidth label="Nombre del punto" size="small" value={value ?? ''} onChange={onChange} error={!!errors.nombre_punto} helperText={errors.nombre_punto?.message}
                        slotProps={{ input: { sx: { borderRadius: '10px', bgcolor: '#F9FAFB' } } }} />
                    )}
                  />
                </Grid>
              </Grid>
              <Box sx={{ mt: 2.5, display: 'flex', gap: 1 }}>
                <Button type="submit" variant="contained" startIcon={editing ? <SaveIcon /> : <AddIcon />}
                  sx={{
                    borderRadius: '10px', fontWeight: 700, fontSize: 13, py: 1, px: 3,
                    background: editing ? 'linear-gradient(90deg, #d97706, #f59e0b)' : 'linear-gradient(90deg, #0D5BFF, #0052CC)',
                    boxShadow: editing ? '0 4px 12px rgba(217,119,6,.3)' : '0 4px 12px rgba(13,91,255,.3)',
                    '&:hover': { transform: 'translateY(-1px)', boxShadow: '0 6px 16px rgba(13,91,255,.4)' },
                    transition: 'all 0.2s ease',
                  }}>
                  {editing ? 'Actualizar' : 'Registrar Punto'}
                </Button>
                {editing && <Button variant="outlined" onClick={() => { setEditing(null); reset({ nombre_punto: '' }); }} sx={{ borderRadius: '10px', fontWeight: 600 }}>Cancelar</Button>}
              </Box>
            </Box>
          </CardContent>
        </Card>

        <div data-tour="puntos-table">
        <DataTable columns={columns} data={data} total={data.length} page={0} rowsPerPage={Math.max(5, data.length)} onEdit={handleEdit} onDelete={handleDelete} />
      </div>
      </Box>
      <HelpButton steps={tours.admin.puntos} />
    </AdminLayout>
  );
}