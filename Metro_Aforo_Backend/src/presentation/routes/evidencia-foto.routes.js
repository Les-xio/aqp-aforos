const { Router } = require('express');
const validate = require('../middlewares/validate');
const { authenticate } = require('../middlewares/auth');
const upload = require('../middlewares/upload');
const { registrarEvidenciaRules } = require('../validators/aforo.validator');

module.exports = function evidenciaFotoRoutes(controller) {
  const router = Router();
  router.use(authenticate);
  router.post('/', upload.single('foto'), registrarEvidenciaRules, validate, controller.registrar);
  return router;
};
