const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const AppError = require('../../../shared/utils/appError');

class IniciarSesionGoogleUseCase {
  constructor({ usuarioRepository, jwtConfig, googleClientId }) {
    this.usuarioRepository = usuarioRepository;
    this.jwtConfig = jwtConfig;
    this.googleClient = new OAuth2Client(googleClientId);
  }

  sanitizeUser(usuario) {
    if (!usuario) return null;
    const safeUser = usuario.toJSON ? usuario.toJSON() : { ...usuario };
    delete safeUser.password;
    return safeUser;
  }

  async execute({ googleToken }) {
    const ticket = await this.googleClient.verifyIdToken({
      idToken: googleToken,
      audience: this.googleClient._clientId,
    });
    const payload = ticket.getPayload();
    const { email, given_name, family_name, sub: googleId } = payload;

    if (!email) {
      throw new AppError('El correo de Google es requerido', 400, 'GOOGLE_EMAIL_REQUIRED');
    }

    let usuario = await this.usuarioRepository.findByCorreo(email);

    if (!usuario) {
      const username = email.split('@')[0].replace(/[^a-z0-9_]/gi, '_').toLowerCase();
      const randomPassword = await bcrypt.hash(require('crypto').randomBytes(16).toString('hex'), 10);
      usuario = await this.usuarioRepository.create({
        nombres: given_name || email.split('@')[0],
        apellidos: family_name || 'Google',
        dni: '00000000',
        celular: '000000000',
        correo: email,
        username,
        password: randomPassword,
        rol: 'aforador',
        activo: true,
        primer_login: false,
      });
    }

    if (!usuario.activo) {
      throw new AppError('Usuario inactivo', 403, 'USER_INACTIVE');
    }

    await this.usuarioRepository.updateLastLogin(usuario.id_usuario, new Date());

    const token = jwt.sign(
      { id: usuario.id_usuario, correo: usuario.correo, rol: usuario.rol },
      this.jwtConfig.secret,
      { expiresIn: this.jwtConfig.expiresIn }
    );

    return {
      usuario: this.sanitizeUser(usuario),
      token,
    };
  }
}

module.exports = IniciarSesionGoogleUseCase;
