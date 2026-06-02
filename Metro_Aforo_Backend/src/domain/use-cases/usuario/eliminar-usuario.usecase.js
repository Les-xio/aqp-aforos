const AppError = require('../../../shared/utils/appError');

class EliminarUsuarioUseCase {
  constructor({ usuarioRepository, auditoriaRepository }) {
    this.usuarioRepository = usuarioRepository;
    this.auditoriaRepository = auditoriaRepository;
  }

  async execute({ id, usuarioAuditorId }) {
    const usuario = await this.usuarioRepository.findById(id);
    if (!usuario) throw new AppError('Usuario no encontrado', 404, 'USER_NOT_FOUND');

    await this.usuarioRepository.update(id, { activo: false });

    if (this.auditoriaRepository) {
      await this.auditoriaRepository.create({
        usuario_id: usuarioAuditorId,
        accion: 'DESACTIVAR_USUARIO',
        entidad: 'Usuario',
        entidad_id: id,
        detalle: { usuario: usuario.correo }
      });
    }

    return { message: 'Usuario desactivado correctamente' };
  }
}

module.exports = EliminarUsuarioUseCase;
