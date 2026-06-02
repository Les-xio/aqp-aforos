const { Router } = require('express');
const validate = require('../middlewares/validate');
const { authenticate } = require('../middlewares/auth');
const { authorize } = require('../middlewares/roles');
const { registrarRules, actualizarRules } = require('../validators/usuario.validator');

module.exports = function usuarioRoutes(usuarioController) {
  const router = Router();

  router.use(authenticate);
  router.get('/', authorize('administrador'), usuarioController.listar);
  router.post('/', authorize('administrador'), registrarRules, validate, usuarioController.registrar);
  router.put('/:id', authorize('administrador'), actualizarRules, validate, usuarioController.actualizar);
  router.delete('/:id', authorize('administrador'), usuarioController.eliminar);

  return router;
};
