const { Router } = require('express');
const { authenticate } = require('../middlewares/auth');
const { authorize } = require('../middlewares/roles');

module.exports = function reporteRoutes(reporteController) {
  const router = Router();

  router.use(authenticate);
  router.use(authorize('administrador'));
  router.get('/conteos', reporteController.exportarConteos);
  router.get('/ocupacion', reporteController.exportarOcupacion);
  router.get('/paradas', reporteController.exportarParadas);

  return router;
};
