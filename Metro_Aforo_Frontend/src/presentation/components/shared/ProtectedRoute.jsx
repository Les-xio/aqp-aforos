import { Navigate } from 'react-router-dom';
import { useAuth } from '../../../application/hooks/useAuth';
import { Box, CircularProgress } from '@mui/material';

export function ProtectedRoute({ children, roles }) {
  const { usuario, loading } = useAuth();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!usuario) return <Navigate to="/login" replace />;

  if (roles && !roles.includes(usuario.rol)) {
    return <Navigate to={usuario.rol === 'administrador' ? '/admin/dashboard' : '/aforador/iniciar-turno'} replace />;
  }

  return children;
}
