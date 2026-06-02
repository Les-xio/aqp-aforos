module.exports = function buildPuntoAforo(data) {
  const nombrePunto = String(data.nombrePunto || "").trim();

  if (!nombrePunto) {
    throw new Error("Nombre del punto de aforo requerido");
  }

  return {
    id: data.id ?? null,
    nombrePunto
  };
};
