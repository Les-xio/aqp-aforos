const { success, paginated } = require('../../shared/helpers/response');

class UsuarioController {
  constructor({ registrarUsuarioUseCase, actualizarUsuarioUseCase, eliminarUsuarioUseCase, obtenerUsuariosUseCase }) {
    this.registrarUsuarioUseCase = registrarUsuarioUseCase;
    this.actualizarUsuarioUseCase = actualizarUsuarioUseCase;
    this.eliminarUsuarioUseCase = eliminarUsuarioUseCase;
    this.obtenerUsuariosUseCase = obtenerUsuariosUseCase;
  }

  listar = async (req, res, next) => {
    try {
      const { page = 1, limit = 10, activo } = req.query;
      const result = await this.obtenerUsuariosUseCase.execute({
        page: Number(page), limit: Number(limit),
        activo: activo !== undefined ? activo === 'true' : undefined
      });
      return paginated(res, result.data, result.total, page, limit);
    } catch (err) { next(err); }
  };

  registrar = async (req, res, next) => {
    try {
      const result = await this.registrarUsuarioUseCase.execute({
        usuarioData: req.body,
        usuarioCreadorId: req.user.id
      });
      return success(res, result, 'Usuario registrado', 201);
    } catch (err) { next(err); }
  };

  actualizar = async (req, res, next) => {
    try {
      const result = await this.actualizarUsuarioUseCase.execute({
        id: Number(req.params.id),
        data: req.body,
        usuarioAuditorId: req.user.id
      });
      return success(res, result, 'Usuario actualizado');
    } catch (err) { next(err); }
  };

  eliminar = async (req, res, next) => {
    try {
      const result = await this.eliminarUsuarioUseCase.execute({
        id: Number(req.params.id),
        usuarioAuditorId: req.user.id
      });
      return success(res, result, 'Usuario desactivado');
    } catch (err) { next(err); }
  };
}

module.exports = UsuarioController;
