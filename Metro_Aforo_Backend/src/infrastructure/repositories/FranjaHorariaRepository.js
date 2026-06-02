const { FranjaHoraria, EvidenciaFoto } = require('../database/models');
const { Op } = require('sequelize');

class FranjaHorariaRepository {
  async findById(id) {
    return FranjaHoraria.findByPk(id, {
      include: [{ model: EvidenciaFoto, as: 'evidencias' }]
    });
  }

  async findByTurno(turnoId) {
    return FranjaHoraria.findAll({
      where: { turno_id: turnoId },
      order: [['inicio', 'ASC']]
    });
  }

  async findActualByTurno(turnoId) {
    const ahora = new Date();
    return FranjaHoraria.findOne({
      where: {
        turno_id: turnoId,
        inicio: { [Op.lte]: ahora },
        fin: { [Op.gte]: ahora }
      }
    });
  }

  async create(data) {
    return FranjaHoraria.create(data);
  }

  async bulkCreate(franjas) {
    return FranjaHoraria.bulkCreate(franjas);
  }

  async completar(id) {
    const franja = await FranjaHoraria.findByPk(id);
    if (!franja) return null;
    await franja.update({ estado: 'completada' });
    return franja;
  }

  async omitir(id, motivo) {
    const franja = await FranjaHoraria.findByPk(id);
    if (!franja) return null;
    await franja.update({ estado: 'omitida', motivo });
    return franja;
  }
}

module.exports = FranjaHorariaRepository;
