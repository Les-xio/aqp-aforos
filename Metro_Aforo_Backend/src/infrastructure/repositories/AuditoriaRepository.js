const { Auditoria, Usuario } = require('../database/models');

class AuditoriaRepository {
  async findAll({ page = 1, limit = 20, entidad } = {}) {
    const where = {};
    if (entidad) where.entidad = entidad;
    const offset = (page - 1) * limit;
    const { rows, count } = await Auditoria.findAndCountAll({
      where, limit, offset,
      include: [{ model: Usuario, as: 'usuario', attributes: ['id_usuario', 'nombres', 'apellidos', 'correo', 'rol'] }],
      order: [['created_at', 'DESC']]
    });
    return { data: rows, total: count };
  }

  async create(data) {
    return Auditoria.create(data);
  }
}

module.exports = AuditoriaRepository;
