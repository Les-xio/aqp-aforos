import axiosClient from '../../api/axiosClient';

export const vehiculoService = {
  listar: (params) =>
    axiosClient.get('/vehiculos', { params }),

  crear: (data) =>
    axiosClient.post('/vehiculos', data),

  actualizar: (id, data) =>
    axiosClient.put(`/vehiculos/${id}`, data),

  eliminar: (id) =>
    axiosClient.delete(`/vehiculos/${id}`),

  getCategorias: () =>
    axiosClient.get('/vehiculos/categorias'),

  crearCategoria: (data) =>
    axiosClient.post('/vehiculos/categorias', data),

  actualizarCategoria: (id, data) =>
    axiosClient.put(`/vehiculos/categorias/${id}`, data),

  eliminarCategoria: (id) =>
    axiosClient.delete(`/vehiculos/categorias/${id}`),

  getSubcategorias: (categoriaId) =>
    axiosClient.get(`/vehiculos/categorias/${categoriaId}/subcategorias`),

  crearSubcategoria: (data) =>
    axiosClient.post('/vehiculos/subcategorias', data),

  actualizarSubcategoria: (id, data) =>
    axiosClient.put(`/vehiculos/subcategorias/${id}`, data),

  eliminarSubcategoria: (id) =>
    axiosClient.delete(`/vehiculos/subcategorias/${id}`),

  getByZona: (zona) =>
    axiosClient.get(`/vehiculos/zona/${zona}`),
};
