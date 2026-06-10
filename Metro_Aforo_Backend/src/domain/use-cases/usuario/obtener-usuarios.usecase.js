class ObtenerUsuariosUseCase {
  constructor({ usuarioRepository }) {
    this.usuarioRepository = usuarioRepository;
  }

  async execute({ page, limit, activo, rol } = {}) {
    const { data, total } = await this.usuarioRepository.findAll({ page, limit, activo, rol });
    const usuarios = data.map(u => {
      const { password, ...usuario } = u.toJSON();
      return usuario;
    });
    return { data: usuarios, total };
  }
}

module.exports = ObtenerUsuariosUseCase;
