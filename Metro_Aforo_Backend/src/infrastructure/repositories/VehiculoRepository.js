const { Vehiculo, SubcategoriaVehicular, CategoriaVehicular } = require('../database/models');

class VehiculoRepository {
  async findAll({ page = 1, limit = 20 } = {}) {
    const offset = (page - 1) * limit;
    const { rows, count } = await Vehiculo.findAndCountAll({
      limit, offset,
      include: [{
        model: SubcategoriaVehicular, as: 'subcategoria',
        include: [{ model: CategoriaVehicular, as: 'categoria' }]
      }],
      order: [['tipo', 'ASC']]
    });
    return { data: rows, total: count };
  }

  async findById(id) {
    return Vehiculo.findByPk(id, {
      include: [{
        model: SubcategoriaVehicular, as: 'subcategoria',
        include: [{ model: CategoriaVehicular, as: 'categoria' }]
      }]
    });
  }

  async findTiposLigeros() {
    return Vehiculo.findAll({
      include: [{
        model: SubcategoriaVehicular, as: 'subcategoria',
        where: { nombre: 'Ligeros' }
      }],
      where: { activo: true }
    });
  }

  async findM2M3() {
    return Vehiculo.findAll({
      include: [{
        model: SubcategoriaVehicular, as: 'subcategoria',
        where: { nombre: ['Combi M2', 'Bus SIT M3'] }
      }],
      where: { activo: true }
    });
  }

  async findByZona(zona) {
    const nombres = {
      1: 'L1',
      2: 'M2',
      3: 'M3',
    };
    const nombreSubcategoria = nombres[zona];
    if (!nombreSubcategoria) return [];
    return Vehiculo.findAll({
      include: [{
        model: SubcategoriaVehicular, as: 'subcategoria',
        where: { nombre: nombreSubcategoria }
      }],
      where: { activo: true },
      order: [['tipo', 'ASC']]
    });
  }

  async create(data) {
    return Vehiculo.create(data);
  }

  async update(id, data) {
    const entity = await Vehiculo.findByPk(id);
    if (!entity) return null;
    await entity.update(data);
    return entity;
  }

  async delete(id) {
    const entity = await Vehiculo.findByPk(id);
    if (!entity) return false;
    await entity.destroy();
    return true;
  }
}

module.exports = VehiculoRepository;
