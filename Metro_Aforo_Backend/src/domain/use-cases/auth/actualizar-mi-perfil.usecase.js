const AppError = require('../../../shared/utils/appError');

class ActualizarMiPerfilUseCase {
  constructor({ usuarioRepository }) {
    this.usuarioRepository = usuarioRepository;
  }

  async execute({ usuarioId, dni, celular }) {
    const usuario = await this.usuarioRepository.findById(usuarioId);
    if (!usuario) throw new AppError('Usuario no encontrado', 404, 'USER_NOT_FOUND');

    const updateData = {};
    if (dni !== undefined) {
      if (!/^\d{8}$/.test(dni)) throw new AppError('DNI inválido (8 dígitos)', 400, 'INVALID_DNI');
      updateData.dni = dni;
    }
    if (celular !== undefined) {
      if (!/^\d{9}$/.test(celular)) throw new AppError('Celular inválido (9 dígitos)', 400, 'INVALID_PHONE');
      updateData.celular = celular;
    }

    if (Object.keys(updateData).length === 0) {
      throw new AppError('No hay datos para actualizar', 400, 'NO_DATA');
    }

    await this.usuarioRepository.update(usuarioId, updateData);
    return this.usuarioRepository.findById(usuarioId);
  }
}

module.exports = ActualizarMiPerfilUseCase;
