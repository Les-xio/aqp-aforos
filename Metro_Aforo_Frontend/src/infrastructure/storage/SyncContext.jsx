import { createContext, useState, useEffect, useCallback, useContext, useRef } from 'react';
import { syncAll, getPendingCount } from './syncService';
import { offlineStorage } from './offlineStorage';
import { useOnlineStatus } from '../../application/hooks/useOnlineStatus';
import { Snackbar, Alert, Box, Typography } from '@mui/material';
import WifiOffIcon from '@mui/icons-material/WifiOff';
import WifiIcon from '@mui/icons-material/Wifi';
import CloudSyncIcon from '@mui/icons-material/CloudSync';

const SyncContext = createContext(null);

export function useSync() {
  const ctx = useContext(SyncContext);
  if (!ctx) return { online: true, pendingCount: 0, syncing: false, lastSync: null, syncProgress: { synced: 0, total: 0 }, storageInfo: null, syncNow: () => {}, refreshPendingCount: () => {}, refreshStorageInfo: () => {} };
  return ctx;
}

const STORAGE_WARN_MB = 40;

export function SyncProvider({ children }) {
  const online = useOnlineStatus();
  const [pendingCount, setPendingCount] = useState(0);
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState(null);
  const [syncProgress, setSyncProgress] = useState({ synced: 0, total: 0 });
  const [storageInfo, setStorageInfo] = useState(null);

  const [offlineSnack, setOfflineSnack] = useState(false);
  const [onlineSnack, setOnlineSnack] = useState(false);
  const [syncSnack, setSyncSnack] = useState(false);
  const [syncSnackCount, setSyncSnackCount] = useState(0);
  const wasOffline = useRef(false);

  const refreshPendingCount = useCallback(async () => {
    const count = await getPendingCount();
    setPendingCount(count);
  }, []);

  const refreshStorageInfo = useCallback(async () => {
    try {
      const info = await offlineStorage.getStorageInfo();
      setStorageInfo(info);
      if (info.estimatedBytes > STORAGE_WARN_MB * 1024 * 1024) {
        console.warn(`[Sync] Almacenamiento cercano al límite: ${(info.estimatedBytes / 1024 / 1024).toFixed(1)}MB`);
      }
    } catch { /* ignore */ }
  }, []);

  const syncNow = useCallback(async () => {
    if (syncing || !online) return;
    setSyncing(true);
    setSyncProgress({ synced: 0, total: 0 });
    try {
      const result = await syncAll((synced, total) => {
        setSyncProgress({ synced, total });
      });
      setLastSync(new Date());
      const removed = await offlineStorage.cleanupOldItems(7);
      if (removed > 0) console.log(`[Sync] Limpieza automática: ${removed} items antiguos eliminados`);
      await refreshPendingCount();
      await refreshStorageInfo();
      if (result.total > 0) {
        setSyncSnackCount(result.synced);
        setSyncSnack(true);
      }
    } catch {
    } finally {
      setSyncing(false);
    }
  }, [syncing, online, refreshPendingCount, refreshStorageInfo]);

  useEffect(() => {
    refreshPendingCount();
    refreshStorageInfo();
  }, [refreshPendingCount, refreshStorageInfo]);

  useEffect(() => {
    if (!online) {
      wasOffline.current = true;
      setOfflineSnack(true);
    } else if (wasOffline.current) {
      wasOffline.current = false;
      setOnlineSnack(true);
    }
  }, [online]);

  useEffect(() => {
    if (online && pendingCount > 0 && !syncing) {
      syncNow();
    }
  }, [online, pendingCount, syncing, syncNow]);

  useEffect(() => {
    const interval = setInterval(refreshStorageInfo, 300000);
    return () => clearInterval(interval);
  }, [refreshStorageInfo]);

  return (
    <SyncContext.Provider value={{
      online, pendingCount, syncing, lastSync, syncProgress, storageInfo,
      syncNow, refreshPendingCount, refreshStorageInfo,
    }}>
      {children}

      <Snackbar
        open={offlineSnack}
        autoHideDuration={4000}
        onClose={() => setOfflineSnack(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          icon={<WifiOffIcon />}
          severity="warning"
          onClose={() => setOfflineSnack(false)}
          sx={{ borderRadius: '12px', fontWeight: 500, fontSize: 14, boxShadow: '0 4px 16px rgba(0,0,0,0.15)' }}
        >
          <Box>
            <Typography sx={{ fontWeight: 600, fontSize: 14 }}>Sin conexión</Typography>
            <Typography sx={{ fontSize: 13, opacity: 0.9 }}>Los datos se guardarán en caché local y se sincronizarán al recuperar la conexión.</Typography>
          </Box>
        </Alert>
      </Snackbar>

      <Snackbar
        open={onlineSnack}
        autoHideDuration={4000}
        onClose={() => setOnlineSnack(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          icon={<WifiIcon />}
          severity="success"
          onClose={() => setOnlineSnack(false)}
          sx={{ borderRadius: '12px', fontWeight: 500, fontSize: 14, boxShadow: '0 4px 16px rgba(0,0,0,0.15)' }}
        >
          <Box>
            <Typography sx={{ fontWeight: 600, fontSize: 14 }}>Conexión restablecida</Typography>
            <Typography sx={{ fontSize: 13, opacity: 0.9 }}>El sistema está en línea nuevamente.</Typography>
          </Box>
        </Alert>
      </Snackbar>

      <Snackbar
        open={syncSnack}
        autoHideDuration={5000}
        onClose={() => setSyncSnack(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          icon={<CloudSyncIcon />}
          severity="success"
          onClose={() => setSyncSnack(false)}
          sx={{ borderRadius: '12px', fontWeight: 500, fontSize: 14, boxShadow: '0 4px 16px rgba(0,0,0,0.15)' }}
        >
          <Box>
            <Typography sx={{ fontWeight: 600, fontSize: 14 }}>Datos sincronizados</Typography>
            <Typography sx={{ fontSize: 13, opacity: 0.9 }}>
              {syncSnackCount > 0
                ? `${syncSnackCount} registro${syncSnackCount !== 1 ? 's' : ''} guardado${syncSnackCount !== 1 ? 's' : ''} correctamente.`
                : 'Todos los datos están al día.'}
            </Typography>
          </Box>
        </Alert>
      </Snackbar>
    </SyncContext.Provider>
  );
}
