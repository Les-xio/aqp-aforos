module.exports = function buildConteoVehicular(data) {
  const franjaId = Number(data.franjaId);
  const vehiculoId = Number(data.vehiculoId);
  const cantidad = Number(data.cantidad ?? 1);
  const accion = data.accion ?? "+1";

  const ACCIONES_VALIDAS = ["+1", "-1"];

  if (!Number.isInteger(franjaId) || franjaId <= 0) {
    throw new Error("Franja inválida");
  }

  if (!Number.isInteger(vehiculoId) || vehiculoId <= 0) {
    throw new Error("Vehículo inválido");
  }

  if (!Number.isInteger(cantidad) || cantidad < 0) {
    throw new Error("Cantidad inválida");
  }

  if (!ACCIONES_VALIDAS.includes(accion)) {
    throw new Error("Acción inválida");
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
    cantidad,
    accion,
    fechaHora,
    estadoSincronizacion: data.estadoSincronizacion || "PENDIENTE"
  };
};
