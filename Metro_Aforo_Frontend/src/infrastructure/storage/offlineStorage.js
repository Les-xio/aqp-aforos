const STORAGE_KEYS = {
  PENDING_COUNTS: 'aqp_pending_conteos',
  PENDING_OCCUPANCY: 'aqp_pending_ocupacion',
  PENDING_PARADAS: 'aqp_pending_paradas',
  PENDING_COLAS: 'aqp_pending_colas',
  PENDING_EVIDENCIAS: 'aqp_pending_evidencias',
  PENDING_TURNOS: 'aqp_pending_turnos',
};

function getPending(key) {
  try {
    return JSON.parse(localStorage.getItem(key) || '[]');
  } catch {
    return [];
  }
}

function savePending(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

export const offlineStorage = {
  getConteosPendientes: () => getPending(STORAGE_KEYS.PENDING_COUNTS),
  addConteoPendiente: (conteo) => {
    const items = getPending(STORAGE_KEYS.PENDING_COUNTS);
    items.push({ ...conteo, idTemp: Date.now().toString(), estado: 'PENDIENTE' });
    savePending(STORAGE_KEYS.PENDING_COUNTS, items);
  },
  removeConteoPendiente: (idTemp) => {
    const items = getPending(STORAGE_KEYS.PENDING_COUNTS).filter(i => i.idTemp !== idTemp);
    savePending(STORAGE_KEYS.PENDING_COUNTS, items);
  },

  getOcupacionPendientes: () => getPending(STORAGE_KEYS.PENDING_OCCUPANCY),
  addOcupacionPendiente: (data) => {
    const items = getPending(STORAGE_KEYS.PENDING_OCCUPANCY);
    items.push({ ...data, idTemp: Date.now().toString(), estado: 'PENDIENTE' });
    savePending(STORAGE_KEYS.PENDING_OCCUPANCY, items);
  },
  removeOcupacionPendiente: (idTemp) => {
    const items = getPending(STORAGE_KEYS.PENDING_OCCUPANCY).filter(i => i.idTemp !== idTemp);
    savePending(STORAGE_KEYS.PENDING_OCCUPANCY, items);
  },

  getParadasPendientes: () => getPending(STORAGE_KEYS.PENDING_PARADAS),
  addParadaPendiente: (data) => {
    const items = getPending(STORAGE_KEYS.PENDING_PARADAS);
    items.push({ ...data, idTemp: Date.now().toString(), estado: 'PENDIENTE' });
    savePending(STORAGE_KEYS.PENDING_PARADAS, items);
  },
  removeParadaPendiente: (idTemp) => {
    const items = getPending(STORAGE_KEYS.PENDING_PARADAS).filter(i => i.idTemp !== idTemp);
    savePending(STORAGE_KEYS.PENDING_PARADAS, items);
  },

  getColasPendientes: () => getPending(STORAGE_KEYS.PENDING_COLAS),
  addColaPendiente: (data) => {
    const items = getPending(STORAGE_KEYS.PENDING_COLAS);
    items.push({ ...data, idTemp: Date.now().toString(), estado: 'PENDIENTE' });
    savePending(STORAGE_KEYS.PENDING_COLAS, items);
  },
  removeColaPendiente: (idTemp) => {
    const items = getPending(STORAGE_KEYS.PENDING_COLAS).filter(i => i.idTemp !== idTemp);
    savePending(STORAGE_KEYS.PENDING_COLAS, items);
  },

  getEvidenciasPendientes: () => getPending(STORAGE_KEYS.PENDING_EVIDENCIAS),
  addEvidenciaPendiente: (data) => {
    const items = getPending(STORAGE_KEYS.PENDING_EVIDENCIAS);
    items.push({ ...data, idTemp: Date.now().toString(), estado: 'PENDIENTE' });
    savePending(STORAGE_KEYS.PENDING_EVIDENCIAS, items);
  },
  removeEvidenciaPendiente: (idTemp) => {
    const items = getPending(STORAGE_KEYS.PENDING_EVIDENCIAS).filter(i => i.idTemp !== idTemp);
    savePending(STORAGE_KEYS.PENDING_EVIDENCIAS, items);
  },

  getAllPending: () => ({
    conteos: getPending(STORAGE_KEYS.PENDING_COUNTS),
    ocupaciones: getPending(STORAGE_KEYS.PENDING_OCCUPANCY),
    paradas: getPending(STORAGE_KEYS.PENDING_PARADAS),
    colas: getPending(STORAGE_KEYS.PENDING_COLAS),
    evidencias: getPending(STORAGE_KEYS.PENDING_EVIDENCIAS),
  }),

  clearAll: () => {
    Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
  },
};
