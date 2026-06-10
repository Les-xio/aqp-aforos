import { createContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';
import { ROLES } from '../../domain/constants';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(() => {
    try {
      const stored = localStorage.getItem('usuario');
      return stored ? JSON.parse(stored) : null;
    } catch {
      localStorage.removeItem('usuario');
      localStorage.removeItem('token');
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      authService.getMe()
        .then((res) => {
          setUsuario(res.data);
          localStorage.setItem('usuario', JSON.stringify(res.data));
        })
        .catch(() => {
          localStorage.removeItem('token');
          localStorage.removeItem('usuario');
          setToken(null);
          setUsuario(null);
        })
        .finally(() => setLoading(false));
    } else {
      localStorage.removeItem('usuario');
      setUsuario(null);
      setLoading(false);
    }
  }, [token]);

  const login = useCallback(async (correo, password) => {
    const res = await authService.login(correo, password);
    const { token: newToken, usuario: user } = res.data;
    localStorage.setItem('token', newToken);
    localStorage.setItem('usuario', JSON.stringify(user));
    setToken(newToken);
    setUsuario(user);
    return user;
  }, []);

  const logout = useCallback(() => {
    authService.logout().catch(() => {});
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    setToken(null);
    setUsuario(null);
  }, []);

  const isAdmin = usuario?.rol === ROLES.ADMINISTRADOR;
  const isAforador = usuario?.rol === ROLES.AFORADOR;

  return (
    <AuthContext.Provider value={{
      usuario, token, loading, login, logout, isAdmin, isAforador,
    }}>
      {children}
    </AuthContext.Provider>
  );
}
