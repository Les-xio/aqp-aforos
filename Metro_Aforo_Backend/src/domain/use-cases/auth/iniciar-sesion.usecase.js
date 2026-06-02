const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const AppError = require('../../../shared/utils/appError');

class IniciarSesionUseCase {

    constructor({ usuarioRepository, jwtConfig }) {
        this.usuarioRepository = usuarioRepository;
        this.jwtConfig = jwtConfig;
    }

    sanitizeUser(usuario) {
        if (!usuario) return null;
        const safeUser = { ...usuario };
        delete safeUser.password;
        return safeUser;
    }

    async execute({ correo, password }) {
        const esEmail = correo.includes('@');
        let usuario = esEmail
            ? await this.usuarioRepository.findByCorreo(correo)
            : await this.usuarioRepository.findByUsername(correo);

        if (!usuario) {
            throw new AppError('Credenciales inválidas', 401, 'INVALID_CREDENTIALS');
        }

        if (!usuario.activo) {
            throw new AppError('Usuario inactivo', 403, 'USER_INACTIVE');
        }

        const validPassword = await bcrypt.compare(password, usuario.password);

        if (!validPassword) {
            throw new AppError('Credenciales inválidas', 401, 'INVALID_CREDENTIALS');
        }

        await this.usuarioRepository.updateLastLogin(usuario.id_usuario, new Date());

        const token = jwt.sign(
            { id: usuario.id_usuario, correo: usuario.correo, rol: usuario.rol },
            this.jwtConfig.secret,
            { expiresIn: this.jwtConfig.expiresIn }
        );

        return {
            usuario: this.sanitizeUser(usuario),
            token
        };
    }
}

module.exports = IniciarSesionUseCase;
