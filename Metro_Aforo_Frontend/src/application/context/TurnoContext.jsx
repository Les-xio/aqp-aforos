import { createContext, useState, useCallback } from 'react';
import { turnoService } from '../services/turnoService';

export const TurnoContext = createContext(null);

export function TurnoProvider({ children }) {
  const [turnoActivo, setTurnoActivo] = useState(null);
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
      setTurnoActivo(null);
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

  const cerrarTurno = useCallback(async () => {
    if (!turnoActivo) return;
    await turnoService.cerrar(turnoActivo.id_turno);
    setTurnoActivo(null);
  }, [turnoActivo]);

  return (
    <TurnoContext.Provider value={{
      turnoActivo, loading, verificarTurnoActivo, iniciarTurno, cerrarTurno,
      setTurnoActivo,
    }}>
      {children}
    </TurnoContext.Provider>
  );
}
