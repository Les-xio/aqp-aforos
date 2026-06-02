// Exporta una función que construye la entidad Validación
module.exports = function buildValidacion(data) {

  // =========================
  // NORMALIZACIÓN
  // =========================

  // Convierte turnoId a número
  // Ejemplo: "5" -> 5
  const turnoId = Number(data.turnoId);

  // Convierte franjaId a número
  const franjaId = Number(data.franjaId);

  // Convierte usuarioId a número
  const usuarioId = Number(data.usuarioId);

  // Convierte fotoUrl a string seguro
  // Si viene undefined/null usa ""
  // trim() elimina espacios al inicio y final
  const fotoUrl = String(data.fotoUrl || "")
    .trim();

  // Convierte latitud a número decimal
  const latitud = Number(data.latitud);

  // Convierte longitud a número decimal
  const longitud = Number(data.longitud);

  // Si viene fechaHora usa esa fecha
  // Si no, usa fecha actual
  const fechaHora = data.fechaHora
    ? new Date(data.fechaHora)
    : new Date();

  // Normaliza estado:
  // - convierte a string
  // - elimina espacios
  // - pasa a minúsculas
  // Si no existe usa "valido"
  const estado = String(data.estado || "valido")
    .trim()
    .toLowerCase();

  // Observación opcional
  // Si existe:
  // - convierte a string
  // - limpia espacios
  // Si no existe usa null
  const observacion = data.observacion
    ? String(data.observacion).trim()
    : null;


  // =========================
  // VALIDACIONES
  // =========================

  // Verifica que turnoId:
  // - sea entero
  // - sea mayor a 0
  if (!Number.isInteger(turnoId) || turnoId <= 0) {
    throw new Error("Turno inválido");
  }

  // Verifica que franjaId:
  // - sea entero
  // - sea mayor a 0
  if (!Number.isInteger(franjaId) || franjaId <= 0) {
    throw new Error("Franja inválida");
  }

  // Verifica que usuarioId:
  // - sea entero
  // - sea mayor a 0
  if (!Number.isInteger(usuarioId) || usuarioId <= 0) {
    throw new Error("Usuario inválido");
  }

  // Verifica que exista URL de foto
  if (!fotoUrl) {
    throw new Error("Foto requerida");
  }

  // Verifica longitud mínima razonable
  // Evita valores como:
  // "a"
  // ""
  if (fotoUrl.length < 5) {
    throw new Error("URL de foto inválida");
  }

  // =========================
  // VALIDACIÓN LATITUD
  // =========================

  // Number.isNaN(latitud)
  // verifica que realmente sea número
  //
  // Latitud válida:
  // -90 hasta 90
  if (
    Number.isNaN(latitud) ||
    latitud < -90 ||
    latitud > 90
  ) {
    throw new Error("Latitud inválida");
  }

  // =========================
  // VALIDACIÓN LONGITUD
  // =========================

  // Longitud válida:
  // -180 hasta 180
  if (
    Number.isNaN(longitud) ||
    longitud < -180 ||
    longitud > 180
  ) {
    throw new Error("Longitud inválida");
  }

  // =========================
  // VALIDACIÓN FECHA
  // =========================

  // getTime() convierte fecha a timestamp
  // Si retorna NaN significa fecha inválida
  if (isNaN(fechaHora.getTime())) {
    throw new Error("Fecha inválida");
  }

  // =========================
  // VALIDACIÓN ESTADO
  // =========================

  // Estados permitidos
  const ESTADOS_VALIDOS = [
    "valido",
    "invalido"
  ];

  // Verifica que estado exista
  // dentro de la lista permitida
  if (!ESTADOS_VALIDOS.includes(estado)) {
    throw new Error("Estado inválido");
  }

  // =========================
  // VALIDACIÓN OBSERVACIÓN
  // =========================

  // Si la validación es inválida
  // obligatoriamente debe existir observación
  if (estado === "invalido" && !observacion) {
    throw new Error(
      "Debe indicar observación para validación inválida"
    );
  }


  // =========================
  // ENTIDAD
  // =========================

  // Retorna la entidad Validación
  return {

    // ID de validación
    // Si no existe usa null
    id: data.id ?? null,

    // Relaciones
    turnoId,
    franjaId,
    usuarioId,

    // Ruta o URL de la foto
    fotoUrl,

    // Coordenadas GPS
    latitud,
    longitud,

    // Fecha exacta de validación
    fechaHora,

    // Estado de la validación
    estado,

    // Observación administrativa
    observacion,


    // =========================
    // MÉTODOS DEL DOMINIO
    // =========================

    // Verifica si la validación es correcta
    esValida() {
      return this.estado === "valido";
    },

    // Verifica si fue marcada inválida
    esInvalida() {
      return this.estado === "invalido";
    },

    // Marca la validación como inválida
    invalidar(observacion) {

      // Limpia observación
      const obs = String(observacion || "")
        .trim();

      // Verifica observación requerida
      if (!obs) {
        throw new Error(
          "Observación requerida para invalidar"
        );
      }

      // Cambia estado
      this.estado = "invalido";

      // Guarda motivo/observación
      this.observacion = obs;
    }
  };
};