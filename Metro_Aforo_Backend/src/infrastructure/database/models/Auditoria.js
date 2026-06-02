const { DataTypes } = require('sequelize');
const sequelize = require('../sequelize');

const Auditoria = sequelize.define('Auditoria', {
  id_auditoria: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  usuario_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: { model: 'usuarios', key: 'id_usuario' }
  },
  accion: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  entidad: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  entidad_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  detalle: {
    type: DataTypes.JSONB,
    allowNull: true
  },
  direccion_ip: {
    type: DataTypes.STRING(45),
    allowNull: true
  }
}, {
  tableName: 'auditoria',
  underscored: true,
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

module.exports = Auditoria;
