const { ConteoVehicular, Vehiculo, FranjaHoraria } = require('../database/models');

class ConteoVehicularRepository {
  async findAll({ franja_id, page = 1, limit = 200 } = {}) {
    const where = {};
    if (franja_id) where.franja_id = franja_id;
    const offset = (page - 1) * limit;
    const { rows, count } = await ConteoVehicular.findAndCountAll({
      where, limit, offset,
      include: [{ model: Vehiculo, as: 'vehiculo' }],
      order: [['fecha_hora', 'DESC']]
    });
    return { data: rows, total: count };
  }

  async create(data) {
    return ConteoVehicular.create(data);
  }

  async bulkCreate(records) {
    return ConteoVehicular.bulkCreate(records);
  }
}

module.exports = ConteoVehicularRepository;
