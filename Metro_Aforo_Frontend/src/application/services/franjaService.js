import axiosClient from '../../api/axiosClient';

export const franjaService = {
  getById: (id) =>
    axiosClient.get(`/franjas/${id}`),

  iniciar: (id) =>
    axiosClient.put(`/franjas/${id}/iniciar`),

  cerrar: (id) =>
    axiosClient.put(`/franjas/${id}/cerrar`),

  omitir: (id, motivo) =>
    axiosClient.put(`/franjas/${id}/omitir`, { motivo }),
};
