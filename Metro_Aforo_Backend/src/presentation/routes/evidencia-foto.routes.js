const { Router } = require('express');
const { query } = require('express-validator');
const validate = require('../middlewares/validate');
const { authenticate } = require('../middlewares/auth');
const upload = require('../middlewares/upload');
const { registrarEvidenciaRules } = require('../validators/aforo.validator');

const buscarCercanasRules = [
  query('lat').isFloat({ min: -90, max: 90 }).withMessage('Latitud inválida'),
  query('lon').isFloat({ min: -180, max: 180 }).withMessage('Longitud inválida'),
  query('radio').optional().isInt({ min: 1 }).withMessage('Radio inválido')
];

module.exports = function evidenciaFotoRoutes(controller) {
  const router = Router();
  router.use(authenticate);
  router.post('/', upload.single('foto'), registrarEvidenciaRules, validate, controller.registrar);
  router.get('/cercanas', buscarCercanasRules, validate, controller.buscarCercanas);
  return router;
};
