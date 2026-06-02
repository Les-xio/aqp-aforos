import axiosClient from '../../api/axiosClient';

export const turnoService = {
  getActivo: () =>
    axiosClient.get('/turnos/activo'),

  iniciar: (puntoAforoId, sentido) =>
    axiosClient.post('/turnos/iniciar', { puntoAforoId, sentido }),

  cerrar: (id) =>
    axiosClient.put(`/turnos/${id}/cerrar`),

  getFranjas: (id) =>
    axiosClient.get(`/turnos/${id}/franjas`),

  getPuntos: (id) =>
    axiosClient.get(`/turnos/${id}/puntos`),

  listar: (params) =>
    axiosClient.get('/turnos', { params }),

  getById: (id) =>
    axiosClient.get(`/turnos/${id}`),
};
