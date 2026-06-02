const { TurnoPunto, PuntoAforo } = require('../database/models');

class TurnoPuntoRepository {
  async findByTurno(turnoId) {
    return TurnoPunto.findAll({
      where: { turno_id: turnoId },
      include: [{ model: PuntoAforo, as: 'puntoAforo' }]
    });
  }

  async create(data) {
    return TurnoPunto.create(data);
  }

  async delete(id) {
    const entity = await TurnoPunto.findByPk(id);
    if (!entity) return false;
    await entity.destroy();
    return true;
  }
}

module.exports = TurnoPuntoRepository;
