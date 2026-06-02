import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '../components/shared/ProtectedRoute';
import { LoginPage } from '../pages/auth/LoginPage';
import { IniciarTurnoPage } from '../pages/aforador/IniciarTurnoPage';
import { MenuPrincipalPage } from '../pages/aforador/MenuPrincipalPage';
import { FranjasPage } from '../pages/aforador/FranjasPage';
import { ValidarFranjaPage } from '../pages/aforador/ValidarFranjaPage';
import { ConteoVehicularPage } from '../pages/aforador/ConteoVehicularPage';
import { ParadasColasPage } from '../pages/aforador/ParadasColasPage';
import { DashboardPage } from '../pages/admin/DashboardPage';
import { UsuariosPage } from '../pages/admin/UsuariosPage';
import { CategoriasPage } from '../pages/admin/CategoriasPage';
import { SubcategoriasPage } from '../pages/admin/SubcategoriasPage';
import { VehiculosPage } from '../pages/admin/VehiculosPage';
import { PuntosAforoPage } from '../pages/admin/PuntosAforoPage';
import { BuscarPage } from '../pages/admin/BuscarPage';
import { ReportesPage } from '../pages/admin/ReportesPage';
import { AuditoriaPage } from '../pages/admin/AuditoriaPage';
import { useAuth } from '../../application/hooks/useAuth';

function HomeRedirect() {
  const { usuario, loading } = useAuth();
  if (loading) return null;
  if (!usuario) return <Navigate to="/login" replace />;
  if (usuario.rol === 'administrador') return <Navigate to="/admin/dashboard" replace />;
  return <Navigate to="/aforador/iniciar-turno" replace />;
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomeRedirect />} />
      <Route path="/login" element={<LoginPage />} />

      {/* Aforador routes */}
      <Route path="/aforador/iniciar-turno" element={
        <ProtectedRoute roles={['aforador']}><IniciarTurnoPage /></ProtectedRoute>
      } />
      <Route path="/aforador/menu" element={
        <ProtectedRoute roles={['aforador']}><MenuPrincipalPage /></ProtectedRoute>
      } />
      <Route path="/aforador/franjas/:formato" element={
        <ProtectedRoute roles={['aforador']}><FranjasPage /></ProtectedRoute>
      } />
      <Route path="/aforador/validar/:franjaId" element={
        <ProtectedRoute roles={['aforador']}><ValidarFranjaPage /></ProtectedRoute>
      } />
      <Route path="/aforador/conteo/:franjaId" element={
        <ProtectedRoute roles={['aforador']}><ConteoVehicularPage /></ProtectedRoute>
      } />
      <Route path="/aforador/paradas/:franjaId" element={
        <ProtectedRoute roles={['aforador']}><ParadasColasPage /></ProtectedRoute>
      } />

      {/* Admin routes */}
      <Route path="/admin/dashboard" element={
        <ProtectedRoute roles={['administrador']}><DashboardPage /></ProtectedRoute>
      } />
      <Route path="/admin/usuarios" element={
        <ProtectedRoute roles={['administrador']}><UsuariosPage /></ProtectedRoute>
      } />
      <Route path="/admin/categorias" element={
        <ProtectedRoute roles={['administrador']}><CategoriasPage /></ProtectedRoute>
      } />
      <Route path="/admin/subcategorias" element={
        <ProtectedRoute roles={['administrador']}><SubcategoriasPage /></ProtectedRoute>
      } />
      <Route path="/admin/vehiculos" element={
        <ProtectedRoute roles={['administrador']}><VehiculosPage /></ProtectedRoute>
      } />
      <Route path="/admin/puntos-aforo" element={
        <ProtectedRoute roles={['administrador']}><PuntosAforoPage /></ProtectedRoute>
      } />
      <Route path="/admin/buscar" element={
        <ProtectedRoute roles={['administrador']}><BuscarPage /></ProtectedRoute>
      } />
      <Route path="/admin/reportes" element={
        <ProtectedRoute roles={['administrador']}><ReportesPage /></ProtectedRoute>
      } />
      <Route path="/admin/auditoria" element={
        <ProtectedRoute roles={['administrador']}><AuditoriaPage /></ProtectedRoute>
      } />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
