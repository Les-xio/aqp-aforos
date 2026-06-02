const UsuarioRepository = require('./repositories/UsuarioRepository');
const PuntoAforoRepository = require('./repositories/PuntoAforoRepository');
const TurnoRepository = require('./repositories/TurnoRepository');
const TurnoPuntoRepository = require('./repositories/TurnoPuntoRepository');
const FranjaHorariaRepository = require('./repositories/FranjaHorariaRepository');
const VehiculoRepository = require('./repositories/VehiculoRepository');
const EvidenciaFotoRepository = require('./repositories/EvidenciaFotoRepository');
const ConteoVehicularRepository = require('./repositories/ConteoVehicularRepository');
const ConteoOcupacionRepository = require('./repositories/ConteoOcupacionRepository');
const SubidasBajadasRepository = require('./repositories/SubidasBajadasRepository');
const ColaVehicularRepository = require('./repositories/ColaVehicularRepository');
const PasswordResetRepository = require('./repositories/PasswordResetRepository');
const CategoriaRepository = require('./repositories/CategoriaRepository');
const SubcategoriaRepository = require('./repositories/SubcategoriaRepository');
const AuditoriaRepository = require('./repositories/AuditoriaRepository');

const IniciarSesionUseCase = require('../domain/use-cases/auth/iniciar-sesion.usecase');
const CerrarSesionUseCase = require('../domain/use-cases/auth/cerrar-sesion.usecase');
const CambiarPasswordUseCase = require('../domain/use-cases/auth/cambiar-password.usecase');
const SolicitarRecuperacionPasswordUseCase = require('../domain/use-cases/auth/solicitar-recuperacion-password.usecase');
const RestablecerPasswordUseCase = require('../domain/use-cases/auth/restablecer-password.usecase');
const ObtenerUsuarioAutenticadoUseCase = require('../domain/use-cases/auth/obtener-usuario-autenticado.usecase');
const RegistrarUsuarioUseCase = require('../domain/use-cases/usuario/registrar-usuario.usecase');
const ActualizarUsuarioUseCase = require('../domain/use-cases/usuario/actualizar-usuario.usecase');
const EliminarUsuarioUseCase = require('../domain/use-cases/usuario/eliminar-usuario.usecase');
const ObtenerUsuariosUseCase = require('../domain/use-cases/usuario/obtener-usuarios.usecase');
const IniciarTurnoUseCase = require('../domain/use-cases/turno/iniciar-turno.usecase');
const CerrarTurnoUseCase = require('../domain/use-cases/turno/cerrar-turno.usecase');
const IniciarFranjaUseCase = require('../domain/use-cases/franja/iniciar-franja.usecase');
const CerrarFranjaUseCase = require('../domain/use-cases/franja/cerrar-franja.usecase');
const RegistrarConteoVehicularUseCase = require('../domain/use-cases/conteo/registrar-conteo-vehicular.usecase');
const RegistrarConteoOcupacionUseCase = require('../domain/use-cases/conteo/registrar-conteo-ocupacion.usecase');
const RegistrarEvidenciaFotoUseCase = require('../domain/use-cases/evidencia/registrar-evidencia-foto.usecase');
const RegistrarSubidasBajadasUseCase = require('../domain/use-cases/parada/registrar-subidas-bajadas.usecase');
const RegistrarColaVehicularUseCase = require('../domain/use-cases/parada/registrar-cola-vehicular.usecase');

const { JWT_SECRET } = require('../presentation/middlewares/auth');

const repositories = {
  usuarioRepository: new UsuarioRepository(),
  puntoAforoRepository: new PuntoAforoRepository(),
  turnoRepository: new TurnoRepository(),
  turnoPuntoRepository: new TurnoPuntoRepository(),
  franjaHorariaRepository: new FranjaHorariaRepository(),
  vehiculoRepository: new VehiculoRepository(),
  evidenciaFotoRepository: new EvidenciaFotoRepository(),
  conteoVehicularRepository: new ConteoVehicularRepository(),
  conteoOcupacionRepository: new ConteoOcupacionRepository(),
  subidasBajadasRepository: new SubidasBajadasRepository(),
  colaVehicularRepository: new ColaVehicularRepository(),
  passwordResetRepository: new PasswordResetRepository(),
  categoriaRepository: new CategoriaRepository(),
  subcategoriaRepository: new SubcategoriaRepository(),
  auditoriaRepository: new AuditoriaRepository()
};

