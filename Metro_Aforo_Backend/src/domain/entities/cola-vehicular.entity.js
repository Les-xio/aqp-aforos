module.exports = function buildColaVehicular(data) {
  const franjaId = Number(data.franjaId);
  const cantidadCola = Number(data.cantidadCola);

  if (!Number.isInteger(franjaId) || franjaId <= 0) {
    throw new Error("Franja inválida");
  }

  if (!Number.isInteger(cantidadCola) || cantidadCola < 0) {
    throw new Error("Cantidad de cola inválida");
  }

  const observaciones =
    typeof data.observaciones === "string"
      ? data.observaciones.trim() || null
      : null;

  const fechaHora = data.fechaHora
    ? new Date(data.fechaHora)
    : new Date();

  if (isNaN(fechaHora.getTime())) {
    throw new Error("Fecha inválida");
  }

  return {
    id: data.id ?? null,
    franjaId,
    cantidadCola,
    observaciones,
    fechaHora,
    estadoSincronizacion: data.estadoSincronizacion || "PENDIENTE"
  };
};
