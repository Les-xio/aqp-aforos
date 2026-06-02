const { success } = require('../../shared/helpers/response');

class EvidenciaFotoController {
  constructor({ registrarEvidenciaFotoUseCase }) {
    this.registrarEvidenciaFotoUseCase = registrarEvidenciaFotoUseCase;
  }

  registrar = async (req, res, next) => {
    try {
      const { franjaId, latitud, longitud } = req.body;
      const fotoUrl = req.file ? `/uploads/${req.file.filename}` : '';
      const result = await this.registrarEvidenciaFotoUseCase.execute({
        franjaId, usuarioId: req.user.id, fotoUrl, latitud, longitud
      });
      return success(res, result, 'Evidencia registrada', 201);
    } catch (err) { next(err); }
  };
}

module.exports = EvidenciaFotoController;
