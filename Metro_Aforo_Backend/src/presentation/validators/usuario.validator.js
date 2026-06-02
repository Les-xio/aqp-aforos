const { body } = require('express-validator');

const registrarRules = [
  body('nombres').notEmpty().withMessage('Nombres requeridos').trim(),
  body('apellidos').notEmpty().withMessage('Apellidos requeridos').trim(),
  body('dni').matches(/^\d{8}$/).withMessage('DNI debe tener 8 dígitos'),
  body('celular').matches(/^\d{9}$/).withMessage('Celular debe tener 9 dígitos'),
  body('correo').isEmail().withMessage('Correo inválido').normalizeEmail(),
  body('rol').isIn(['administrador', 'aforador']).withMessage('Rol inválido'),
  body('user').notEmpty().withMessage('Nombre de usuario requerido').trim()
];

const actualizarRules = [
  body('nombres').optional().trim().notEmpty().withMessage('Nombres no pueden estar vacíos'),
  body('apellidos').optional().trim().notEmpty().withMessage('Apellidos no pueden estar vacíos'),
  body('celular').optional().matches(/^\d{9}$/).withMessage('Celular debe tener 9 dígitos'),
  body('correo').optional().isEmail().withMessage('Correo inválido').normalizeEmail(),
  body('rol').optional().isIn(['administrador', 'aforador']).withMessage('Rol inválido'),
  body('activo').optional().isBoolean().withMessage('Estado inválido')
];

module.exports = { registrarRules, actualizarRules };
