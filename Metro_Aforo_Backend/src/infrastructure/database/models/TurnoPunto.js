const { DataTypes } = require('sequelize');
const sequelize = require('../sequelize');

const TurnoPunto = sequelize.define('TurnoPunto', {
  id_turno_punto: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  turno_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'turnos', key: 'id_turno' }
  },
  punto_aforo_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'puntos_aforo', key: 'id_punto_aforo' }
  },
  sentido: {
    type: DataTypes.ENUM('norte', 'sur', 'este', 'oeste', 'noreste', 'noroeste', 'sureste', 'suroeste'),
    allowNull: false
  }
}, {
  tableName: 'turnos_puntos',
  underscored: true,
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = TurnoPunto;
