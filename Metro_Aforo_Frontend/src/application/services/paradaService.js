import axiosClient from '../../api/axiosClient';

export const paradaService = {
  registrarSubidasBajadas: (data) =>
    axiosClient.post('/subidas-bajadas', data),

  listarSubidasBajadas: (params) =>
    axiosClient.get('/subidas-bajadas', { params }),

  registrarColaVehicular: (data) =>
    axiosClient.post('/colas-vehiculares', data),

  listarColasVehiculares: (params) =>
    axiosClient.get('/colas-vehiculares', { params }),
};
