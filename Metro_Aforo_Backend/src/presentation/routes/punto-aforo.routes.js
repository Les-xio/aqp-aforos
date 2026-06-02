const { Router } = require('express');
const { authenticate } = require('../middlewares/auth');
const { authorize } = require('../middlewares/roles');

module.exports = function puntoAforoRoutes(puntoAforoController) {
  const router = Router();

  router.use(authenticate);
  router.get('/', puntoAforoController.listar);
  router.post('/', authorize('administrador'), puntoAforoController.crear);
  router.put('/:id', authorize('administrador'), puntoAforoController.actualizar);
  router.delete('/:id', authorize('administrador'), puntoAforoController.eliminar);

  return router;
};
