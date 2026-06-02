const { EvidenciaFoto } = require('../database/models');

class EvidenciaFotoRepository {
  async findByFranja(franjaId) {
    return EvidenciaFoto.findAll({ where: { franja_id: franjaId } });
  }

  async create(data) {
    return EvidenciaFoto.create(data);
  }
}

module.exports = EvidenciaFotoRepository;
