const bcrypt = require('bcryptjs');
const AppError = require('../../../shared/utils/appError');

class CambiarPasswordUseCase {

    constructor({ usuarioRepository }) {
        this.usuarioRepository = usuarioRepository;
    }

    async execute({ idUsuario, passwordActual, nuevaPassword }) {
        if (!nuevaPassword) {
            throw new AppError('La nueva contraseña es requerida', 400, 'NEW_PASSWORD_REQUIRED');
        }

        const usuario = await this.usuarioRepository.findById(idUsuario);

        if (!usuario) {
            throw new AppError('Usuario no encontrado', 404, 'USER_NOT_FOUND');
        }

        const validPassword = await bcrypt.compare(passwordActual, usuario.password);

        if (!validPassword) {
            throw new AppError('La contraseña actual es incorrecta', 401, 'INVALID_CURRENT_PASSWORD');
        }

        const hashedPassword = await bcrypt.hash(nuevaPassword, 10);
        await this.usuarioRepository.updatePassword(usuario.id_usuario, hashedPassword);

        return { message: 'Contraseña actualizada correctamente' };
    }
}

module.exports = CambiarPasswordUseCase;
