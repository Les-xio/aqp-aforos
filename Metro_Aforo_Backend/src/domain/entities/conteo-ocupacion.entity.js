const OCUPACIONES = require("../constants/ocupaciones");

module.exports = function buildConteoOcupacion(data) {
  const franjaId = Number(data.franjaId);
  const vehiculoId = Number(data.vehiculoId);

  const ocupacion = String(data.ocupacion || "").trim().toLowerCase();

  const cantidad = Number(data.cantidad ?? 1);

  if (!Number.isInteger(franjaId) || franjaId <= 0) {
    throw new Error("Franja inválida");
  }

  if (!Number.isInteger(vehiculoId) || vehiculoId <= 0) {
    throw new Error("Vehículo inválido");
  }

  if (!OCUPACIONES.includes(ocupacion)) {
    throw new Error("Ocupación inválida");
  }

  if (!Number.isInteger(cantidad) || cantidad < 0) {
    throw new Error("Cantidad inválida");
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
    ocupacion,
    cantidad,
    fechaHora,
    estadoSincronizacion: data.estadoSincronizacion || "PENDIENTE"
  };
};
