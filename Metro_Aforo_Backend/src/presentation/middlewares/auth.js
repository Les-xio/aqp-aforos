const jwt = require('jsonwebtoken');
const { error } = require('../../shared/helpers/response');

const JWT_SECRET = process.env.JWT_SECRET || 'aqp_aforos_secret_key_2024';

function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return error(res, 'Token de acceso requerido', 401, 'TOKEN_REQUIRED');
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return error(res, 'Token expirado', 401, 'TOKEN_EXPIRED');
    }
    return error(res, 'Token inválido', 401, 'INVALID_TOKEN');
  }
}

module.exports = { authenticate, JWT_SECRET };
