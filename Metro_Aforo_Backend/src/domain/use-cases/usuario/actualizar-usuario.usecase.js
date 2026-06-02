const AppError = require('../../../shared/utils/appError');

class ActualizarUsuarioUseCase {
  constructor({ usuarioRepository, auditoriaRepository }) {
    this.usuarioRepository = usuarioRepository;
    this.auditoriaRepository = auditoriaRepository;
  }

  async execute({ id, data, usuarioAuditorId }) {
    const usuario = await this.usuarioRepository.findById(id);
    if (!usuario) throw new AppError('Usuario no encontrado', 404, 'USER_NOT_FOUND');

    if (data.correo && data.correo !== usuario.correo) {
      const existe = await this.usuarioRepository.findByCorreo(data.correo);
      if (existe) throw new AppError('El correo ya está registrado', 400, 'EMAIL_EXISTS');
    }

    const camposPermitidos = ['nombres', 'apellidos', 'celular', 'correo', 'rol', 'activo'];
    const actualizar = {};
    for (const campo of camposPermitidos) {
      if (data[campo] !== undefined) actualizar[campo] = data[campo];
    }

    const usuarioActualizado = await this.usuarioRepository.update(id, actualizar);

    if (this.auditoriaRepository) {
      await this.auditoriaRepository.create({
        usuario_id: usuarioAuditorId,
        accion: 'ACTUALIZAR_USUARIO',
        entidad: 'Usuario',
        entidad_id: id,
        detalle: { cambios: actualizar }
      });
    }

    const { password, ...usuarioSinPassword } = usuarioActualizado.toJSON();
    return usuarioSinPassword;
  }
}

module.exports = ActualizarUsuarioUseCase;
