const { success } = require('../../shared/helpers/response');

class FranjaController {
  constructor({ iniciarFranjaUseCase, cerrarFranjaUseCase, franjaHorariaRepository }) {
    this.iniciarFranjaUseCase = iniciarFranjaUseCase;
    this.cerrarFranjaUseCase = cerrarFranjaUseCase;
    this.franjaHorariaRepository = franjaHorariaRepository;
  }

  iniciar = async (req, res, next) => {
    try {
      const result = await this.iniciarFranjaUseCase.execute({ franjaId: Number(req.params.id) });
      return success(res, result, 'Franja iniciada');
    } catch (err) { next(err); }
  };

  cerrar = async (req, res, next) => {
    try {
      const result = await this.cerrarFranjaUseCase.execute({ franjaId: Number(req.params.id) });
      return success(res, result, 'Franja cerrada');
    } catch (err) { next(err); }
  };

  omitir = async (req, res, next) => {
    try {
      const { motivo } = req.body;
      const result = await this.franjaHorariaRepository.omitir(Number(req.params.id), motivo || 'break');
      return success(res, result, 'Franja omitida');
    } catch (err) { next(err); }
  };

  obtener = async (req, res, next) => {
    try {
      const franja = await this.franjaHorariaRepository.findById(Number(req.params.id));
      if (!franja) return res.status(404).json({ ok: false, message: 'Franja no encontrada' });
      return success(res, franja);
    } catch (err) { next(err); }
  };
}

module.exports = FranjaController;
