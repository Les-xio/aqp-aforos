const bcrypt = require('bcryptjs');
const AppError = require('../../../shared/utils/appError');

class RestablecerPasswordUseCase {

    constructor({ usuarioRepository, passwordResetRepository }) {
        this.usuarioRepository = usuarioRepository;
        this.passwordResetRepository = passwordResetRepository;
    }

    async execute({ token, nuevaPassword }) {
        const resetToken = await this.passwordResetRepository.findByToken(token);

        if (!resetToken) {
            throw new AppError('Token inválido', 400, 'INVALID_TOKEN');
        }

        if (new Date() > resetToken.expires_at) {
            throw new AppError('Token expirado', 400, 'EXPIRED_TOKEN');
        }

        const usuario = await this.usuarioRepository.findById(resetToken.id_usuario);

        if (!usuario) {
            throw new AppError('Usuario no encontrado', 404, 'USER_NOT_FOUND');
        }

        const hashedPassword = await bcrypt.hash(nuevaPassword, 10);
        await this.usuarioRepository.updatePassword(usuario.id_usuario, hashedPassword);
        await this.passwordResetRepository.delete(resetToken.id_reset);

        return { message: 'Contraseña restablecida correctamente' };
    }
}

module.exports = RestablecerPasswordUseCase;
