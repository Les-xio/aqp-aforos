const { success } = require('../../shared/helpers/response');

class AuthController {
  constructor({ iniciarSesionUseCase, cerrarSesionUseCase, cambiarPasswordUseCase, solicitarRecuperacionUseCase, restablecerPasswordUseCase, obtenerUsuarioAutenticadoUseCase }) {
    this.iniciarSesionUseCase = iniciarSesionUseCase;
    this.cerrarSesionUseCase = cerrarSesionUseCase;
    this.cambiarPasswordUseCase = cambiarPasswordUseCase;
    this.solicitarRecuperacionUseCase = solicitarRecuperacionUseCase;
    this.restablecerPasswordUseCase = restablecerPasswordUseCase;
    this.obtenerUsuarioAutenticadoUseCase = obtenerUsuarioAutenticadoUseCase;
  }

  login = async (req, res, next) => {
    try {
      const { correo, password } = req.body;
      const result = await this.iniciarSesionUseCase.execute({ correo, password });
      return success(res, result, 'Inicio de sesión exitoso');
    } catch (err) { next(err); }
  };

  logout = async (_req, res, next) => {
    try {
      const result = await this.cerrarSesionUseCase.execute();
      return success(res, result, 'Sesión cerrada');
    } catch (err) { next(err); }
  };

  me = async (req, res, next) => {
    try {
      const usuario = await this.obtenerUsuarioAutenticadoUseCase.execute(req.user.id);
      return success(res, usuario, 'Usuario autenticado');
    } catch (err) { next(err); }
  };

  cambiarPassword = async (req, res, next) => {
    try {
      const { passwordActual, nuevaPassword } = req.body;
      const result = await this.cambiarPasswordUseCase.execute({
        idUsuario: req.user.id, passwordActual, nuevaPassword
      });
      return success(res, result, 'Contraseña actualizada');
    } catch (err) { next(err); }
  };

  solicitarRecuperacion = async (req, res, next) => {
    try {
      const result = await this.solicitarRecuperacionUseCase.execute({ correo: req.body.correo });
      return success(res, result, 'Correo enviado');
    } catch (err) { next(err); }
  };

  restablecerPassword = async (req, res, next) => {
    try {
      const { token, nuevaPassword } = req.body;
      const result = await this.restablecerPasswordUseCase.execute({ token, nuevaPassword });
      return success(res, result, 'Contraseña restablecida');
    } catch (err) { next(err); }
  };
}

module.exports = AuthController;
