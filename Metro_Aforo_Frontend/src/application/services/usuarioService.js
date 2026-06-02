import axiosClient from '../../api/axiosClient';

export const usuarioService = {
  listar: (params) =>
    axiosClient.get('/usuarios', { params }),

  crear: (data) =>
    axiosClient.post('/usuarios', data),

  actualizar: (id, data) =>
    axiosClient.put(`/usuarios/${id}`, data),

  eliminar: (id) =>
    axiosClient.delete(`/usuarios/${id}`),
};
