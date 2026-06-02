const { success } = require('../../shared/helpers/response');
const { sendExport, parseFormato } = require('../../shared/helpers/export');

const columnas = [
  { key: 'id_cola', label: 'ID', width: 8 },
  { key: 'franja_id', label: 'Franja ID', width: 10 },
  { key: 'cantidad_cola', label: 'Cantidad Cola', width: 14 },
  { key: 'observaciones', label: 'Observaciones', width: 30 },
  { key: 'fecha_hora', label: 'Fecha/Hora', width: 20 }
];

class ColaVehicularController {
  constructor({ registrarColaVehicularUseCase, colaVehicularRepository }) {
    this.registrarColaVehicularUseCase = registrarColaVehicularUseCase;
    this.colaVehicularRepository = colaVehicularRepository;
  }

  registrar = async (req, res, next) => {
    try {
      const { franjaId, cantidadCola, observaciones } = req.body;
      const result = await this.registrarColaVehicularUseCase.execute({ franjaId, cantidadCola, observaciones });
      return success(res, result, 'Cola registrada', 201);
    } catch (err) { next(err); }
  };

  listar = async (req, res, next) => {
    try {
      const formato = parseFormato(req);
      const { franja_id, page = 1, limit = 100 } = req.query;
      const result = await this.colaVehicularRepository.findAll({
        franja_id: franja_id ? Number(franja_id) : undefined,
        page: formato === 'json' ? Number(page) : 1,
        limit: formato === 'json' ? Number(limit) : 1000000
      });
      if (formato !== 'json') {
        return sendExport(res, result.data, columnas, 'colas_vehiculares', formato);
      }
      return success(res, result.data, 'Colas obtenidas');
    } catch (err) { next(err); }
  };
}

module.exports = ColaVehicularController;
