const { validationResult } = require('express-validator');
const { error } = require('../../shared/helpers/response');

function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages = errors.array().map(e => ({
      field: e.path,
      message: e.msg
    }));
    return error(res, 'Datos inválidos', 400, 'VALIDATION_ERROR');
  }
  next();
}

module.exports = validate;
