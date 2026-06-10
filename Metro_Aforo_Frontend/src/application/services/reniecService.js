import axiosClient from '../../api/axiosClient';

export const reniecService = {
  consultarDni: (dni) =>
    axiosClient.get(`/reniec/consultar/${dni}`),
};
