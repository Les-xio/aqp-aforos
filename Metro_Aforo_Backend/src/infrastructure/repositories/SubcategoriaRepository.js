const { SubcategoriaVehicular, Vehiculo } = require('../database/models');

class SubcategoriaRepository {
  async findByCategoria(categoriaId) {
    return SubcategoriaVehicular.findAll({
      where: { categoria_id: categoriaId },
      include: [{ model: Vehiculo, as: 'vehiculos', where: { activo: true }, required: false }]
    });
  }

  async findById(id) {
    return SubcategoriaVehicular.findByPk(id, {
      include: [{ model: Vehiculo, as: 'vehiculos' }]
    });
  }

  async create(data) {
    return SubcategoriaVehicular.create(data);
  }

  async update(id, data) {
    const entity = await SubcategoriaVehicular.findByPk(id);
    if (!entity) return null;
    await entity.update(data);
    return entity;
  }

  async delete(id) {
    const entity = await SubcategoriaVehicular.findByPk(id);
    if (!entity) return false;
    await entity.destroy();
    return true;
  }
}

module.exports = SubcategoriaRepository;
