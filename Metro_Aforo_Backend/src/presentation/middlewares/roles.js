const { error } = require('../../shared/helpers/response');

function authorize(...rolesPermitidos) {
  return (req, res, next) => {
    if (!req.user) {
      return error(res, 'No autenticado', 401, 'UNAUTHORIZED');
    }

    if (!rolesPermitidos.includes(req.user.rol)) {
      return error(res, 'No tienes permisos para esta acción', 403, 'FORBIDDEN');
    }

    next();
  };
}

module.exports = { authorize };
