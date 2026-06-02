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
} from '@mui/icons-material';
import { useAuth } from '../../../application/hooks/useAuth';

const menuItems = [
  { label: 'Inicio', icon: <DashboardIcon />, path: '/admin/dashboard' },
  {
    label: 'Módulos', icon: <MenuIcon />, children: [
      { label: 'Usuarios', icon: <PeopleIcon />, path: '/admin/usuarios' },
      { label: 'Categorías', icon: <CategoryIcon />, path: '/admin/categorias' },
      { label: 'Subcategorías', icon: <SubcategoryIcon />, path: '/admin/subcategorias' },
      { label: 'Vehículos', icon: <CarIcon />, path: '/admin/vehiculos' },
      { label: 'Puntos de aforo', icon: <LocationIcon />, path: '/admin/puntos-aforo' },
      { label: 'Buscar', icon: <SearchIcon />, path: '/admin/buscar' },
      { label: 'Reportes', icon: <ReportIcon />, path: '/admin/reportes' },
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

  const drawerContent = (
    <Box sx={{ width: 260, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'white' }}>
        <Typography variant="h6" fontWeight={700}>AQP Aforos</Typography>
        <Typography variant="body2" sx={{ opacity: 0.9 }}>
          {usuario?.nombres} {usuario?.apellidos}
        </Typography>
        <Typography variant="caption" sx={{ opacity: 0.7, textTransform: 'capitalize' }}>
          Rol: {usuario?.rol}
        </Typography>
      </Box>
      <Divider />
      <List sx={{ flex: 1, overflow: 'auto' }} component="nav">
        {menuItems.map((item) => {
          if (item.children) {
            return (
              <Box key={item.label}>
                <ListItemButton onClick={() => setOpenSubmenu(!openSubmenu)}>
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.label} />
                  {openSubmenu ? <ExpandLess /> : <ExpandMore />}
                </ListItemButton>
                <Collapse in={openSubmenu} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    {item.children.map((child) => (
                      <ListItemButton
                        key={child.path}
                        sx={{ pl: 4 }}
                        selected={location.pathname === child.path}
                        onClick={() => { navigate(child.path); setMobileOpen(false); }}
                      >
                        <ListItemIcon sx={{ minWidth: 36 }}>{child.icon}</ListItemIcon>
                        <ListItemText primary={child.label} />
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
              selected={location.pathname === item.path}
              onClick={() => { navigate(item.path); setMobileOpen(false); }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          );
        })}
      </List>
      <Divider />
      <List>
        <ListItemButton onClick={logout}>
          <ListItemIcon><LogoutIcon /></ListItemIcon>
          <ListItemText primary="Cerrar Sesión" />
        </ListItemButton>
      </List>
    </Box>
  );

  return (
    <>
      <Drawer
        variant="permanent"
        sx={{ display: { xs: 'none', md: 'block' }, '& .MuiDrawer-paper': { width: 260, boxSizing: 'border-box' } }}
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
          sx={{ position: 'fixed', top: 8, left: 8, zIndex: 1200, display: { md: 'none' } }}
          onClick={() => setMobileOpen(true)}
        >
          <MenuIcon />
        </IconButton>
      )}
    </>
  );
}
