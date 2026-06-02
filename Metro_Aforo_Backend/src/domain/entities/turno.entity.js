module.exports = function buildTurno(data) {
  const usuarioId = Number(data.usuarioId);

  const fechaInicio = data.fechaInicio
    ? new Date(data.fechaInicio)
    : new Date();

  const fechaFin = data.fechaFin
    ? new Date(data.fechaFin)
    : null;

  if (!Number.isInteger(usuarioId) || usuarioId <= 0) {
    throw new Error("Usuario inválido");
  }

  if (isNaN(fechaInicio.getTime())) {
    throw new Error("Fecha de inicio inválida");
  }

  if (fechaFin && isNaN(fechaFin.getTime())) {
    throw new Error("Fecha de fin inválida");
  }

  if (fechaFin && fechaFin < fechaInicio) {
    throw new Error("La fecha fin no puede ser menor que fecha inicio");
  }

  return {
    id: data.id ?? null,
    fechaInicio,
    fechaFin,
    usuarioId,

    cerrar() {
      if (this.fechaFin) {
        throw new Error("El turno ya está cerrado");
      }
      this.fechaFin = new Date();
    },

    estaActivo() {
      return this.fechaFin === null;
    }
  };
};
