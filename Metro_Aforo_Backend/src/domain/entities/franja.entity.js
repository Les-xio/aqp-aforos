module.exports = function buildFranja(data) {

  // =========================
  // NORMALIZACIÓN
  // =========================

  const turnoId = Number(data.turnoId);

  const inicio = new Date(data.inicio);

  const fin = new Date(data.fin);

  const estado = String(data.estado || "pendiente")
    .trim()
    .toLowerCase();

  const motivo = data.motivo
    ? String(data.motivo).trim().toLowerCase()
    : null;


  // =========================
  // VALIDACIONES
  // =========================

  // Turno válido
  if (!Number.isInteger(turnoId) || turnoId <= 0) {
    throw new Error("Turno inválido");
  }

  // Fechas válidas
  if (isNaN(inicio.getTime()) || isNaN(fin.getTime())) {
    throw new Error("Fechas inválidas");
  }

  // Fin debe ser mayor
  if (fin <= inicio) {
    throw new Error("Rango de tiempo inválido");
  }

  // Estados válidos
  const ESTADOS_VALIDOS = [
    "pendiente",
    "completada",
    "omitida"
  ];

  if (!ESTADOS_VALIDOS.includes(estado)) {
    throw new Error("Estado inválido");
  }

  // Motivos válidos
  const MOTIVOS_VALIDOS = [
    "break",
    "almuerzo",
    "pausa tecnica"
  ];

  // Validar motivo
  if (motivo && !MOTIVOS_VALIDOS.includes(motivo)) {
    throw new Error("Motivo inválido");
  }

  // Solo omitida puede tener motivo
  if (estado !== "omitida" && motivo) {
    throw new Error("Solo una franja omitida puede tener motivo");
  }


  // =========================
  // ENTIDAD
  // =========================

  return {

    id: data.id ?? null,
    inicio,
    fin,
    estado,
    motivo,
    turnoId,


    // =========================
    // ESTADO TEMPORAL
    // =========================

    esPasada() {
      return new Date() > this.fin;
    },

    esFutura() {
      return new Date() < this.inicio;
    },

    esActual() {
      const ahora = new Date();

      return (
        ahora >= this.inicio &&
        ahora < this.fin
      );
    },


    // =========================
    // ESTADO OPERATIVO
    // =========================

    estaPendiente() {
      return this.estado === "pendiente";
    },

    estaCompletada() {
      return this.estado === "completada";
    },

    estaOmitida() {
      return this.estado === "omitida";
    },


    // =========================
    // COMPLETAR
    // =========================

    completar() {

      if (this.estaCompletada()) {
        throw new Error("La franja ya fue completada");
      }

      if (this.estaOmitida()) {
        throw new Error("La franja fue omitida");
      }

      if (!this.esActual()) {
        throw new Error("Solo se puede completar la franja actual");
      }

      this.estado = "completada";

      this.motivo = null;
    },


    // =========================
    // OMITIR
    // =========================

    omitir(motivo = "break") {

      if (this.estaCompletada()) {
        throw new Error("No se puede omitir una franja completada");
      }

      const motivoNormalizado = motivo
        .trim()
        .toLowerCase();

      if (!MOTIVOS_VALIDOS.includes(motivoNormalizado)) {
        throw new Error("Motivo inválido");
      }

      if (!this.esActual()) {
        throw new Error("Solo se puede omitir la franja actual");
      }

      this.estado = "omitida";

      this.motivo = motivoNormalizado;
    }
  };
};