const jwtConfig = {
  secret: JWT_SECRET,
  expiresIn: process.env.JWT_EXPIRES_IN || '8h'
};

const useCases = {
  auth: {
    iniciarSesionUseCase: new IniciarSesionUseCase({ usuarioRepository: repositories.usuarioRepository, jwtConfig }),
    cerrarSesionUseCase: new CerrarSesionUseCase(),
    cambiarPasswordUseCase: new CambiarPasswordUseCase({ usuarioRepository: repositories.usuarioRepository }),
    obtenerUsuarioAutenticadoUseCase: new ObtenerUsuarioAutenticadoUseCase({ usuarioRepository: repositories.usuarioRepository }),
    solicitarRecuperacionUseCase: new SolicitarRecuperacionPasswordUseCase({
      usuarioRepository: repositories.usuarioRepository,
      passwordResetRepository: repositories.passwordResetRepository,
      emailService: null
    }),
    restablecerPasswordUseCase: new RestablecerPasswordUseCase({
      usuarioRepository: repositories.usuarioRepository,
      passwordResetRepository: repositories.passwordResetRepository
    })
  },
  usuario: {
    registrarUsuarioUseCase: new RegistrarUsuarioUseCase({
      usuarioRepository: repositories.usuarioRepository,
      auditoriaRepository: repositories.auditoriaRepository
    }),
    actualizarUsuarioUseCase: new ActualizarUsuarioUseCase({
      usuarioRepository: repositories.usuarioRepository,
      auditoriaRepository: repositories.auditoriaRepository
    }),
    eliminarUsuarioUseCase: new EliminarUsuarioUseCase({
      usuarioRepository: repositories.usuarioRepository,
      auditoriaRepository: repositories.auditoriaRepository
    }),
    obtenerUsuariosUseCase: new ObtenerUsuariosUseCase({ usuarioRepository: repositories.usuarioRepository })
  },
  turno: {
    iniciarTurnoUseCase: new IniciarTurnoUseCase({
      turnoRepository: repositories.turnoRepository,
      turnoPuntoRepository: repositories.turnoPuntoRepository,
      franjaHorariaRepository: repositories.franjaHorariaRepository
    }),
    cerrarTurnoUseCase: new CerrarTurnoUseCase({ turnoRepository: repositories.turnoRepository })
  },
  franja: {
    iniciarFranjaUseCase: new IniciarFranjaUseCase({ franjaHorariaRepository: repositories.franjaHorariaRepository }),
    cerrarFranjaUseCase: new CerrarFranjaUseCase({
      franjaHorariaRepository: repositories.franjaHorariaRepository,
      evidenciaFotoRepository: repositories.evidenciaFotoRepository
    })
  },
  conteoVehicular: {
    registrarConteoVehicularUseCase: new RegistrarConteoVehicularUseCase({
      conteoVehicularRepository: repositories.conteoVehicularRepository,
      franjaHorariaRepository: repositories.franjaHorariaRepository
    })
  },
  conteoOcupacion: {
    registrarConteoOcupacionUseCase: new RegistrarConteoOcupacionUseCase({
      conteoOcupacionRepository: repositories.conteoOcupacionRepository,
      franjaHorariaRepository: repositories.franjaHorariaRepository
    })
  },
  evidenciaFoto: {
    registrarEvidenciaFotoUseCase: new RegistrarEvidenciaFotoUseCase({
      evidenciaFotoRepository: repositories.evidenciaFotoRepository,
      franjaHorariaRepository: repositories.franjaHorariaRepository
    })
  },
  subidasBajadas: {
    registrarSubidasBajadasUseCase: new RegistrarSubidasBajadasUseCase({
      subidasBajadasRepository: repositories.subidasBajadasRepository,
      franjaHorariaRepository: repositories.franjaHorariaRepository
    })
  },
  colaVehicular: {
    registrarColaVehicularUseCase: new RegistrarColaVehicularUseCase({
      colaVehicularRepository: repositories.colaVehicularRepository,
      franjaHorariaRepository: repositories.franjaHorariaRepository
    })
  }
};

module.exports = { repositories, useCases, jwtConfig };
