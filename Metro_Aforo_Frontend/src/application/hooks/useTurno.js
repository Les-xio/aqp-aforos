import { useContext } from 'react';
import { TurnoContext } from '../context/TurnoContext';

export function useTurno() {
  const context = useContext(TurnoContext);
  if (!context) throw new Error('useTurno debe usarse dentro de TurnoProvider');
  return context;
}
