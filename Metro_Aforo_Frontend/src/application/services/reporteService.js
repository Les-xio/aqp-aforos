import axiosClient from '../../api/axiosClient';

export const reporteService = {
  getConteos: (params) =>
    axiosClient.get('/reportes/conteos', { params }),

  getOcupacion: (params) =>
    axiosClient.get('/reportes/ocupacion', { params }),

  getParadas: (params) =>
    axiosClient.get('/reportes/paradas', { params }),

  getColas: (params) =>
    axiosClient.get('/colas-vehiculares', { params }),

  exportarConteos: (params) =>
    axiosClient.get('/reportes/conteos', { params, responseType: 'blob' }),

  exportarOcupacion: (params) =>
    axiosClient.get('/reportes/ocupacion', { params, responseType: 'blob' }),

  exportarSubidasBajadas: (params) =>
    axiosClient.get('/reportes/paradas', { params, responseType: 'blob' }),

  exportarColas: (params) =>
    axiosClient.get('/colas-vehiculares', { params, responseType: 'blob' }),
};
