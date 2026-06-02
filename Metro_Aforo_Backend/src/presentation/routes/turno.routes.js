const { Router } = require('express');
const validate = require('../middlewares/validate');
const { authenticate } = require('../middlewares/auth');
const { iniciarTurnoRules } = require('../validators/aforo.validator');

module.exports = function turnoRoutes(turnoController) {
  const router = Router();

  router.use(authenticate);
  router.get('/activo', turnoController.activo);
  router.post('/iniciar', iniciarTurnoRules, validate, turnoController.iniciar);
  router.put('/:id/cerrar', turnoController.cerrar);
  router.get('/:id/franjas', turnoController.obtenerFranjas);
  router.get('/:id/puntos', turnoController.obtenerPuntosAsignados);
  router.get('/', turnoController.listar);
  router.get('/:id', turnoController.obtener);

  return router;
};
