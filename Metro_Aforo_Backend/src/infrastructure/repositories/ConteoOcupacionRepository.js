const { ConteoOcupacion, Vehiculo } = require('../database/models');

class ConteoOcupacionRepository {
  async findAll({ franja_id, page = 1, limit = 200 } = {}) {
    const where = {};
    if (franja_id) where.franja_id = franja_id;
    const offset = (page - 1) * limit;
    const { rows, count } = await ConteoOcupacion.findAndCountAll({
      where, limit, offset,
      include: [{ model: Vehiculo, as: 'vehiculo' }],
      order: [['fecha_hora', 'DESC']]
    });
    return { data: rows, total: count };
  }

  async create(data) {
    return ConteoOcupacion.create(data);
  }
}

module.exports = ConteoOcupacionRepository;
