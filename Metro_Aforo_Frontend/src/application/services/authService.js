import axiosClient from '../../api/axiosClient';

export const authService = {
  login: (correo, password) =>
    axiosClient.post('/auth/login', { correo, password }),

  logout: () =>
    axiosClient.post('/auth/logout'),

  getMe: () =>
    axiosClient.get('/auth/me'),

  cambiarPassword: (passwordActual, nuevaPassword) =>
    axiosClient.put('/auth/cambiar-password', { passwordActual, nuevaPassword }),

  solicitarRecuperacion: (correo) =>
    axiosClient.post('/auth/solicitar-recuperacion', { correo }),

  restablecerPassword: (token, nuevaPassword) =>
    axiosClient.post('/auth/restablecer-password', { token, nuevaPassword }),
};
