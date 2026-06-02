const { DataTypes } = require('sequelize');
const sequelize = require('../sequelize');

const Vehiculo = sequelize.define('Vehiculo', {
  id_vehiculo: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  subcategoria_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'subcategorias_vehiculares', key: 'id_subcategoria' }
  },
  tipo: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  activo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'vehiculos',
  underscored: true,
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Vehiculo;
