const authRoutes = require('./routes/auth.routes');
const usuarioRoutes = require('./routes/usuario.routes');
const turnoRoutes = require('./routes/turno.routes');
const franjaRoutes = require('./routes/franja.routes');
const conteoVehicularRoutes = require('./routes/conteo-vehicular.routes');
const conteoOcupacionRoutes = require('./routes/conteo-ocupacion.routes');
const puntoAforoRoutes = require('./routes/punto-aforo.routes');
const vehiculoRoutes = require('./routes/vehiculo.routes');
const evidenciaFotoRoutes = require('./routes/evidencia-foto.routes');
const subidasBajadasRoutes = require('./routes/subidas-bajadas.routes');
const colaVehicularRoutes = require('./routes/cola-vehicular.routes');
const reporteRoutes = require('./routes/reporte.routes');

function buildRouters(controllers) {
  return {
    authRouter: authRoutes(controllers.authController),
    usuarioRouter: usuarioRoutes(controllers.usuarioController),
    turnoRouter: turnoRoutes(controllers.turnoController),
    franjaRouter: franjaRoutes(controllers.franjaController),
    conteoVehicularRouter: conteoVehicularRoutes(controllers.conteoVehicularController),
    conteoOcupacionRouter: conteoOcupacionRoutes(controllers.conteoOcupacionController),
    puntoAforoRouter: puntoAforoRoutes(controllers.puntoAforoController),
    vehiculoRouter: vehiculoRoutes(controllers.vehiculoController),
    evidenciaFotoRouter: evidenciaFotoRoutes(controllers.evidenciaFotoController),
    subidasBajadasRouter: subidasBajadasRoutes(controllers.subidasBajadasController),
    colaVehicularRouter: colaVehicularRoutes(controllers.colaVehicularController),
    reporteRouter: reporteRoutes(controllers.reporteController)
  };
}

module.exports = buildRouters;
