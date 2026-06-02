const { Usuario } = require('../database/models');

class UsuarioRepository {
  async findAll({ page = 1, limit = 10, activo } = {}) {
    const where = {};
    if (activo !== undefined) where.activo = activo;
    const offset = (page - 1) * limit;
    const { rows, count } = await Usuario.findAndCountAll({
      where,
      limit,
      offset,
      order: [['created_at', 'DESC']]
    });
    return { data: rows, total: count };
  }

  async findById(id) {
    return Usuario.findByPk(id);
  }

  async findByCorreo(correo) {
    return Usuario.findOne({ where: { correo } });
  }

  async findByUsername(username) {
    return Usuario.findOne({ where: { username } });
  }

  async findByDni(dni) {
    return Usuario.findOne({ where: { dni } });
  }

  async create(data) {
    return Usuario.create(data);
  }

  async update(id, data) {
    const usuario = await Usuario.findByPk(id);
    if (!usuario) return null;
    await usuario.update(data);
    return usuario;
  }

  async delete(id) {
    const usuario = await Usuario.findByPk(id);
    if (!usuario) return false;
    await usuario.destroy();
    return true;
  }

  async updateLastLogin(id, date) {
    return Usuario.update({ ultimo_login: date }, { where: { id_usuario: id } });
  }

  async updatePassword(id, hashedPassword) {
    return Usuario.update(
      { password: hashedPassword, primer_login: false },
      { where: { id_usuario: id } }
    );
  }
}

module.exports = UsuarioRepository;
