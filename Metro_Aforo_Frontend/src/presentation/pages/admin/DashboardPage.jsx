import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../application/hooks/useAuth';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { Box, Typography, Card, CardContent, Grid, Avatar } from '@mui/material';
import {
  People as PeopleIcon, DirectionsCar as CarIcon,
  LocationOn as LocationIcon, Assessment as ReportIcon,
  Category as CategoryIcon, SubdirectoryArrowRight as SubcategoryIcon,
  Search as SearchIcon, Security as AuditIcon,
  Dashboard as DashboardIcon, TrendingUp as TrendingUpIcon,
  Public as PublicIcon, AccessTime as TurnosIcon,
} from '@mui/icons-material';

import { HelpButton } from '../../components/tours/HelpButton';
import { tours } from '../../components/tours/tourConfig';

const font = "'Inter', 'Poppins', 'Segoe UI', sans-serif";

const kpis = [
  { label: 'Usuarios', value: 125, icon: <PeopleIcon sx={{ fontSize: 28 }} />, color: '#1565c0', gradient: 'linear-gradient(135deg, #1565c0, #1976d2)' },
  { label: 'Vehículos', value: 48, icon: <CarIcon sx={{ fontSize: 28 }} />, color: '#e65100', gradient: 'linear-gradient(135deg, #e65100, #ef6c00)' },
  { label: 'Categorías', value: 10, icon: <CategoryIcon sx={{ fontSize: 28 }} />, color: '#2e7d32', gradient: 'linear-gradient(135deg, #2e7d32, #43a047)' },
  { label: 'Registros hoy', value: 1542, icon: <TrendingUpIcon sx={{ fontSize: 28 }} />, color: '#7b1fa2', gradient: 'linear-gradient(135deg, #7b1fa2, #9c27b0)' },
];

const modules = [
  { label: 'Usuarios', path: '/admin/usuarios', icon: <PeopleIcon sx={{ fontSize: 32 }} />, color: '#1565c0', gradient: 'linear-gradient(135deg, #1565c0, #1976d2)' },
  { label: 'Categorías Vehiculares', path: '/admin/categorias', icon: <CategoryIcon sx={{ fontSize: 32 }} />, color: '#2e7d32', gradient: 'linear-gradient(135deg, #2e7d32, #43a047)' },
  { label: 'Subcategorías', path: '/admin/subcategorias', icon: <SubcategoryIcon sx={{ fontSize: 32 }} />, color: '#6a1b9a', gradient: 'linear-gradient(135deg, #6a1b9a, #8e24aa)' },
  { label: 'Vehículos', path: '/admin/vehiculos', icon: <CarIcon sx={{ fontSize: 32 }} />, color: '#e65100', gradient: 'linear-gradient(135deg, #e65100, #ef6c00)' },
  { label: 'Puntos de aforo', path: '/admin/puntos-aforo', icon: <LocationIcon sx={{ fontSize: 32 }} />, color: '#00838f', gradient: 'linear-gradient(135deg, #00838f, #00acc1)' },
  { label: 'Turnos', path: '/admin/turnos', icon: <TurnosIcon sx={{ fontSize: 32 }} />, color: '#e91e63', gradient: 'linear-gradient(135deg, #e91e63, #f06292)' },
  { label: 'Buscar', path: '/admin/buscar', icon: <SearchIcon sx={{ fontSize: 32 }} />, color: '#4e342e', gradient: 'linear-gradient(135deg, #4e342e, #6d4c41)' },
  { label: 'Reportes', path: '/admin/reportes', icon: <ReportIcon sx={{ fontSize: 32 }} />, color: '#37474f', gradient: 'linear-gradient(135deg, #37474f, #546e7a)' },
  { label: 'Franjas', path: '/admin/franjas', icon: <PublicIcon sx={{ fontSize: 32 }} />, color: '#0D5BFF', gradient: 'linear-gradient(135deg, #0D5BFF, #38bdf8)' },
  { label: 'Auditoría', path: '/admin/auditoria', icon: <AuditIcon sx={{ fontSize: 32 }} />, color: '#880e4f', gradient: 'linear-gradient(135deg, #880e4f, #ad1457)' },
];

