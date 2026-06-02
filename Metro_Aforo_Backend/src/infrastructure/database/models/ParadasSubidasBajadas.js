const { DataTypes } = require('sequelize');
const sequelize = require('../sequelize');

const ParadasSubidasBajadas = sequelize.define('ParadasSubidasBajadas', {
  id_parada: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  franja_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'franjas_horarias', key: 'id_franja' }
  },
  vehiculo_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'vehiculos', key: 'id_vehiculo' }
  },
  suben: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  bajan: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  insatisfechos: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  fecha_hora: {
    type: DataTypes.DATE,
    allowNull: false
  },
  estado_sincronizacion: {
    type: DataTypes.ENUM('PENDIENTE', 'SINCRONIZADO', 'ERROR'),
    defaultValue: 'PENDIENTE'
  }
}, {
  tableName: 'paradas_subidas_bajadas',
  underscored: true,
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = ParadasSubidasBajadas;
