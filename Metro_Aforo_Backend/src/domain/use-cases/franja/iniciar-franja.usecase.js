const AppError = require('../../../shared/utils/appError');

class IniciarFranjaUseCase {
  constructor({ franjaHorariaRepository }) {
    this.franjaHorariaRepository = franjaHorariaRepository;
  }

  async execute({ franjaId }) {
    const franja = await this.franjaHorariaRepository.findById(franjaId);
    if (!franja) throw new AppError('Franja no encontrada', 404, 'FRANJA_NOT_FOUND');
    if (franja.estado === 'completada') throw new AppError('La franja ya fue completada', 400, 'FRANJA_COMPLETED');
    if (franja.estado === 'omitida') throw new AppError('La franja fue omitida', 400, 'FRANJA_OMITTED');

    const ahora = new Date();
    if (ahora < franja.inicio) throw new AppError('La franja aún no inicia', 400, 'FRANJA_FUTURE');
    if (ahora > franja.fin) throw new AppError('La franja ya pasó', 400, 'FRANJA_PAST');

    return franja;
  }
}

module.exports = IniciarFranjaUseCase;
