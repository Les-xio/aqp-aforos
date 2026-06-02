const { DataTypes } = require('sequelize');
const sequelize = require('../sequelize');

const SubcategoriaVehicular = sequelize.define('SubcategoriaVehicular', {
  id_subcategoria: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  categoria_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'categorias_vehiculares', key: 'id_categoria' }
  },
  nombre: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'subcategorias_vehiculares',
  underscored: true,
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = SubcategoriaVehicular;
