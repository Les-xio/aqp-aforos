const AppError = require('../../shared/utils/AppError');

function errorHandler(err, req, res, _next) {
  if (err instanceof AppError || err.isOperational) {
    return res.status(err.statusCode).json({
      ok: false,
      message: err.message,
      code: err.code
    });
  }

  if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
    return res.status(400).json({
      ok: false,
      message: 'Error de validación de datos',
      code: 'VALIDATION_ERROR',
      errors: err.errors?.map(e => ({ field: e.path, message: e.message }))
    });
  }

  if (err.name === 'MulterError') {
    return res.status(400).json({
      ok: false,
      message: `Error de archivo: ${err.message}`,
      code: 'UPLOAD_ERROR'
    });
  }

  console.error('Error no controlado:', err);
  return res.status(500).json({
    ok: false,
    message: 'Error interno del servidor',
    code: 'INTERNAL_ERROR'
  });
}

module.exports = errorHandler;
