const { DataTypes } = require('sequelize');
const sequelize = require('../sequelize');

const EvidenciaFoto = sequelize.define('EvidenciaFoto', {
  id_evidencia: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  franja_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'franjas_horarias', key: 'id_franja' }
  },
  usuario_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'usuarios', key: 'id_usuario' }
  },
  foto_url: {
    type: DataTypes.STRING(500),
    allowNull: false
  },
  latitud: {
    type: DataTypes.DECIMAL(10, 7),
    allowNull: false
  },
  longitud: {
    type: DataTypes.DECIMAL(10, 7),
    allowNull: false
  },
  fecha_hora: {
    type: DataTypes.DATE,
    allowNull: false
  }
}, {
  tableName: 'evidencias_foto',
  underscored: true,
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = EvidenciaFoto;
