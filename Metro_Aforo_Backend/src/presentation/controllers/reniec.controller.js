const { success } = require('../../shared/helpers/response');

class ReniecController {
  constructor({ reniecService }) {
    this.reniecService = reniecService;
  }

  consultarDni = async (req, res, next) => {
    try {
      const { dni } = req.params;
      if (!dni || dni.length !== 8) {
        return res.status(400).json({ ok: false, message: 'DNI debe tener 8 dígitos' });
      }
      const result = await this.reniecService.consultarPorDni(dni);
      return success(res, result, 'DNI consultado exitosamente');
    } catch (err) {
      next(err);
    }
  };
}

module.exports = ReniecController;
