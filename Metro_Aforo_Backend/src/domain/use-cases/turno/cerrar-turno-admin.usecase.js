const AppError = require('../../../shared/utils/appError');

class CerrarTurnoAdminUseCase {
  constructor({ turnoRepository }) {
    this.turnoRepository = turnoRepository;
  }

  async execute({ turnoId }) {
    const turno = await this.turnoRepository.findById(turnoId);
    if (!turno) throw new AppError('Turno no encontrado', 404, 'TURNO_NOT_FOUND');
    if (!turno.activo) throw new AppError('El turno ya está cerrado', 400, 'TURNO_CLOSED');

    return this.turnoRepository.cerrar(turnoId);
  }
}

module.exports = CerrarTurnoAdminUseCase;
