const { Router } = require('express');
const validate = require('../middlewares/validate');
const { authenticate } = require('../middlewares/auth');
const { registrarSubidasBajadasRules } = require('../validators/aforo.validator');

module.exports = function subidasBajadasRoutes(controller) {
  const router = Router();
  router.use(authenticate);
  router.post('/', registrarSubidasBajadasRules, validate, controller.registrar);
  router.get('/', controller.listar);
  return router;
};
