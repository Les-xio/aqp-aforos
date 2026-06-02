export const ROLES = {
  ADMINISTRADOR: 'administrador',
  AFORADOR: 'aforador',
};

export const SENTIDOS = [
  'norte', 'sur', 'este', 'oeste',
  'noreste', 'noroeste', 'sureste', 'suroeste',
];

export const ESTADOS_FRANJA = {
  PENDIENTE: 'pendiente',
  COMPLETADA: 'completada',
  OMITIDA: 'omitida',
};

export const ESTADOS_SINCRONIZACION = {
  PENDIENTE: 'PENDIENTE',
  SINCRONIZADO: 'SINCRONIZADO',
  ERROR: 'ERROR',
};

export const NIVELES_OCUPACION = [
  'vacio', 'medio', 'lleno', 'rebosando',
];

export const FORMATOS = {
  CONTO_VEHICULAR: 1,
  PARADAS_COLAS: 2,
};

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export const FRANJA_DURACION_MIN = 15;
