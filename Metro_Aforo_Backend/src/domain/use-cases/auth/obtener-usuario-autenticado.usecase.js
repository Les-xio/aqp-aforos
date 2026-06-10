const AppError = require('../../../shared/utils/appError');

class ObtenerUsuarioAutenticadoUseCase {

    constructor({ usuarioRepository }) {
        this.usuarioRepository = usuarioRepository;
    }

    sanitizeUser(usuario) {
        if (!usuario) return null;
        const safeUser = usuario.toJSON ? usuario.toJSON() : { ...usuario };
        delete safeUser.password;
        return safeUser;
    }

    async execute(idUsuario) {
        if (!idUsuario) {
            throw new AppError('ID de usuario requerido', 400, 'USER_ID_REQUIRED');
        }

        const usuario = await this.usuarioRepository.findById(idUsuario);

        if (!usuario) {
            throw new AppError('Usuario no encontrado', 404, 'USER_NOT_FOUND');
        }

        if (!usuario.activo) {
            throw new AppError('Usuario inactivo', 403, 'USER_INACTIVE');
        }

        return this.sanitizeUser(usuario);
    }
}

module.exports = ObtenerUsuarioAutenticadoUseCase;
