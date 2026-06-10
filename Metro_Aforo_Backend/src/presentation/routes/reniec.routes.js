const { Router } = require('express');
const { authenticate } = require('../middlewares/auth');

module.exports = function reniecRoutes(reniecController) {
  const router = Router();

  router.use(authenticate);
  router.get('/consultar/:dni', reniecController.consultarDni);

  return router;
};
