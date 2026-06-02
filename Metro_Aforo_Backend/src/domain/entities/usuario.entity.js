// Exporta una función que construye una entidad Usuario
module.exports = function buildUsuario(data) {

  // Convierte a string y elimina espacios
  // Si viene undefined o null usa ""
  const nombres = String(data.nombres || "").trim();

  // Limpia apellidos
  const apellidos = String(data.apellidos || "").trim();

  // Limpia dni
  const dni = String(data.dni || "").trim();

  // Limpia celular
  const celular = String(data.celular || "").trim();

  // Limpia correo y lo convierte a minúsculas
  const correo = String(data.correo || "")
    .trim()
    .toLowerCase();

  // Limpia rol y lo normaliza
  const rol = String(data.rol || "")
    .trim()
    .toLowerCase();

  // Limpia username
  const userName = String(data.user || "")
    .trim()
    .toLowerCase();

  

  // =========================
  // VALIDACIONES
  // =========================

  // Verifica que nombres no esté vacío
  if (!nombres) {
    throw new Error("Nombres requeridos");
  }

  // Verifica que apellidos no esté vacío
  if (!apellidos) {
    throw new Error("Apellidos requeridos");
  }

  // VALIDACIÓN DNI 8 números
  if (!/^\d{8}$/.test(dni)) {
    throw new Error("DNI inválido");
  }

  // Regex:
  // ^ inicio
  // \d{9} exactamente 9 números
  // $ final
  // Valida celulares peruanos simples
  if (!/^\d{9}$/.test(celular)) {
    throw new Error("Celular inválido");
  }

  // Expresión regular básica para validar email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Verifica formato del correo
  if (!emailRegex.test(correo)) {
    throw new Error("Correo inválido");
  }

  // Lista de roles permitidos
  const ROLES_VALIDOS = [
    "administrador",
    "aforador"
  ];

  // Verifica que el rol exista
  if (!ROLES_VALIDOS.includes(rol)) {
    throw new Error("Rol inválido");
  }

  // Verifica que exista username
  if (!userName) {
    throw new Error("Usuario requerido");
  }

  // El hash se asigna después en el caso de uso, no es requerido aquí


  // =========================
  // ENTIDAD
  // =========================

  // Retorna el objeto entidad Usuario
  return {
    id: data.id ?? null, // ID del usuario. Si no existe usa null
    nombres, // Datos personales ya limpios
    apellidos, // Datos personales ya limpios
    dni,
    celular, // Datos de contacto
    correo,
    rol, // Datos de acceso
    userName,
    passwordHash: data.passwordHash, // Contraseña hasheada

    // Estado del usuario -> true = activo || false = desactivado
    estado: data.estado ?? true,

    // Fecha de creación. Si no existe usa fecha actual
    createdAt: data.createdAt ?? new Date(),

    // Último login. Inicialmente null
    ultimoLogin: data.ultimoLogin ?? null,


    // =========================
    // MÉTODOS DEL DOMINIO
    // =========================

    // Desactiva usuario
    desactivar() {
      this.estado = false;
    },

    // Activa usuario
    activar() {
      this.estado = true;
    }
  };
};