const { success } = require('../../shared/helpers/response');

class VehiculoController {
  constructor({ vehiculoRepository, categoriaRepository, subcategoriaRepository }) {
    this.vehiculoRepository = vehiculoRepository;
    this.categoriaRepository = categoriaRepository;
    this.subcategoriaRepository = subcategoriaRepository;
  }

  listar = async (req, res, next) => {
    try {
      const { page = 1, limit = 20, zona } = req.query;
      const result = await this.vehiculoRepository.findAll({
        page: Number(page), limit: Number(limit),
        zona: zona ? Number(zona) : undefined
      });
      return success(res, result.data, 'Vehículos obtenidos');
    } catch (err) { next(err); }
  };

  listarCategorias = async (_req, res, next) => {
    try {
      const categorias = await this.categoriaRepository.findAll();
      return success(res, categorias, 'Categorías obtenidas');
    } catch (err) { next(err); }
  };

  crearCategoria = async (req, res, next) => {
    try {
      const categoria = await this.categoriaRepository.create(req.body);
      return success(res, categoria, 'Categoría creada', 201);
    } catch (err) { next(err); }
  };

  actualizarCategoria = async (req, res, next) => {
    try {
      const categoria = await this.categoriaRepository.update(Number(req.params.id), req.body);
      if (!categoria) return res.status(404).json({ ok: false, message: 'Categoría no encontrada' });
      return success(res, categoria, 'Categoría actualizada');
    } catch (err) { next(err); }
  };

  eliminarCategoria = async (req, res, next) => {
    try {
      const result = await this.categoriaRepository.delete(Number(req.params.id));
      if (!result) return res.status(404).json({ ok: false, message: 'Categoría no encontrada' });
      return success(res, null, 'Categoría eliminada');
    } catch (err) { next(err); }
  };

  listarSubcategorias = async (req, res, next) => {
    try {
      const subcategorias = await this.subcategoriaRepository.findByCategoria(Number(req.params.categoriaId));
      return success(res, subcategorias, 'Subcategorías obtenidas');
    } catch (err) { next(err); }
  };

  crearSubcategoria = async (req, res, next) => {
    try {
      const subcategoria = await this.subcategoriaRepository.create(req.body);
      return success(res, subcategoria, 'Subcategoría creada', 201);
    } catch (err) { next(err); }
  };

  actualizarSubcategoria = async (req, res, next) => {
    try {
      const subcategoria = await this.subcategoriaRepository.update(Number(req.params.id), req.body);
      if (!subcategoria) return res.status(404).json({ ok: false, message: 'Subcategoría no encontrada' });
      return success(res, subcategoria, 'Subcategoría actualizada');
    } catch (err) { next(err); }
  };

  eliminarSubcategoria = async (req, res, next) => {
    try {
      const result = await this.subcategoriaRepository.delete(Number(req.params.id));
      if (!result) return res.status(404).json({ ok: false, message: 'Subcategoría no encontrada' });
      return success(res, null, 'Subcategoría eliminada');
    } catch (err) { next(err); }
  };

  crear = async (req, res, next) => {
    try {
      const vehiculo = await this.vehiculoRepository.create(req.body);
      return success(res, vehiculo, 'Vehículo registrado', 201);
    } catch (err) { next(err); }
  };

  actualizar = async (req, res, next) => {
    try {
      const vehiculo = await this.vehiculoRepository.update(Number(req.params.id), req.body);
      if (!vehiculo) return res.status(404).json({ ok: false, message: 'Vehículo no encontrado' });
      return success(res, vehiculo, 'Vehículo actualizado');
    } catch (err) { next(err); }
  };

  eliminar = async (req, res, next) => {
    try {
      const result = await this.vehiculoRepository.delete(Number(req.params.id));
      if (!result) return res.status(404).json({ ok: false, message: 'Vehículo no encontrado' });
      return success(res, null, 'Vehículo eliminado');
    } catch (err) { next(err); }
  };

  listarPorZona = async (req, res, next) => {
    try {
      const vehiculos = await this.vehiculoRepository.findByZona(Number(req.params.zona));
      return success(res, vehiculos, 'Vehículos por zona obtenidos');
    } catch (err) { next(err); }
  };
}

module.exports = VehiculoController;
