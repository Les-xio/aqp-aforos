const { Router } = require('express');
const { authenticate } = require('../middlewares/auth');
const { authorize } = require('../middlewares/roles');

module.exports = function vehiculoRoutes(vehiculoController) {
  const router = Router();

  router.use(authenticate);
  router.get('/', vehiculoController.listar);
  router.get('/categorias', vehiculoController.listarCategorias);
  router.post('/categorias', authorize('administrador'), vehiculoController.crearCategoria);
  router.put('/categorias/:id', authorize('administrador'), vehiculoController.actualizarCategoria);
  router.delete('/categorias/:id', authorize('administrador'), vehiculoController.eliminarCategoria);
  router.get('/categorias/:categoriaId/subcategorias', vehiculoController.listarSubcategorias);
  router.post('/subcategorias', authorize('administrador'), vehiculoController.crearSubcategoria);
  router.put('/subcategorias/:id', authorize('administrador'), vehiculoController.actualizarSubcategoria);
  router.delete('/subcategorias/:id', authorize('administrador'), vehiculoController.eliminarSubcategoria);
  router.post('/', authorize('administrador'), vehiculoController.crear);
  router.put('/:id', authorize('administrador'), vehiculoController.actualizar);
  router.delete('/:id', authorize('administrador'), vehiculoController.eliminar);
  router.get('/zona/:zona', vehiculoController.listarPorZona);

  return router;
};
