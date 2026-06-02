const { success } = require('../../shared/helpers/response');
const { sendExport, parseFormato } = require('../../shared/helpers/export');

const columnas = [
  { key: 'id_conteo_ocupacion', label: 'ID', width: 8 },
  { key: 'franja_id', label: 'Franja ID', width: 10 },
  { key: 'vehiculo.tipo', label: 'Vehículo', width: 15 },
  { key: 'ocupacion', label: 'Ocupación', width: 12 },
  { key: 'cantidad', label: 'Cantidad', width: 10 },
  { key: 'fecha_hora', label: 'Fecha/Hora', width: 20 }
];

class ConteoOcupacionController {
  constructor({ registrarConteoOcupacionUseCase, conteoOcupacionRepository }) {
    this.registrarConteoOcupacionUseCase = registrarConteoOcupacionUseCase;
    this.conteoOcupacionRepository = conteoOcupacionRepository;
  }

  registrar = async (req, res, next) => {
    try {
      const { franjaId, vehiculoId, ocupacion, cantidad } = req.body;
      const result = await this.registrarConteoOcupacionUseCase.execute({ franjaId, vehiculoId, ocupacion, cantidad });
      return success(res, result, 'Conteo de ocupación registrado', 201);
    } catch (err) { next(err); }
  };

  listar = async (req, res, next) => {
    try {
      const formato = parseFormato(req);
      const { franja_id, page = 1, limit = 200 } = req.query;
      const result = await this.conteoOcupacionRepository.findAll({
        franja_id: franja_id ? Number(franja_id) : undefined,
        page: formato === 'json' ? Number(page) : 1,
        limit: formato === 'json' ? Number(limit) : 1000000
      });
      if (formato !== 'json') {
        return sendExport(res, result.data, columnas, 'conteos_ocupacion', formato);
      }
      return success(res, result.data, 'Conteos de ocupación obtenidos');
    } catch (err) { next(err); }
  };
}

module.exports = ConteoOcupacionController;
