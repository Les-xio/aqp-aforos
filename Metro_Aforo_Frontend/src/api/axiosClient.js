import axios from 'axios';
import { API_URL } from '../domain/constants';

const axiosClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const isAuthRequest = error.config?.url?.includes('/auth/');
    const isOnLogin = window.location.pathname === '/login' || window.location.pathname === '/';
    if (error.response?.status === 401 && !isAuthRequest && !isOnLogin) {
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
      window.location.href = '/login';
    }
    const message = error.response?.data?.message || error.message || 'Error de conexión';
    const code = error.response?.data?.code || 'UNKNOWN_ERROR';
    return Promise.reject({ message, code, status: error.response?.status });
  }
);

export default axiosClient;
