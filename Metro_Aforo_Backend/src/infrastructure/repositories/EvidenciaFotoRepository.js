const { EvidenciaFoto, sequelize } = require('../database/models');

class EvidenciaFotoRepository {
  async findByFranja(franjaId) {
    return EvidenciaFoto.findAll({ where: { franja_id: franjaId } });
  }

  async create(data) {
    return EvidenciaFoto.create(data);
  }

  /**
   * Busca evidencias dentro de un radio (metros) de un punto geográfico.
   * Ordena por distancia ascendente.
   */
  async findByProximity(latitud, longitud, radioMetros = 100) {
    const query = `
      SELECT e.*,
        ST_Distance(e.ubicacion, ST_SetSRID(ST_MakePoint(:lon, :lat), 4326)::GEOGRAPHY) AS distancia
      FROM evidencias_foto e
      WHERE e.ubicacion IS NOT NULL
        AND ST_DWithin(e.ubicacion, ST_SetSRID(ST_MakePoint(:lon, :lat), 4326)::GEOGRAPHY, :radio)
      ORDER BY distancia
    `;
    const [rows] = await sequelize.query(query, {
      replacements: { lat: latitud, lon: longitud, radio: radioMetros },
      model: EvidenciaFoto,
      mapToModel: true
    });
    return rows;
  }
}

module.exports = EvidenciaFotoRepository;
