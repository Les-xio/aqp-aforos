class ObtenerUsuariosUseCase {
  constructor({ usuarioRepository }) {
    this.usuarioRepository = usuarioRepository;
  }

  async execute({ page, limit, activo } = {}) {
    const { data, total } = await this.usuarioRepository.findAll({ page, limit, activo });
    const usuarios = data.map(u => {
      const { password, ...usuario } = u.toJSON();
      return usuario;
    });
    return { data: usuarios, total };
  }
}

module.exports = ObtenerUsuariosUseCase;
