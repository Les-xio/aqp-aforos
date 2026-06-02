const { success } = require('../../shared/helpers/response');
const { sendExport, parseFormato } = require('../../shared/helpers/export');

const columnas = [
  { key: 'id_parada', label: 'ID', width: 8 },
  { key: 'franja_id', label: 'Franja ID', width: 10 },
  { key: 'vehiculo.tipo', label: 'Vehículo', width: 15 },
  { key: 'suben', label: 'Suben', width: 8 },
  { key: 'bajan', label: 'Bajan', width: 8 },
  { key: 'insatisfechos', label: 'Insatisfechos', width: 14 },
  { key: 'fecha_hora', label: 'Fecha/Hora', width: 20 }
];

class SubidasBajadasController {
  constructor({ registrarSubidasBajadasUseCase, subidasBajadasRepository }) {
    this.registrarSubidasBajadasUseCase = registrarSubidasBajadasUseCase;
    this.subidasBajadasRepository = subidasBajadasRepository;
  }

  registrar = async (req, res, next) => {
    try {
      const { franjaId, vehiculoId, suben, bajan, insatisfechos } = req.body;
      const result = await this.registrarSubidasBajadasUseCase.execute({
        franjaId, vehiculoId, suben, bajan, insatisfechos
      });
      return success(res, result, 'Registrado', 201);
    } catch (err) { next(err); }
  };

  listar = async (req, res, next) => {
    try {
      const formato = parseFormato(req);
      const { franja_id, page = 1, limit = 100 } = req.query;
      const result = await this.subidasBajadasRepository.findAll({
        franja_id: franja_id ? Number(franja_id) : undefined,
        page: formato === 'json' ? Number(page) : 1,
        limit: formato === 'json' ? Number(limit) : 1000000
      });
      if (formato !== 'json') {
        return sendExport(res, result.data, columnas, 'subidas_bajadas', formato);
      }
      return success(res, result.data, 'Registros obtenidos');
    } catch (err) { next(err); }
  };
}

module.exports = SubidasBajadasController;
