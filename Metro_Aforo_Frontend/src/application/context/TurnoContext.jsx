import { createContext, useState, useCallback } from 'react';
import { turnoService } from '../services/turnoService';
import { offlineStorage } from '../../infrastructure/storage/offlineStorage';

export const TurnoContext = createContext(null);

export function TurnoProvider({ children }) {
  const [turnoActivo, setTurnoActivo] = useState(null);
  const [turnoPendiente, setTurnoPendiente] = useState(null);
  const [loading, setLoading] = useState(false);

  const verificarTurnoActivo = useCallback(async () => {
    try {
      setLoading(true);
      const res = await turnoService.getActivo();
      if (res.data) {
        setTurnoActivo(res.data);
      }
      return res.data;
    } catch {
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const verificarTurnoPendiente = useCallback(async () => {
    try {
      setLoading(true);
      const res = await turnoService.getPendiente();
      if (res.data) {
        setTurnoPendiente(res.data);
      }
      return res.data;
    } catch {
      setTurnoPendiente(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const iniciarTurno = useCallback(async (puntoAforoId, sentido) => {
    const res = await turnoService.iniciar(puntoAforoId, sentido);
    setTurnoActivo(res.data);
    return res.data;
  }, []);

  const activarTurnoPendiente = useCallback(async (puntoAforoId, sentido) => {
    try {
      const res = await turnoService.activarPendiente(puntoAforoId, sentido);
      setTurnoActivo(res.data);
      setTurnoPendiente(null);
      return res.data;
    } catch {
      await offlineStorage.addFranjaPendiente({ franjaId: turnoPendiente?.id, accion: 'activar-turno', puntoAforoId, sentido });
      setTurnoActivo({ id_turno: turnoPendiente?.id, punto_aforo_id: puntoAforoId, sentido, activo: true, fecha_inicio: new Date().toISOString() });
      setTurnoPendiente(null);
      return { id_turno: turnoPendiente?.id };
    }
  }, [turnoPendiente]);

  const cerrarTurno = useCallback(async () => {
    if (!turnoActivo) return;
    try {
      await turnoService.cerrar(turnoActivo.id_turno);
    } catch {
      await offlineStorage.addFranjaPendiente({ franjaId: turnoActivo.id_turno, accion: 'cerrar-turno' });
    }
    setTurnoActivo(null);
  }, [turnoActivo]);

  return (
    <TurnoContext.Provider value={{
      turnoActivo, turnoPendiente, loading,
      verificarTurnoActivo, verificarTurnoPendiente,
      iniciarTurno, activarTurnoPendiente, cerrarTurno,
      setTurnoActivo,
    }}>
      {children}
    </TurnoContext.Provider>
  );
}
