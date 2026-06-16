const { Router } = require('express');
const { body } = require('express-validator');
const validate = require('../middlewares/validate');
const { authenticate } = require('../middlewares/auth');
const { authorize } = require('../middlewares/roles');
const { iniciarTurnoRules } = require('../validators/aforo.validator');

const generarAdminRules = [
  body('usuarioId').isInt({ min: 1 }).withMessage('ID de usuario requerido'),
  body('horas').isInt({ min: 1, max: 24 }).withMessage('Horas debe ser entre 1 y 24'),
  body('fechaInicio').optional().isISO8601().withMessage('Fecha de inicio inválida')
];

module.exports = function turnoRoutes(turnoController) {
  const router = Router();

  router.use(authenticate);
  router.get('/activo', turnoController.activo);
  router.get('/pendiente', turnoController.pendiente);
  router.post('/iniciar', iniciarTurnoRules, validate, turnoController.iniciar);
  router.post('/generar-admin', generarAdminRules, validate, turnoController.generarAdmin);
  router.put('/activar-pendiente', iniciarTurnoRules, validate, turnoController.activarPendiente);
  router.put('/:id/cerrar', turnoController.cerrar);
  router.put('/:id/cerrar-admin', authorize('administrador'), turnoController.cerrarAdmin);
  router.get('/:id/franjas', turnoController.obtenerFranjas);
  router.get('/:id/puntos', turnoController.obtenerPuntosAsignados);
  router.get('/', turnoController.listar);
  router.get('/:id', turnoController.obtener);

  return router;
};
