const { body } = require('express-validator');

const iniciarTurnoRules = [
  body('puntoAforoId').isInt({ min: 1 }).withMessage('Punto de aforo requerido'),
  body('sentido').isIn(['norte','sur','este','oeste','noreste','noroeste','sureste','suroeste']).withMessage('Sentido inválido')
];

const registrarConteoVehicularRules = [
  body('franjaId').isInt({ min: 1 }).withMessage('Franja requerida'),
  body('vehiculoId').isInt({ min: 1 }).withMessage('Vehículo requerido'),
  body('cantidad').optional().isInt({ min: 1 }).withMessage('Cantidad inválida'),
  body('accion').optional().isIn(['+1', '-1']).withMessage('Acción inválida')
];

const registrarConteoOcupacionRules = [
  body('franjaId').isInt({ min: 1 }).withMessage('Franja requerida'),
  body('vehiculoId').isInt({ min: 1 }).withMessage('Vehículo requerido'),
  body('ocupacion').isIn(['vacio', 'medio', 'lleno', 'rebosando']).withMessage('Ocupación inválida'),
  body('cantidad').optional().isInt({ min: 1 }).withMessage('Cantidad inválida')
];

const registrarSubidasBajadasRules = [
  body('franjaId').isInt({ min: 1 }).withMessage('Franja requerida'),
  body('vehiculoId').isInt({ min: 1 }).withMessage('Vehículo requerido'),
  body('suben').optional().isInt({ min: 0 }).withMessage('Suben inválido'),
  body('bajan').optional().isInt({ min: 0 }).withMessage('Bajan inválido'),
  body('insatisfechos').optional().isInt({ min: 0 }).withMessage('Insatisfechos inválido')
];

const registrarColaVehicularRules = [
  body('franjaId').isInt({ min: 1 }).withMessage('Franja requerida'),
  body('cantidadCola').isInt({ min: 0 }).withMessage('Cantidad en cola inválida')
];

const registrarEvidenciaRules = [
  body('franjaId').isInt({ min: 1 }).withMessage('Franja requerida'),
  body('latitud').optional({ values: 'null' }).isFloat({ min: -90, max: 90 }).withMessage('Latitud inválida'),
  body('longitud').optional({ values: 'null' }).isFloat({ min: -180, max: 180 }).withMessage('Longitud inválida')
];

module.exports = {
  iniciarTurnoRules,
  registrarConteoVehicularRules,
  registrarConteoOcupacionRules,
  registrarSubidasBajadasRules,
  registrarColaVehicularRules,
  registrarEvidenciaRules
};
