const { CategoriaVehicular, SubcategoriaVehicular } = require('../database/models');

class CategoriaRepository {
  async findAll() {
    return CategoriaVehicular.findAll({
      include: [{ model: SubcategoriaVehicular, as: 'subcategorias' }],
      order: [['nombre', 'ASC']]
    });
  }

  async findById(id) {
    return CategoriaVehicular.findByPk(id, {
      include: [{ model: SubcategoriaVehicular, as: 'subcategorias' }]
    });
  }

  async create(data) {
    return CategoriaVehicular.create(data);
  }

  async update(id, data) {
    const entity = await CategoriaVehicular.findByPk(id);
    if (!entity) return null;
    await entity.update(data);
    return entity;
  }

  async delete(id) {
    const entity = await CategoriaVehicular.findByPk(id);
    if (!entity) return false;
    await entity.destroy();
    return true;
  }
}

module.exports = CategoriaRepository;
