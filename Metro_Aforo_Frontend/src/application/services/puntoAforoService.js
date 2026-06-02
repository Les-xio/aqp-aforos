import axiosClient from '../../api/axiosClient';

export const puntoAforoService = {
  listar: (params) =>
    axiosClient.get('/puntos-aforo', { params }),

  crear: (data) =>
    axiosClient.post('/puntos-aforo', data),

  actualizar: (id, data) =>
    axiosClient.put(`/puntos-aforo/${id}`, data),

  eliminar: (id) =>
    axiosClient.delete(`/puntos-aforo/${id}`),
};
