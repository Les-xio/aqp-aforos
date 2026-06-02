const bcrypt = require('bcryptjs');
const buildUsuario = require('../../entities/usuario.entity');
const AppError = require('../../../shared/utils/appError');

class RegistrarUsuarioUseCase {
  constructor({ usuarioRepository, auditoriaRepository }) {
    this.usuarioRepository = usuarioRepository;
    this.auditoriaRepository = auditoriaRepository;
  }

  async execute({ usuarioData, usuarioCreadorId }) {
    const usuarioEntity = buildUsuario(usuarioData);

    const existeCorreo = await this.usuarioRepository.findByCorreo(usuarioEntity.correo);
    if (existeCorreo) throw new AppError('El correo ya está registrado', 400, 'EMAIL_EXISTS');

    const existeDni = await this.usuarioRepository.findByDni(usuarioEntity.dni);
    if (existeDni) throw new AppError('El DNI ya está registrado', 400, 'DNI_EXISTS');

    const existeUsername = await this.usuarioRepository.findByUsername(usuarioEntity.userName);
    if (existeUsername) throw new AppError('El usuario ya existe', 400, 'USERNAME_EXISTS');

    const passwordTemporal = usuarioData.passwordTemporal || `${usuarioEntity.dni}Temp2024`;
    const hashedPassword = await bcrypt.hash(passwordTemporal, 10);

    const usuario = await this.usuarioRepository.create({
      nombres: usuarioEntity.nombres,
      apellidos: usuarioEntity.apellidos,
      dni: usuarioEntity.dni,
      celular: usuarioEntity.celular,
      correo: usuarioEntity.correo,
      username: usuarioEntity.userName,
      password: hashedPassword,
      rol: usuarioEntity.rol,
      primer_login: true
    });

    if (this.auditoriaRepository) {
      await this.auditoriaRepository.create({
        usuario_id: usuarioCreadorId,
        accion: 'REGISTRAR_USUARIO',
        entidad: 'Usuario',
        entidad_id: usuario.id_usuario,
        detalle: { correo: usuario.correo, rol: usuario.rol }
      });
    }

    const { password, ...usuarioSinPassword } = usuario.toJSON();
    return { usuario: usuarioSinPassword, passwordTemporal };
  }
}

module.exports = RegistrarUsuarioUseCase;
