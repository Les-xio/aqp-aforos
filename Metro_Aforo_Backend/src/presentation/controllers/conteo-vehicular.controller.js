const { success } = require('../../shared/helpers/response');
const { sendExport, parseFormato } = require('../../shared/helpers/export');

const columnas = [
  { key: 'id_conteo', label: 'ID', width: 8 },
  { key: 'franja_id', label: 'Franja ID', width: 10 },
  { key: 'vehiculo.tipo', label: 'Vehículo', width: 15 },
  { key: 'cantidad', label: 'Cantidad', width: 10 },
  { key: 'accion', label: 'Acción', width: 8 },
  { key: 'fecha_hora', label: 'Fecha/Hora', width: 20 },
  { key: 'estado_sincronizacion', label: 'Estado', width: 15 }
];

class ConteoVehicularController {
  constructor({ registrarConteoVehicularUseCase, conteoVehicularRepository }) {
    this.registrarConteoVehicularUseCase = registrarConteoVehicularUseCase;
    this.conteoVehicularRepository = conteoVehicularRepository;
  }

  registrar = async (req, res, next) => {
    try {
      const { franjaId, vehiculoId, cantidad, accion } = req.body;
      const result = await this.registrarConteoVehicularUseCase.execute({ franjaId, vehiculoId, cantidad, accion });
      return success(res, result, 'Conteo registrado', 201);
    } catch (err) { next(err); }
  };

  listar = async (req, res, next) => {
    try {
      const formato = parseFormato(req);
      const { franja_id, page = 1, limit = 200 } = req.query;
      const result = await this.conteoVehicularRepository.findAll({
        franja_id: franja_id ? Number(franja_id) : undefined,
        page: formato === 'json' ? Number(page) : 1,
        limit: formato === 'json' ? Number(limit) : 1000000
      });
      if (formato !== 'json') {
        return sendExport(res, result.data, columnas, 'conteos_vehiculares', formato);
      }
      return success(res, result.data, 'Conteos obtenidos');
    } catch (err) { next(err); }
  };
}

module.exports = ConteoVehicularController;
