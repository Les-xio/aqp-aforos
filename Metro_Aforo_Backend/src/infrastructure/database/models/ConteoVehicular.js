const { DataTypes } = require('sequelize');
const sequelize = require('../sequelize');

const ConteoVehicular = sequelize.define('ConteoVehicular', {
  id_conteo: {
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
  cantidad: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  accion: {
    type: DataTypes.STRING(2),
    defaultValue: '+1'
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
  tableName: 'conteos_vehiculares',
  underscored: true,
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = ConteoVehicular;
