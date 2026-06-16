import axiosClient from '../../api/axiosClient';

export const turnoService = {
  getActivo: () =>
    axiosClient.get('/turnos/activo'),

  getPendiente: () =>
    axiosClient.get('/turnos/pendiente'),

  iniciar: (puntoAforoId, sentido) =>
    axiosClient.post('/turnos/iniciar', { puntoAforoId, sentido }),

  activarPendiente: (puntoAforoId, sentido) =>
    axiosClient.put('/turnos/activar-pendiente', { puntoAforoId, sentido }),

  cerrar: (id) =>
    axiosClient.put(`/turnos/${id}/cerrar`),

  cerrarAdmin: (id) =>
    axiosClient.put(`/turnos/${id}/cerrar-admin`),

  getFranjas: (id) =>
    axiosClient.get(`/turnos/${id}/franjas`),

  getPuntos: (id) =>
    axiosClient.get(`/turnos/${id}/puntos`),

  listar: (params) =>
    axiosClient.get('/turnos', { params }),

  getById: (id) =>
    axiosClient.get(`/turnos/${id}`),

  generarAdmin: (usuarioId, horas, fechaInicio) =>
    axiosClient.post('/turnos/generar-admin', { usuarioId, horas, fechaInicio }),
};
