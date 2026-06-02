const { Router } = require('express');
const validate = require('../middlewares/validate');
const { authenticate } = require('../middlewares/auth');
const { loginRules, cambiarPasswordRules, solicitarRecuperacionRules, restablecerPasswordRules } = require('../validators/auth.validator');

module.exports = function authRoutes(authController) {
  const router = Router();

  router.post('/login', loginRules, validate, authController.login);
  router.post('/logout', authenticate, authController.logout);
  router.get('/me', authenticate, authController.me);
  router.put('/cambiar-password', authenticate, cambiarPasswordRules, validate, authController.cambiarPassword);
  router.post('/solicitar-recuperacion', solicitarRecuperacionRules, validate, authController.solicitarRecuperacion);
  router.post('/restablecer-password', restablecerPasswordRules, validate, authController.restablecerPassword);

  return router;
};
