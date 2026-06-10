const { success } = require('../../shared/helpers/response');

class TurnoController {
  constructor({ iniciarTurnoUseCase, cerrarTurnoUseCase, generarTurnoAdminUseCase, turnoRepository, franjaHorariaRepository, turnoPuntoRepository }) {
    this.iniciarTurnoUseCase = iniciarTurnoUseCase;
    this.cerrarTurnoUseCase = cerrarTurnoUseCase;
    this.generarTurnoAdminUseCase = generarTurnoAdminUseCase;
    this.turnoRepository = turnoRepository;
    this.franjaHorariaRepository = franjaHorariaRepository;
    this.turnoPuntoRepository = turnoPuntoRepository;
  }

  iniciar = async (req, res, next) => {
    try {
      const { puntoAforoId, sentido } = req.body;
      const result = await this.iniciarTurnoUseCase.execute({
        usuarioId: req.user.id, puntoAforoId, sentido
      });
      return success(res, result, 'Turno iniciado', 201);
    } catch (err) { next(err); }
  };

  cerrar = async (req, res, next) => {
    try {
      const result = await this.cerrarTurnoUseCase.execute({
        turnoId: Number(req.params.id),
        usuarioId: req.user.id
      });
      return success(res, result, 'Turno cerrado');
    } catch (err) { next(err); }
  };

  listar = async (req, res, next) => {
    try {
      const { page = 1, limit = 10 } = req.query;
      const result = await this.turnoRepository.findAll({ page: Number(page), limit: Number(limit) });
      return success(res, result.data, 'Turnos obtenidos');
    } catch (err) { next(err); }
  };

  obtener = async (req, res, next) => {
    try {
      const turno = await this.turnoRepository.findById(Number(req.params.id));
      if (!turno) return res.status(404).json({ ok: false, message: 'Turno no encontrado' });
      return success(res, turno);
    } catch (err) { next(err); }
  };

  activo = async (req, res, next) => {
    try {
      const turno = await this.turnoRepository.findActivoByUsuario(req.user.id);
      return success(res, turno, turno ? 'Turno activo encontrado' : 'Sin turno activo');
    } catch (err) { next(err); }
  };

  obtenerFranjas = async (req, res, next) => {
    try {
      const franjas = await this.franjaHorariaRepository.findByTurno(Number(req.params.id));
      return success(res, franjas, 'Franjas obtenidas');
    } catch (err) { next(err); }
  };

  obtenerPuntosAsignados = async (req, res, next) => {
    try {
      const puntos = await this.turnoPuntoRepository.findByTurno(Number(req.params.id));
      return success(res, puntos, 'Puntos de aforo del turno');
    } catch (err) { next(err); }
  };

  generarAdmin = async (req, res, next) => {
    try {
      const { usuarioId, horas, fechaInicio } = req.body;
      const result = await this.generarTurnoAdminUseCase.execute({ usuarioId, horas, fechaInicio });
      return success(res, result, 'Turno generado correctamente', 201);
    } catch (err) { next(err); }
  };

  pendiente = async (req, res, next) => {
    try {
      const turno = await this.turnoRepository.findPendienteByUsuario(req.user.id);
      return success(res, turno, turno ? 'Turno pendiente encontrado' : 'Sin turno pendiente');
    } catch (err) { next(err); }
  };

  activarPendiente = async (req, res, next) => {
    try {
      const { puntoAforoId, sentido } = req.body;
      const turno = await this.turnoRepository.findPendienteByUsuario(req.user.id);
      if (!turno) {
        return res.status(400).json({ ok: false, message: 'No tienes un turno pendiente asignado' });
      }
      await turno.update({ activo: true, fecha_inicio: new Date() });
      await this.turnoPuntoRepository.create({
        turno_id: turno.id_turno,
        punto_aforo_id: puntoAforoId,
        sentido
      });
      const updated = await this.turnoRepository.findById(turno.id_turno);
      return success(res, updated, 'Turno activado correctamente');
    } catch (err) { next(err); }
  };
}

module.exports = TurnoController;
