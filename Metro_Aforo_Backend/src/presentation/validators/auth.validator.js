const { body } = require('express-validator');

const loginRules = [
  body('correo')
    .notEmpty().withMessage('Correo o usuario requerido')
    .trim(),
  body('password')
    .notEmpty().withMessage('Contraseña requerida')
];

const cambiarPasswordRules = [
  body('passwordActual')
    .notEmpty().withMessage('Contraseña actual requerida'),
  body('nuevaPassword')
    .isLength({ min: 6 }).withMessage('Nueva contraseña debe tener al menos 6 caracteres')
];

const solicitarRecuperacionRules = [
  body('correo')
    .isEmail().withMessage('Correo inválido')
    .normalizeEmail()
];

const restablecerPasswordRules = [
  body('token')
    .notEmpty().withMessage('Token requerido'),
  body('nuevaPassword')
    .isLength({ min: 6 }).withMessage('Nueva contraseña debe tener al menos 6 caracteres')
];

module.exports = { loginRules, cambiarPasswordRules, solicitarRecuperacionRules, restablecerPasswordRules };
