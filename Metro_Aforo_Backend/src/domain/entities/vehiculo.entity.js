module.exports = function buildVehiculo(data) {
  const subcategoriaId = Number(data.subcategoriaId);
  const tipo = String(data.tipo || "").trim().toLowerCase();

  if (!Number.isInteger(subcategoriaId) || subcategoriaId <= 0) {
    throw new Error("Subcategoría inválida");
  }

  if (!tipo) {
    throw new Error("Tipo de vehículo requerido");
  }

  return {
    id: data.id ?? null,
    subcategoriaId,
    tipo,
    activo: data.activo ?? true
  };
};
