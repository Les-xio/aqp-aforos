const { Router } = require('express');
const validate = require('../middlewares/validate');
const { authenticate } = require('../middlewares/auth');
const { registrarColaVehicularRules } = require('../validators/aforo.validator');

module.exports = function colaVehicularRoutes(controller) {
  const router = Router();
  router.use(authenticate);
  router.post('/', registrarColaVehicularRules, validate, controller.registrar);
  router.get('/', controller.listar);
  return router;
};
