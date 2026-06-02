function success(res, data = null, message = 'Operación exitosa', statusCode = 200) {
  return res.status(statusCode).json({
    ok: true,
    message,
    data
  });
}

function paginated(res, data, total, page, limit, message = 'Operación exitosa') {
  return res.status(200).json({
    ok: true,
    message,
    data,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit)
    }
  });
}

function error(res, message = 'Error interno', statusCode = 500, code = 'INTERNAL_ERROR') {
  return res.status(statusCode).json({
    ok: false,
    message,
    code
  });
}

module.exports = { success, paginated, error };
