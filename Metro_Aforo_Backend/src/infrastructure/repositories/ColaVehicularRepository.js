const { ColaVehicular } = require('../database/models');

class ColaVehicularRepository {
  async findAll({ franja_id, page = 1, limit = 100 } = {}) {
    const where = {};
    if (franja_id) where.franja_id = franja_id;
    const offset = (page - 1) * limit;
    const { rows, count } = await ColaVehicular.findAndCountAll({
      where, limit, offset,
      order: [['fecha_hora', 'DESC']]
    });
    return { data: rows, total: count };
  }

  async create(data) {
    return ColaVehicular.create(data);
  }
}

module.exports = ColaVehicularRepository;
