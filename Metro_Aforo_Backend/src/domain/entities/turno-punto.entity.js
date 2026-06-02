const SENTIDOS_VALIDOS = [
  "norte", "sur", "este", "oeste",
  "noreste", "noroeste", "sureste", "suroeste"
];

module.exports = function buildTurnoPunto(data) {
  const turnoId = Number(data.turnoId);
  const puntoAforoId = Number(data.puntoAforoId);
  const sentido = String(data.sentido || "").trim().toLowerCase();

  if (!Number.isInteger(turnoId) || turnoId <= 0) {
    throw new Error("Turno inválido");
  }

  if (!Number.isInteger(puntoAforoId) || puntoAforoId <= 0) {
    throw new Error("Punto de aforo inválido");
  }

  if (!SENTIDOS_VALIDOS.includes(sentido)) {
    throw new Error("Sentido inválido");
  }

  return {
    id: data.id ?? null,
    turnoId,
    puntoAforoId,
    sentido
  };
};
