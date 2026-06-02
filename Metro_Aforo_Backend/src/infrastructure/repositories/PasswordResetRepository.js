const { PasswordReset } = require('../database/models');

class PasswordResetRepository {
  async findByToken(token) {
    return PasswordReset.findOne({ where: { token, usado: false } });
  }

  async create(data) {
    return PasswordReset.create(data);
  }

  async delete(id) {
    const entity = await PasswordReset.findByPk(id);
    if (!entity) return false;
    await entity.destroy();
    return true;
  }

  async marcarUsado(id) {
    return PasswordReset.update({ usado: true }, { where: { id_reset: id } });
  }
}

module.exports = PasswordResetRepository;
