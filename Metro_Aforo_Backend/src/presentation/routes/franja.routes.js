const { Router } = require('express');
const { authenticate } = require('../middlewares/auth');

module.exports = function franjaRoutes(franjaController) {
  const router = Router();

  router.use(authenticate);
  router.get('/:id', franjaController.obtener);
  router.put('/:id/iniciar', franjaController.iniciar);
  router.put('/:id/cerrar', franjaController.cerrar);
  router.put('/:id/omitir', franjaController.omitir);

  return router;
};
