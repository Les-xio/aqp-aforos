const { PuntoAforo } = require('../database/models');

class PuntoAforoRepository {
  async findAll() {
    return PuntoAforo.findAll({ order: [['nombre_punto', 'ASC']] });
  }

  async findById(id) {
    return PuntoAforo.findByPk(id);
  }

  async create(data) {
    return PuntoAforo.create(data);
  }

  async update(id, data) {
    const entity = await PuntoAforo.findByPk(id);
    if (!entity) return null;
    await entity.update(data);
    return entity;
  }

  async delete(id) {
    const entity = await PuntoAforo.findByPk(id);
    if (!entity) return false;
    await entity.destroy();
    return true;
  }
}

module.exports = PuntoAforoRepository;
