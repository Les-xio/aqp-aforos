const { DataTypes } = require('sequelize');
const sequelize = require('../sequelize');

const PuntoAforo = sequelize.define('PuntoAforo', {
  id_punto_aforo: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre_punto: {
    type: DataTypes.STRING(200),
    allowNull: false
  }
}, {
  tableName: 'puntos_aforo',
  underscored: true,
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = PuntoAforo;
