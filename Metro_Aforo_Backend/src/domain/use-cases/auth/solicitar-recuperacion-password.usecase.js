const crypto = require('crypto');
const AppError = require('../../../shared/utils/appError');

class SolicitarRecuperacionPasswordUseCase {

    constructor({ usuarioRepository, passwordResetRepository, emailService }) {
        this.usuarioRepository = usuarioRepository;
        this.passwordResetRepository = passwordResetRepository;
        this.emailService = emailService;
    }

    async execute({ correo }) {
        const usuario = await this.usuarioRepository.findByCorreo(correo);

        if (!usuario) {
            throw new AppError('Usuario no encontrado', 404, 'USER_NOT_FOUND');
        }

        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

        await this.passwordResetRepository.create({
            id_usuario: usuario.id_usuario, token, expires_at: expiresAt
        });

        const recoveryLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/restablecer-password/${token}`;

        if (this.emailService) {
            await this.emailService.sendRecoveryEmail({
                to: usuario.correo, nombres: usuario.nombres, recoveryLink
            });
        }

        return { message: 'Se envió el enlace de recuperación', token };
    }
}

module.exports = SolicitarRecuperacionPasswordUseCase;
