const { success } = require('../../shared/helpers/response');

class EvidenciaFotoController {
  constructor({ registrarEvidenciaFotoUseCase, evidenciaFotoRepository }) {
    this.registrarEvidenciaFotoUseCase = registrarEvidenciaFotoUseCase;
    this.evidenciaFotoRepository = evidenciaFotoRepository;
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

  buscarCercanas = async (req, res, next) => {
    try {
      const { lat, lon, radio } = req.query;
      if (lat == null || lon == null) {
        return res.status(400).json({ ok: false, message: 'lat y lon son requeridos' });
      }
      const radioMetros = parseInt(radio, 10) || 100;
      const resultados = await this.evidenciaFotoRepository.findByProximity(
        parseFloat(lat), parseFloat(lon), radioMetros
      );
      return success(res, resultados);
    } catch (err) { next(err); }
  };
}

module.exports = EvidenciaFotoController;
