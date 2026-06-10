import { offlineStorage } from './offlineStorage';
import axiosClient from '../../api/axiosClient';

const STORE_ENDPOINTS = {
  conteos: (item) => item.tipo === 'ocupacion'
    ? { url: '/conteos-ocupacion', payload: { franjaId: item.franjaId, vehiculoId: item.vehiculoId, ocupacion: item.ocupacion, cantidad: item.cantidad } }
    : { url: '/conteos-vehiculares', payload: { franjaId: item.franjaId, vehiculoId: item.vehiculoId, cantidad: item.cantidad, accion: item.accion } },
  ocupaciones: (item) => ({ url: '/conteos-ocupacion', payload: { franjaId: item.franjaId, vehiculoId: item.vehiculoId, ocupacion: item.ocupacion, cantidad: item.cantidad } }),
  paradas: (item) => ({ url: '/subidas-bajadas', payload: { franjaId: item.franjaId, vehiculoId: item.vehiculoId, suben: item.suben, bajan: item.bajan, insatisfechos: item.insatisfechos } }),
  colas: (item) => ({ url: '/colas-vehiculares', payload: { franjaId: item.franjaId, cantidadCola: item.cantidadCola, observaciones: item.observaciones } }),
  evidencias: () => null,
  franjasPendientes: (item) => {
    if (item.accion === 'iniciar') return { url: `/franjas/${item.franjaId}/iniciar`, payload: {}, method: 'put' };
    if (item.accion === 'cerrar') return { url: `/franjas/${item.franjaId}/cerrar`, payload: {}, method: 'put' };
    if (item.accion === 'omitir') return { url: `/franjas/${item.franjaId}/omitir`, payload: { motivo: item.motivo }, method: 'put' };
    if (item.accion === 'activar-turno') return { url: `/turnos/activar-pendiente`, payload: { puntoAforoId: item.puntoAforoId, sentido: item.sentido }, method: 'put' };
    if (item.accion === 'cerrar-turno') return { url: `/turnos/${item.franjaId}/cerrar`, payload: {}, method: 'put' };
    return null;
  },
};

async function processItem(item) {
  const { _store, idTemp, estado, createdAt, ...payload } = item;

  if (_store === 'evidencias') {
    const formData = new FormData();
    formData.append('foto', payload.fotoBlob, `evidencia_${idTemp}.jpg`);
    formData.append('franjaId', payload.franjaId);
    formData.append('latitud', payload.latitud);
    formData.append('longitud', payload.longitud);
    try {
      await axiosClient.post('/evidencias-foto', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 30000,
      });
      await offlineStorage.removeItem('evidencias', idTemp);
      return true;
    } catch (err) {
      if (err.status === 400 || err.status === 404 || err.status === 409 || err.status === 422) {
        await offlineStorage.removeItem('evidencias', idTemp);
        return true;
      }
      return false;
    }
  }

  const mapping = STORE_ENDPOINTS[_store];
  if (!mapping) {
    await offlineStorage.removeItem(_store, idTemp);
    return true;
  }

  try {
    const { url, payload: body, method } = mapping(item);
    const payload = { ...body, syncCreatedAt: item.createdAt };
    if (method === 'put') {
      await axiosClient.put(url, payload);
    } else {
      await axiosClient.post(url, payload);
    }
    await offlineStorage.removeItem(_store, idTemp);
    return true;
  } catch (err) {
    if (err.status === 400 || err.status === 404 || err.status === 409 || err.status === 422) {
      await offlineStorage.removeItem(_store, idTemp);
      return true;
    }
    return false;
  }
}

export async function syncAll(onProgress) {
  const items = await offlineStorage.getAllPendingFlat();
  let synced = 0;
  const total = items.length;

  for (const item of items) {
    const ok = await processItem(item);
    if (ok) synced++;
    if (onProgress) onProgress(synced, total);
  }

  return { synced, total };
}

export async function getPendingCount() {
  return offlineStorage.getPendingCount();
}
