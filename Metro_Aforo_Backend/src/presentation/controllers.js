const AuthController = require('./controllers/auth.controller');
const UsuarioController = require('./controllers/usuario.controller');
const TurnoController = require('./controllers/turno.controller');
const FranjaController = require('./controllers/franja.controller');
const ConteoVehicularController = require('./controllers/conteo-vehicular.controller');
const ConteoOcupacionController = require('./controllers/conteo-ocupacion.controller');
const PuntoAforoController = require('./controllers/punto-aforo.controller');
const VehiculoController = require('./controllers/vehiculo.controller');
const EvidenciaFotoController = require('./controllers/evidencia-foto.controller');
const SubidasBajadasController = require('./controllers/subidas-bajadas.controller');
const ColaVehicularController = require('./controllers/cola-vehicular.controller');
const ReporteController = require('./controllers/reporte.controller');

function buildControllers(useCases, repositories) {
  return {
    authController: new AuthController(useCases.auth),
    usuarioController: new UsuarioController(useCases.usuario),
    turnoController: new TurnoController({
      ...useCases.turno,
      turnoRepository: repositories.turnoRepository,
      franjaHorariaRepository: repositories.franjaHorariaRepository,
      turnoPuntoRepository: repositories.turnoPuntoRepository
    }),
    franjaController: new FranjaController({
      ...useCases.franja,
      franjaHorariaRepository: repositories.franjaHorariaRepository
    }),
    conteoVehicularController: new ConteoVehicularController({
      ...useCases.conteoVehicular,
      conteoVehicularRepository: repositories.conteoVehicularRepository
    }),
    conteoOcupacionController: new ConteoOcupacionController({
      ...useCases.conteoOcupacion,
      conteoOcupacionRepository: repositories.conteoOcupacionRepository
    }),
    puntoAforoController: new PuntoAforoController({
      puntoAforoRepository: repositories.puntoAforoRepository
    }),
    vehiculoController: new VehiculoController({
      vehiculoRepository: repositories.vehiculoRepository,
      categoriaRepository: repositories.categoriaRepository,
      subcategoriaRepository: repositories.subcategoriaRepository
    }),
    evidenciaFotoController: new EvidenciaFotoController(useCases.evidenciaFoto),
    subidasBajadasController: new SubidasBajadasController({
      ...useCases.subidasBajadas,
      subidasBajadasRepository: repositories.subidasBajadasRepository
    }),
    colaVehicularController: new ColaVehicularController({
      ...useCases.colaVehicular,
      colaVehicularRepository: repositories.colaVehicularRepository
    }),
    reporteController: new ReporteController()
  };
}

module.exports = buildControllers;
