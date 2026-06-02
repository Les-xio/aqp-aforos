import axiosClient from '../../api/axiosClient';

export const evidenciaService = {
  registrar: (formData) =>
    axiosClient.post('/evidencias-foto', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};
