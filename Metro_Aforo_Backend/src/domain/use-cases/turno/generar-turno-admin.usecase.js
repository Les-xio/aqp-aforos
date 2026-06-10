const buildTurno = require('../../entities/turno.entity');
const AppError = require('../../../shared/utils/appError');

class GenerarTurnoAdminUseCase {
  constructor({ turnoRepository, franjaHorariaRepository, usuarioRepository }) {
    this.turnoRepository = turnoRepository;
    this.franjaHorariaRepository = franjaHorariaRepository;
    this.usuarioRepository = usuarioRepository;
  }

  async execute({ usuarioId, horas, fechaInicio }) {
    const usuario = await this.usuarioRepository.findById(usuarioId);
    if (!usuario) throw new AppError('Usuario no encontrado', 404);
    if (usuario.rol !== 'aforador') throw new AppError('El usuario no es aforador', 400);

    const turnoActivo = await this.turnoRepository.findActivoByUsuario(usuarioId);
    if (turnoActivo) throw new AppError('El aforador ya tiene un turno activo', 400);

    if (!Number.isInteger(horas) || horas < 1 || horas > 24) {
      throw new AppError('Las horas deben ser entre 1 y 24', 400);
    }

    const inicio = fechaInicio ? new Date(fechaInicio) : new Date();
    const turnoEntity = buildTurno({ usuarioId, fechaInicio: inicio });
    const turno = await this.turnoRepository.create({
      usuario_id: turnoEntity.usuarioId,
      fecha_inicio: turnoEntity.fechaInicio,
      activo: false
    });

    const franjas = this._generarFranjas(turno.id_turno, inicio, horas);
    await this.franjaHorariaRepository.bulkCreate(franjas);

    return this.turnoRepository.findById(turno.id_turno);
  }

  _generarFranjas(turnoId, fechaInicio, horas) {
    const franjas = [];
    const inicio = new Date(fechaInicio);
    inicio.setSeconds(0, 0);

    const totalFranjas = horas * 4;
    for (let i = 0; i < totalFranjas; i++) {
      const fin = new Date(inicio.getTime() + 15 * 60 * 1000);
      franjas.push({
        turno_id: turnoId,
        inicio: new Date(inicio),
        fin,
        estado: 'pendiente'
      });
      inicio.setTime(fin.getTime());
    }
    return franjas;
  }
}

module.exports = GenerarTurnoAdminUseCase;
