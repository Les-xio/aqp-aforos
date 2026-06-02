const { ParadasSubidasBajadas, Vehiculo } = require('../database/models');

class SubidasBajadasRepository {
  async findAll({ franja_id, page = 1, limit = 100 } = {}) {
    const where = {};
    if (franja_id) where.franja_id = franja_id;
    const offset = (page - 1) * limit;
    const { rows, count } = await ParadasSubidasBajadas.findAndCountAll({
      where, limit, offset,
      include: [{ model: Vehiculo, as: 'vehiculo' }],
      order: [['fecha_hora', 'DESC']]
    });
    return { data: rows, total: count };
  }

  async create(data) {
    return ParadasSubidasBajadas.create(data);
  }
}

module.exports = SubidasBajadasRepository;
