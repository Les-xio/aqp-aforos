const { Router } = require('express');
const validate = require('../middlewares/validate');
const { authenticate } = require('../middlewares/auth');
const { registrarConteoVehicularRules } = require('../validators/aforo.validator');

module.exports = function conteoVehicularRoutes(controller) {
  const router = Router();
  router.use(authenticate);
  router.post('/', registrarConteoVehicularRules, validate, controller.registrar);
  router.get('/', controller.listar);
  return router;
};
