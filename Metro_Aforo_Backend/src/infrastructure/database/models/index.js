const sequelize = require('../sequelize');
const Usuario = require('./Usuario');
const Auditoria = require('./Auditoria');
const Turno = require('./Turno');
const FranjaHoraria = require('./FranjaHoraria');
const PuntoAforo = require('./PuntoAforo');
const TurnoPunto = require('./TurnoPunto');
const CategoriaVehicular = require('./CategoriaVehicular');
const SubcategoriaVehicular = require('./SubcategoriaVehicular');
const Vehiculo = require('./Vehiculo');
const ConteoVehicular = require('./ConteoVehicular');
const ConteoOcupacion = require('./ConteoOcupacion');
const EvidenciaFoto = require('./EvidenciaFoto');
const ParadasSubidasBajadas = require('./ParadasSubidasBajadas');
const ColaVehicular = require('./ColaVehicular');
const PasswordReset = require('./PasswordReset');

Usuario.hasMany(Turno, { foreignKey: 'usuario_id', as: 'turnos' });
Turno.belongsTo(Usuario, { foreignKey: 'usuario_id', as: 'usuario' });

Usuario.hasMany(EvidenciaFoto, { foreignKey: 'usuario_id', as: 'evidencias' });
EvidenciaFoto.belongsTo(Usuario, { foreignKey: 'usuario_id', as: 'usuario' });

Usuario.hasMany(Auditoria, { foreignKey: 'usuario_id', as: 'auditorias' });
Auditoria.belongsTo(Usuario, { foreignKey: 'usuario_id', as: 'usuario' });

Turno.hasMany(TurnoPunto, { foreignKey: 'turno_id', as: 'puntosAsignados' });
TurnoPunto.belongsTo(Turno, { foreignKey: 'turno_id', as: 'turno' });

PuntoAforo.hasMany(TurnoPunto, { foreignKey: 'punto_aforo_id', as: 'asignaciones' });
TurnoPunto.belongsTo(PuntoAforo, { foreignKey: 'punto_aforo_id', as: 'puntoAforo' });

Turno.hasMany(FranjaHoraria, { foreignKey: 'turno_id', as: 'franjas' });
FranjaHoraria.belongsTo(Turno, { foreignKey: 'turno_id', as: 'turno' });

CategoriaVehicular.hasMany(SubcategoriaVehicular, { foreignKey: 'categoria_id', as: 'subcategorias' });
SubcategoriaVehicular.belongsTo(CategoriaVehicular, { foreignKey: 'categoria_id', as: 'categoria' });

SubcategoriaVehicular.hasMany(Vehiculo, { foreignKey: 'subcategoria_id', as: 'vehiculos' });
Vehiculo.belongsTo(SubcategoriaVehicular, { foreignKey: 'subcategoria_id', as: 'subcategoria' });

FranjaHoraria.hasMany(ConteoVehicular, { foreignKey: 'franja_id', as: 'conteos' });
ConteoVehicular.belongsTo(FranjaHoraria, { foreignKey: 'franja_id', as: 'franja' });

FranjaHoraria.hasMany(ConteoOcupacion, { foreignKey: 'franja_id', as: 'conteosOcupacion' });
ConteoOcupacion.belongsTo(FranjaHoraria, { foreignKey: 'franja_id', as: 'franja' });

FranjaHoraria.hasMany(EvidenciaFoto, { foreignKey: 'franja_id', as: 'evidencias' });
EvidenciaFoto.belongsTo(FranjaHoraria, { foreignKey: 'franja_id', as: 'franja' });

FranjaHoraria.hasMany(ParadasSubidasBajadas, { foreignKey: 'franja_id', as: 'subidasBajadas' });
ParadasSubidasBajadas.belongsTo(FranjaHoraria, { foreignKey: 'franja_id', as: 'franja' });

FranjaHoraria.hasMany(ColaVehicular, { foreignKey: 'franja_id', as: 'colas' });
ColaVehicular.belongsTo(FranjaHoraria, { foreignKey: 'franja_id', as: 'franja' });

Vehiculo.hasMany(ConteoVehicular, { foreignKey: 'vehiculo_id', as: 'conteos' });
ConteoVehicular.belongsTo(Vehiculo, { foreignKey: 'vehiculo_id', as: 'vehiculo' });

Vehiculo.hasMany(ConteoOcupacion, { foreignKey: 'vehiculo_id', as: 'conteosOcupacion' });
ConteoOcupacion.belongsTo(Vehiculo, { foreignKey: 'vehiculo_id', as: 'vehiculo' });

Vehiculo.hasMany(ParadasSubidasBajadas, { foreignKey: 'vehiculo_id', as: 'subidasBajadas' });
ParadasSubidasBajadas.belongsTo(Vehiculo, { foreignKey: 'vehiculo_id', as: 'vehiculo' });

module.exports = {
  sequelize,
  Usuario,
  Auditoria,
  Turno,
  FranjaHoraria,
  PuntoAforo,
  TurnoPunto,
  CategoriaVehicular,
  SubcategoriaVehicular,
  Vehiculo,
  ConteoVehicular,
  ConteoOcupacion,
  EvidenciaFoto,
  ParadasSubidasBajadas,
  ColaVehicular,
  PasswordReset
};
