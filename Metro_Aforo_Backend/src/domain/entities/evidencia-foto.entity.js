module.exports = function buildEvidenciaFoto(data) {
  const franjaId = Number(data.franjaId);
  const usuarioId = Number(data.usuarioId);
  const fotoUrl = String(data.fotoUrl || "").trim();
  const latitud = data.latitud != null ? Number(data.latitud) : 0;
  const longitud = data.longitud != null ? Number(data.longitud) : 0;

  if (!Number.isInteger(franjaId) || franjaId <= 0) {
    throw new Error("Franja inválida");
  }

  if (!Number.isInteger(usuarioId) || usuarioId <= 0) {
    throw new Error("Usuario inválido");
  }

  if (!fotoUrl || fotoUrl.length < 5) {
    throw new Error("Foto requerida");
  }

  if (Number.isNaN(latitud) || latitud < -90 || latitud > 90) {
    throw new Error("Latitud inválida");
  }

  if (Number.isNaN(longitud) || longitud < -180 || longitud > 180) {
    throw new Error("Longitud inválida");
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
    usuarioId,
    fotoUrl,
    latitud,
    longitud,
    fechaHora
  };
};
