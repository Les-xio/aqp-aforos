const { Turno, FranjaHoraria, TurnoPunto, PuntoAforo, Usuario } = require('../database/models');

class TurnoRepository {
  async findAll({ page = 1, limit = 10 } = {}) {
    const offset = (page - 1) * limit;
    const { rows, count } = await Turno.findAndCountAll({
      limit, offset,
      include: [
        { model: Usuario, as: 'usuario', attributes: { exclude: ['password'] } },
        { model: TurnoPunto, as: 'puntosAsignados', include: [{ model: PuntoAforo, as: 'puntoAforo' }] }
      ],
      order: [['created_at', 'DESC']]
    });
    return { data: rows, total: count };
  }

  async findById(id) {
    return Turno.findByPk(id, {
      include: [
        { model: Usuario, as: 'usuario', attributes: { exclude: ['password'] } },
        { model: TurnoPunto, as: 'puntosAsignados', include: [{ model: PuntoAforo, as: 'puntoAforo' }] },
        { model: FranjaHoraria, as: 'franjas', order: [['inicio', 'ASC']] }
      ]
    });
  }

  async findActivoByUsuario(usuarioId) {
    return Turno.findOne({
      where: { usuario_id: usuarioId, activo: true, fecha_fin: null },
      include: [{ model: FranjaHoraria, as: 'franjas' }]
    });
  }

  async create(data) {
    return Turno.create(data);
  }

  async cerrar(id) {
    const turno = await Turno.findByPk(id);
    if (!turno) return null;
    await turno.update({ fecha_fin: new Date(), activo: false });
    return turno;
  }
}

module.exports = TurnoRepository;
