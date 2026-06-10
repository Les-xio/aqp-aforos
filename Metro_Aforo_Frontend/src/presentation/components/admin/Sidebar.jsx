import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Drawer, List, ListItemButton, ListItemIcon, ListItemText, Collapse,
  Box, Typography, Divider, IconButton,
} from '@mui/material';
import {
  Dashboard as DashboardIcon, People as PeopleIcon,
  DirectionsCar as CarIcon, Category as CategoryIcon,
  SubdirectoryArrowRight as SubcategoryIcon,
  LocationOn as LocationIcon, Search as SearchIcon,
  Assessment as ReportIcon, Security as AuditIcon,
  Logout as LogoutIcon, ExpandLess, ExpandMore, Menu as MenuIcon,
  Public as PublicIcon, AccessTime as TurnosIcon,
} from '@mui/icons-material';
import { useAuth } from '../../../application/hooks/useAuth';

const SIDEBAR_BG = '#1E293B';
const ACTIVE_COLOR = '#0D5BFF';

const menuItems = [
  { label: 'Inicio', icon: <DashboardIcon />, path: '/admin/dashboard' },
  {
    label: 'Módulos', icon: <MenuIcon />, children: [
      { label: 'Usuarios', icon: <PeopleIcon />, path: '/admin/usuarios' },
      { label: 'Categorías', icon: <CategoryIcon />, path: '/admin/categorias' },
      { label: 'Subcategorías', icon: <SubcategoryIcon />, path: '/admin/subcategorias' },
      { label: 'Vehículos', icon: <CarIcon />, path: '/admin/vehiculos' },
      { label: 'Puntos de aforo', icon: <LocationIcon />, path: '/admin/puntos-aforo' },
      { label: 'Turnos', icon: <TurnosIcon />, path: '/admin/turnos' },
      { label: 'Buscar', icon: <SearchIcon />, path: '/admin/buscar' },
      { label: 'Reportes', icon: <ReportIcon />, path: '/admin/reportes' },
      { label: 'Franjas', icon: <PublicIcon />, path: '/admin/franjas' },
      { label: 'Auditoría', icon: <AuditIcon />, path: '/admin/auditoria' },
    ],
  },
];

export function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { usuario, logout } = useAuth();
  const [openSubmenu, setOpenSubmenu] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const drawerContent = (
    <Box data-tour="sidebar" sx={{
      width: 260, height: '100%', display: 'flex', flexDirection: 'column',
      bgcolor: SIDEBAR_BG,
    }}>
      {/* Brand */}
      <Box sx={{ p: 2.5, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <Typography variant="h6" fontWeight={800} sx={{ color: '#FFFFFF', letterSpacing: '1px', fontSize: 18 }}>
          Metro AQP Aforos
        </Typography>
        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, mt: 0.3 }}>
          {usuario?.nombres} {usuario?.apellidos}
        </Typography>
      </Box>

      {/* Nav */}
      <List sx={{ flex: 1, overflow: 'auto', py: 1 }} component="nav">
        {menuItems.map((item) => {
          if (item.children) {
            const anyChildActive = item.children.some((c) => isActive(c.path));
            return (
              <Box key={item.label}>
                <ListItemButton
                  onClick={() => setOpenSubmenu(!openSubmenu)}
                  sx={{
                    mx: 1, borderRadius: '10px', mb: 0.3,
                    color: 'rgba(255,255,255,0.7)',
                    '&:hover': { bgcolor: 'rgba(13,91,255,0.15)', color: '#FFFFFF' },
                  }}
                >
                  <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.label} slotProps={{ primaryTypography: { fontSize: 14, fontWeight: 600 } }} />
                  {openSubmenu ? <ExpandLess sx={{ color: 'rgba(255,255,255,0.5)' }} /> : <ExpandMore sx={{ color: 'rgba(255,255,255,0.5)' }} />}
                </ListItemButton>
                <Collapse in={openSubmenu} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    {item.children.map((child) => (
                      <ListItemButton
                        key={child.path}
                        sx={{
                          pl: 4, mx: 1, borderRadius: '10px', mb: 0.2,
                          color: isActive(child.path) ? '#FFFFFF' : 'rgba(255,255,255,0.6)',
                          bgcolor: isActive(child.path) ? `${ACTIVE_COLOR}22` : 'transparent',
                          borderLeft: isActive(child.path) ? `3px solid ${ACTIVE_COLOR}` : '3px solid transparent',
                          '&:hover': { bgcolor: 'rgba(13,91,255,0.15)', color: '#FFFFFF' },
                        }}
                        selected={isActive(child.path)}
                        onClick={() => { navigate(child.path); setMobileOpen(false); }}
                      >
                        <ListItemIcon sx={{ minWidth: 36, color: 'inherit' }}>{child.icon}</ListItemIcon>
                        <ListItemText primary={child.label} slotProps={{ primaryTypography: { fontSize: 13, fontWeight: isActive(child.path) ? 600 : 400 } }} />
                      </ListItemButton>
                    ))}
                  </List>
                </Collapse>
              </Box>
            );
          }
          return (
            <ListItemButton
              key={item.path}
              sx={{
                mx: 1, borderRadius: '10px', mb: 0.3,
                color: isActive(item.path) ? '#FFFFFF' : 'rgba(255,255,255,0.7)',
                bgcolor: isActive(item.path) ? `${ACTIVE_COLOR}22` : 'transparent',
                borderLeft: isActive(item.path) ? `3px solid ${ACTIVE_COLOR}` : '3px solid transparent',
                '&:hover': { bgcolor: 'rgba(13,91,255,0.15)', color: '#FFFFFF' },
              }}
              selected={isActive(item.path)}
              onClick={() => { navigate(item.path); setMobileOpen(false); }}
            >
              <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} slotProps={{ primaryTypography: { fontSize: 14, fontWeight: isActive(item.path) ? 700 : 600 } }} />
            </ListItemButton>
          );
        })}
      </List>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)' }} />
      <List>
        <ListItemButton
          onClick={logout}
          sx={{
            mx: 1, borderRadius: '10px', mb: 1,
            color: 'rgba(255,255,255,0.6)',
            '&:hover': { bgcolor: 'rgba(220,38,38,0.15)', color: '#EF4444' },
          }}
        >
          <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}><LogoutIcon /></ListItemIcon>
          <ListItemText primary="Cerrar Sesión" slotProps={{ primaryTypography: { fontSize: 14, fontWeight: 600 } }} />
        </ListItemButton>
      </List>
    </Box>
  );

  return (
    <>
      <Drawer
        variant="permanent"
        sx={{ display: { xs: 'none', md: 'block' }, '& .MuiDrawer-paper': { width: 260, boxSizing: 'border-box', borderRight: 'none' } }}
        open
      >
        {drawerContent}
      </Drawer>
      <Drawer
        variant="temporary"
        sx={{ display: { xs: 'block', md: 'none' }, '& .MuiDrawer-paper': { width: 260 } }}
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
      >
        {drawerContent}
      </Drawer>
      {!mobileOpen && (
        <IconButton
          sx={{ position: 'fixed', top: 8, left: 8, zIndex: 1200, display: { md: 'none' }, color: '#1E293B' }}
          onClick={() => setMobileOpen(true)}
        >
          <MenuIcon />
        </IconButton>
      )}
    </>
  );
}