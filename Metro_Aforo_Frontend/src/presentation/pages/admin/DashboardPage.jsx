import { useAuth } from '../../../application/hooks/useAuth';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { Box, Typography, Card, CardContent, Grid } from '@mui/material';
import {
  People as PeopleIcon, DirectionsCar as CarIcon,
  LocationOn as LocationIcon, Assessment as ReportIcon,
} from '@mui/icons-material';

const modules = [
  { label: 'Usuarios', icon: <PeopleIcon sx={{ fontSize: 48 }} />, color: '#1565c0' },
  { label: 'Categorías Vehiculares', icon: <CarIcon sx={{ fontSize: 48 }} />, color: '#2e7d32' },
  { label: 'Subcategorías Vehiculares', icon: <CarIcon sx={{ fontSize: 48 }} />, color: '#6a1b9a' },
  { label: 'Vehículos', icon: <CarIcon sx={{ fontSize: 48 }} />, color: '#e65100' },
  { label: 'Puntos de aforo', icon: <LocationIcon sx={{ fontSize: 48 }} />, color: '#00838f' },
  { label: 'Buscar', icon: <ReportIcon sx={{ fontSize: 48 }} />, color: '#4e342e' },
  { label: 'Reportes', icon: <ReportIcon sx={{ fontSize: 48 }} />, color: '#37474f' },
  { label: 'Auditoría', icon: <ReportIcon sx={{ fontSize: 48 }} />, color: '#880e4f' },
];

export function DashboardPage() {
  const { usuario } = useAuth();

  return (
    <AdminLayout>
      <Box>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Bienvenido, {usuario?.nombres}
        </Typography>
        <Typography variant="body1" color="text.secondary" gutterBottom sx={{ textTransform: 'capitalize' }}>
          Rol: {usuario?.rol}
        </Typography>

        <Typography variant="h6" fontWeight={600} sx={{ mt: 3, mb: 2 }}>
          Módulos
        </Typography>

        <Grid container spacing={2}>
          {modules.map((mod) => (
            <Grid item xs={6} sm={4} md={3} key={mod.label}>
              <Card
                sx={{
                  textAlign: 'center', cursor: 'pointer', transition: 'transform 0.2s',
                  '&:hover': { transform: 'scale(1.03)' },
                }}
                onClick={() => {
                  const path = mod.label.toLowerCase().replace(/ /g, '-').replace(/[íéóú]/g, (c) => ({ 'í': 'i', 'é': 'e', 'ó': 'o', 'ú': 'u' }[c]));
                  window.location.href = `/admin/${path}`;
                }}
              >
                <CardContent sx={{ py: 3 }}>
                  <Box sx={{ color: mod.color, mb: 1 }}>{mod.icon}</Box>
                  <Typography variant="body2" fontWeight={600}>{mod.label}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </AdminLayout>
  );
}
