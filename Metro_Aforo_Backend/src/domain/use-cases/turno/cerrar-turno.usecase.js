const AppError = require('../../../shared/utils/appError');

class CerrarTurnoUseCase {
  constructor({ turnoRepository }) {
    this.turnoRepository = turnoRepository;
  }

  async execute({ turnoId, usuarioId }) {
    const turno = await this.turnoRepository.findById(turnoId);
    if (!turno) throw new AppError('Turno no encontrado', 404, 'TURNO_NOT_FOUND');
    if (turno.usuario_id !== usuarioId) throw new AppError('No autorizado', 403, 'FORBIDDEN');
    if (!turno.activo) throw new AppError('El turno ya está cerrado', 400, 'TURNO_CLOSED');

    return this.turnoRepository.cerrar(turnoId);
  }
}

module.exports = CerrarTurnoUseCase;
