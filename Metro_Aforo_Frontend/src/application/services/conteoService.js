import axiosClient from '../../api/axiosClient';

export const conteoService = {
  registrarVehicular: (data) =>
    axiosClient.post('/conteos-vehiculares', data),

  listarVehicular: (params) =>
    axiosClient.get('/conteos-vehiculares', { params }),

  registrarOcupacion: (data) =>
    axiosClient.post('/conteos-ocupacion', data),

  listarOcupacion: (params) =>
    axiosClient.get('/conteos-ocupacion', { params }),
};
