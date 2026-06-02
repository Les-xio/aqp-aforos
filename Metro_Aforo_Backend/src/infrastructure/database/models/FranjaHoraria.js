const { DataTypes } = require('sequelize');
const sequelize = require('../sequelize');

const FranjaHoraria = sequelize.define('FranjaHoraria', {
  id_franja: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  turno_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'turnos', key: 'id_turno' }
  },
  inicio: {
    type: DataTypes.DATE,
    allowNull: false
  },
  fin: {
    type: DataTypes.DATE,
    allowNull: false
  },
  estado: {
    type: DataTypes.ENUM('pendiente', 'completada', 'omitida'),
    defaultValue: 'pendiente'
  },
  motivo: {
    type: DataTypes.STRING(50),
    allowNull: true
  }
}, {
  tableName: 'franjas_horarias',
  underscored: true,
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = FranjaHoraria;
