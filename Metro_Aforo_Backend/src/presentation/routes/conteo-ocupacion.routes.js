const { Router } = require('express');
const validate = require('../middlewares/validate');
const { authenticate } = require('../middlewares/auth');
const { registrarConteoOcupacionRules } = require('../validators/aforo.validator');

module.exports = function conteoOcupacionRoutes(controller) {
  const router = Router();
  router.use(authenticate);
  router.post('/', registrarConteoOcupacionRules, validate, controller.registrar);
  router.get('/', controller.listar);
  return router;
};