export function DashboardPage() {
  const navigate = useNavigate();
  const { usuario } = useAuth();

  return (
    <AdminLayout>
      <Box sx={{ maxWidth: 1100, mx: 'auto', fontFamily: font }}>
        {/* ── WELCOME HEADER ── */}
        <Card data-tour="admin-dashboard-welcome" sx={{
          borderRadius: '20px', mb: 3, overflow: 'hidden',
          background: 'linear-gradient(135deg, #003DA5 0%, #0D5BFF 100%)',
          color: '#FFFFFF', boxShadow: '0 8px 24px rgba(13,91,255,.25)',
        }}>
          <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
            <Grid container spacing={2} alignItems="center">
              <Grid size={{ xs: 12, md: 6 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ width: 52, height: 52, bgcolor: 'rgba(255,255,255,0.2)', boxShadow: '0 4px 12px rgba(0,0,0,.15)' }}>
                    <DashboardIcon sx={{ fontSize: 26, color: '#FFFFFF' }} />
                  </Avatar>
                  <Box>
                    <Typography sx={{ fontSize: 20, fontWeight: 700, fontFamily: font }}>
                      👋 Bienvenido, Administrador
                    </Typography>
                    <Typography sx={{ fontSize: 12, opacity: 0.75, fontFamily: font }}>
                      Último acceso: 06/06/2026 - 14:45
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.3 }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#4CAF50', boxShadow: '0 0 8px rgba(76,175,80,.6)' }} />
                      <Typography sx={{ fontSize: 12, color: '#4CAF50', fontWeight: 600, fontFamily: font }}>
                        Sistema operativo
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Box sx={{
                  bgcolor: 'rgba(255,255,255,0.1)', borderRadius: '14px', p: 1.5,
                  backdropFilter: 'blur(8px)',
                }}>
                  <Typography sx={{ fontSize: 11, fontWeight: 600, opacity: 0.7, mb: 1, textTransform: 'uppercase', letterSpacing: '0.5px', fontFamily: font }}>
                    📊 Resumen General
                  </Typography>
                  <Grid container spacing={1}>
                    {kpis.map((kpi) => (
                      <Grid size={3} key={kpi.label}>
                        <Typography sx={{ fontSize: 16, fontWeight: 700, fontFamily: font, lineHeight: 1.1 }}>
                          {kpi.value.toLocaleString()}
                        </Typography>
                        <Typography sx={{ fontSize: 10, opacity: 0.7, fontFamily: font }}>
                          {kpi.label}
                        </Typography>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* ── KPI CARDS ── */}
        <Grid container spacing={2} data-tour="admin-dashboard-kpis" sx={{ mb: 3 }}>
          {kpis.map((kpi) => (
            <Grid size={{ xs: 6, sm: 3 }} key={kpi.label}>
              <Card sx={{
                borderRadius: '16px',
                background: kpi.gradient,
                color: '#FFFFFF',
                boxShadow: `0 8px 24px ${kpi.color}33`,
                transition: 'all 0.25s ease',
                '&:hover': {
                  transform: 'translateY(-4px) scale(1.02)',
                  boxShadow: `0 16px 40px ${kpi.color}55`,
                },
              }}>
                <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                    <Typography sx={{ fontSize: 12, fontWeight: 600, opacity: 0.85, fontFamily: font }}>
                      {kpi.label}
                    </Typography>
                    <Box sx={{ opacity: 0.85 }}>{kpi.icon}</Box>
                  </Box>
                  <Typography sx={{ fontSize: 28, fontWeight: 800, fontFamily: font, lineHeight: 1.1 }}>
                    {kpi.value.toLocaleString()}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* ── MODULE GRID ── */}
        <Typography sx={{ fontSize: 15, fontWeight: 700, color: '#1F2937', mb: 2, fontFamily: font }}>
          Módulos del sistema
        </Typography>

        <Grid container spacing={2} data-tour="admin-dashboard-modules">
          {modules.map((mod) => (
            <Grid size={{ xs: 6, sm: 4, md: 3 }} key={mod.label}>
              <Card
                sx={{
                  borderRadius: '16px', cursor: 'pointer',
                  transition: 'all 0.25s ease',
                  border: '1px solid #E5E7EB',
                  boxShadow: '0 2px 8px rgba(0,0,0,.04)',
                  '&:hover': {
                    transform: 'translateY(-4px) scale(1.03)',
                    boxShadow: `0 16px 40px ${mod.color}22`,
                    borderColor: mod.color,
                  },
                }}
                onClick={() => navigate(mod.path)}
              >
                <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 }, textAlign: 'center' }}>
                  <Box sx={{
                    width: 56, height: 56, mx: 'auto', mb: 1.5,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    borderRadius: '14px',
                    background: mod.gradient,
                    boxShadow: `0 6px 16px ${mod.color}33`,
                    color: '#FFFFFF',
                  }}>
                    {mod.icon}
                  </Box>
                  <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#1F2937', lineHeight: 1.3, fontFamily: font }}>
                    {mod.label}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
      <HelpButton steps={tours.admin.dashboard} />
    </AdminLayout>
  );
}