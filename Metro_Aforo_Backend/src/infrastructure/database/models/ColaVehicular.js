const { DataTypes } = require('sequelize');
const sequelize = require('../sequelize');

const ColaVehicular = sequelize.define('ColaVehicular', {
  id_cola: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  franja_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'franjas_horarias', key: 'id_franja' }
  },
  cantidad_cola: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  observaciones: {
    type: DataTypes.TEXT,
    allowNull: true
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
  tableName: 'colas_vehiculares',
  underscored: true,
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = ColaVehicular;
