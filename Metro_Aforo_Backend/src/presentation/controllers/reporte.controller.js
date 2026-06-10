const { Op } = require('sequelize');
const {
  ConteoVehicular, ConteoOcupacion, ParadasSubidasBajadas,
  FranjaHoraria, Turno, Usuario, PuntoAforo, Vehiculo, TurnoPunto
} = require('../../infrastructure/database/models');
const { sendExport, parseFormato } = require('../../shared/helpers/export');

const columnasConteos = [
  { key: 'id_conteo', label: 'ID', width: 8 },
  { key: 'franja.turno.id_turno', label: 'Turno', width: 8 },
  { key: 'franja.turno.usuario.nombres', label: 'Aforador', width: 20 },
  { key: 'franja.turno.puntosAsignados[0].puntoAforo.nombre_punto', label: 'Punto', width: 30 },
  { key: 'franja.turno.puntosAsignados[0].sentido', label: 'Sentido', width: 10 },
  { key: 'franja.inicio', label: 'Franja Inicio', width: 20 },
  { key: 'franja.fin', label: 'Franja Fin', width: 20 },
  { key: 'vehiculo.tipo', label: 'Vehículo', width: 15 },
  { key: 'cantidad', label: 'Cantidad', width: 10 },
  { key: 'accion', label: 'Acción', width: 8 },
  { key: 'fecha_hora', label: 'Fecha/Hora', width: 20 }
];

const columnasOcupacion = [
  { key: 'id_conteo_ocupacion', label: 'ID', width: 8 },
  { key: 'franja.turno.id_turno', label: 'Turno', width: 8 },
  { key: 'franja.turno.usuario.nombres', label: 'Aforador', width: 20 },
  { key: 'franja.turno.puntosAsignados[0].puntoAforo.nombre_punto', label: 'Punto', width: 30 },
  { key: 'franja.inicio', label: 'Franja', width: 20 },
  { key: 'vehiculo.tipo', label: 'Vehículo', width: 15 },
  { key: 'ocupacion', label: 'Ocupación', width: 12 },
  { key: 'cantidad', label: 'Cantidad', width: 10 },
  { key: 'fecha_hora', label: 'Fecha/Hora', width: 20 }
];

const columnasParadas = [
  { key: 'id_parada', label: 'ID', width: 8 },
  { key: 'franja.turno.id_turno', label: 'Turno', width: 8 },
  { key: 'franja.turno.usuario.nombres', label: 'Aforador', width: 20 },
  { key: 'franja.turno.puntosAsignados[0].puntoAforo.nombre_punto', label: 'Punto', width: 30 },
  { key: 'franja.inicio', label: 'Franja', width: 20 },
  { key: 'vehiculo.tipo', label: 'Vehículo', width: 15 },
  { key: 'suben', label: 'Suben', width: 8 },
  { key: 'bajan', label: 'Bajan', width: 8 },
  { key: 'insatisfechos', label: 'Insatisfechos', width: 14 },
  { key: 'fecha_hora', label: 'Fecha/Hora', width: 20 }
];

function armarWhere(req) {
  const { punto_aforo_id, usuario_id, fecha_desde, fecha_hasta, turno_id } = req.query;
  const where = {};
  if (turno_id) where['$franja.turno_id$'] = Number(turno_id);
  if (fecha_desde) where['$franja.turno.fecha_inicio$'] = { [Op.gte]: new Date(fecha_desde) };
  if (fecha_hasta) where['$franja.turno.fecha_inicio$'] = { [Op.lte]: new Date(fecha_hasta) };
  if (usuario_id) where['$franja.turno.usuario_id$'] = Number(usuario_id);
  if (punto_aforo_id) where['$franja.turno.puntosAsignados.punto_aforo_id$'] = Number(punto_aforo_id);
  return where;
}

const includeBase = () => [
  { model: FranjaHoraria, as: 'franja', include: [
    { model: Turno, as: 'turno', include: [
      { model: Usuario, as: 'usuario' },
      { model: TurnoPunto, as: 'puntosAsignados', include: [
        { model: PuntoAforo, as: 'puntoAforo' }
      ]}
    ]}
  ]},
  { model: Vehiculo, as: 'vehiculo' }
];

function calcularTotales(data, tipoColumna = 'cantidad') {
  const map = {};
  data.forEach((item) => {
    const vehiculo = item.vehiculo?.tipo || 'Sin tipo';
    map[vehiculo] = (map[vehiculo] || 0) + Number(item[tipoColumna] || 0);
  });
  return Object.entries(map).map(([vehiculo, total]) => ({ vehiculo, total }));
}

class ReporteController {
  async exportarConteos(req, res, next) {
    try {
      const formato = parseFormato(req);
      const data = await ConteoVehicular.findAll({
        where: armarWhere(req),
        include: includeBase(),
        order: [['fecha_hora', 'ASC']]
      });
      const totals = calcularTotales(data);
      return sendExport(res, data, columnasConteos, 'reporte_conteos_vehiculares', formato, totals);
    } catch (err) { next(err); }
  }

  async exportarOcupacion(req, res, next) {
    try {
      const formato = parseFormato(req);
      const data = await ConteoOcupacion.findAll({
        where: armarWhere(req),
        include: includeBase(),
        order: [['fecha_hora', 'ASC']]
      });
      const totals = calcularTotales(data);
      return sendExport(res, data, columnasOcupacion, 'reporte_ocupacion', formato, totals);
    } catch (err) { next(err); }
  }

  async exportarParadas(req, res, next) {
    try {
      const formato = parseFormato(req);
      const data = await ParadasSubidasBajadas.findAll({
        where: armarWhere(req),
        include: includeBase(),
        order: [['fecha_hora', 'ASC']]
      });
      return sendExport(res, data, columnasParadas, 'reporte_subidas_bajadas', formato);
    } catch (err) { next(err); }
  }
}

module.exports = ReporteController;
