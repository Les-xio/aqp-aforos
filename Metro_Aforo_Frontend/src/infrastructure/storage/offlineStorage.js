import { openDB } from 'idb';

const DB_NAME = 'aqp-aforos-offline';
const DB_VERSION = 3;

let _db;

async function db() {
  if (!_db) {
    _db = await openDB(DB_NAME, DB_VERSION, {
      upgrade(database, oldVersion) {
        const stores = [
          'conteos', 'ocupaciones', 'paradas', 'colas', 'evidencias', 'franjasPendientes',
        ];
        for (const store of stores) {
          if (!database.objectStoreNames.contains(store)) {
            database.createObjectStore(store, { keyPath: 'idTemp' });
          }
        }
      },
    });
  }
  return _db;
}

function makeId() {
  return `off_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

async function getAll(storeName) {
  const d = await db();
  return d.getAll(storeName);
}

async function add(storeName, data) {
  const d = await db();
  const idTemp = makeId();
  await d.add(storeName, { ...data, idTemp, estado: 'PENDIENTE', createdAt: new Date().toISOString() });
  return idTemp;
}

async function remove(storeName, idTemp) {
  const d = await db();
  await d.delete(storeName, idTemp);
}

export const offlineStorage = {
  getConteosPendientes: () => getAll('conteos'),
  addConteoPendiente: (conteo) => add('conteos', { tipo: 'vehicular', ...conteo }),
  removeConteoPendiente: (idTemp) => remove('conteos', idTemp),

  getOcupacionPendientes: () => getAll('ocupaciones'),
  addOcupacionPendiente: (data) => add('ocupaciones', { tipo: 'ocupacion', ...data }),
  removeOcupacionPendiente: (idTemp) => remove('ocupaciones', idTemp),

  getParadasPendientes: () => getAll('paradas'),
  addParadaPendiente: (data) => add('paradas', data),
  removeParadaPendiente: (idTemp) => remove('paradas', idTemp),

  getColasPendientes: () => getAll('colas'),
  addColaPendiente: (data) => add('colas', data),
  removeColaPendiente: (idTemp) => remove('colas', idTemp),

  getEvidenciasPendientes: () => getAll('evidencias'),
  addEvidenciaPendiente: (data) => add('evidencias', data),
  removeEvidenciaPendiente: (idTemp) => remove('evidencias', idTemp),

  getFranjasPendientes: () => getAll('franjasPendientes'),
  addFranjaPendiente: (data) => add('franjasPendientes', data),
  removeFranjaPendiente: (idTemp) => remove('franjasPendientes', idTemp),

  getAllPending: async () => ({
    conteos: await getAll('conteos'),
    ocupaciones: await getAll('ocupaciones'),
    paradas: await getAll('paradas'),
    colas: await getAll('colas'),
    evidencias: await getAll('evidencias'),
    franjasPendientes: await getAll('franjasPendientes'),
  }),

  getAllPendingFlat: async () => {
    const stores = ['conteos', 'ocupaciones', 'paradas', 'colas', 'evidencias', 'franjasPendientes'];
    const result = [];
    for (const store of stores) {
      const items = await getAll(store);
      result.push(...items.map((item) => ({ ...item, _store: store })));
    }
    return result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  },

  getPendingCount: async () => {
    let total = 0;
    const stores = ['conteos', 'ocupaciones', 'paradas', 'colas', 'evidencias', 'franjasPendientes'];
    for (const store of stores) {
      const items = await getAll(store);
      total += items.length;
    }
    return total;
  },

  clearAll: async () => {
    const d = await db();
    const stores = ['conteos', 'ocupaciones', 'paradas', 'colas', 'evidencias', 'franjasPendientes'];
    for (const store of stores) {
      const items = await d.getAll(store);
      for (const item of items) {
        await d.delete(store, item.idTemp);
      }
    }
  },

  removeItem: (storeName, idTemp) => remove(storeName, idTemp),

  getStorageInfo: async () => {
    let totalSize = 0;
    const d = await db();
    const stores = ['conteos', 'ocupaciones', 'paradas', 'colas', 'evidencias', 'franjasPendientes'];
    const counts = {};
    for (const store of stores) {
      const items = await d.getAll(store);
      counts[store] = items.length;
      for (const item of items) {
        try {
          const str = JSON.stringify(item, (_, val) => val instanceof Blob ? `[Blob:${val.size}bytes]` : val);
          totalSize += str.length * 2;
        } catch { totalSize += 1024; }
      }
    }
    const estimate = navigator.storage?.estimate ? await navigator.storage.estimate() : null;
    return {
      stores: counts,
      totalItems: Object.values(counts).reduce((a, b) => a + b, 0),
      estimatedBytes: totalSize,
      quota: estimate?.quota ?? null,
      usage: estimate?.usage ?? null,
    };
  },

  cleanupOldItems: async (days = 7) => {
    const d = await db();
    const cutoff = new Date(Date.now() - days * 86400000).toISOString();
    const stores = ['conteos', 'ocupaciones', 'paradas', 'colas', 'evidencias', 'franjasPendientes'];
    let removed = 0;
    for (const store of stores) {
      const items = await d.getAll(store);
      for (const item of items) {
        if (item.createdAt && item.createdAt < cutoff) {
          await d.delete(store, item.idTemp);
          removed++;
        }
      }
    }
    return removed;
  },

  getStoreSize: async (storeName) => {
    const d = await db();
    const items = await d.getAll(storeName);
    return items.reduce((acc, item) => {
      try {
        const str = JSON.stringify(item, (_, val) => val instanceof Blob ? `[Blob:${val.size}bytes]` : val);
        return acc + str.length * 2;
      } catch { return acc + 1024; }
    }, 0);
  },
};
