module.exports = function buildSubidasBajadas(data) {
  const franjaId = Number(data.franjaId);
  const vehiculoId = Number(data.vehiculoId);
  const suben = Number(data.suben ?? 0);
  const bajan = Number(data.bajan ?? 0);
  const insatisfechos = Number(data.insatisfechos ?? 0);

  if (!Number.isInteger(franjaId) || franjaId <= 0) {
    throw new Error("Franja inválida");
  }

  if (!Number.isInteger(vehiculoId) || vehiculoId <= 0) {
    throw new Error("Vehículo inválido");
  }

  if (
    !Number.isInteger(suben) || suben < 0 ||
    !Number.isInteger(bajan) || bajan < 0 ||
    !Number.isInteger(insatisfechos) || insatisfechos < 0
  ) {
    throw new Error("Cantidades inválidas");
  }

  if (suben === 0 && bajan === 0 && insatisfechos === 0) {
    throw new Error("Debe existir al menos un movimiento");
  }

  const fechaHora = data.fechaHora
    ? new Date(data.fechaHora)
    : new Date();

  if (isNaN(fechaHora.getTime())) {
    throw new Error("Fecha inválida");
  }

  return {
    id: data.id ?? null,
    franjaId,
    vehiculoId,
    suben,
    bajan,
    insatisfechos,
    fechaHora,
    estadoSincronizacion: data.estadoSincronizacion || "PENDIENTE",

    totalPasajeros() {
      return this.suben + this.bajan;
    },

    totalDemanda() {
      return this.suben + this.insatisfechos;
    },

    tieneDemandaInsatisfecha() {
      return this.insatisfechos > 0;
    }
  };
};
