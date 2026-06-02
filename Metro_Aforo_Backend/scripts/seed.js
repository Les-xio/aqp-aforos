require('dotenv').config();
const bcrypt = require('bcryptjs');
const {
  sequelize, Usuario, CategoriaVehicular, SubcategoriaVehicular,
  Vehiculo, PuntoAforo
} = require('../src/infrastructure/database/models');

async function seed() {
  try {
    await sequelize.authenticate();
    console.log('Conectado a PostgreSQL');

    await sequelize.sync({ force: false });

    const adminExiste = await Usuario.findOne({ where: { correo: 'admin@aqpaforos.com' } });
    if (!adminExiste) {
      const hash = await bcrypt.hash('Admin123456', 10);
      await Usuario.create({
        nombres: 'Administrador', apellidos: 'Sistema',
        dni: '12345678', celular: '999999999',
        correo: 'admin@aqpaforos.com', username: 'admin',
        password: hash, rol: 'administrador', primer_login: false
      });
      console.log('Admin: admin@aqpaforos.com / Admin123456');
    }

    const aforadorExiste = await Usuario.findOne({ where: { correo: 'aforador@aqpaforos.com' } });
    if (!aforadorExiste) {
      const hash = await bcrypt.hash('Aforador123', 10);
      await Usuario.create({
        nombres: 'Aforador', apellidos: 'Prueba',
        dni: '87654321', celular: '988888888',
        correo: 'aforador@aqpaforos.com', username: 'aforador1',
        password: hash, rol: 'aforador', primer_login: true
      });
      console.log('Aforador: aforador@aqpaforos.com / Aforador123');
    }

    const catCount = await CategoriaVehicular.count();
    if (catCount === 0) {
      const ligero = await CategoriaVehicular.create({ nombre: 'Ligeros', descripcion: 'Autos, taxis, motos, camionetas' });
      const m2 = await CategoriaVehicular.create({ nombre: 'Transporte M2', descripcion: 'Combis, minibuses' });
      const m3 = await CategoriaVehicular.create({ nombre: 'Transporte M3', descripcion: 'Buses de transporte público' });

      const subLigero = await SubcategoriaVehicular.create({ categoria_id: ligero.id_categoria, nombre: 'L1', descripcion: 'Vehículos ligeros' });
      const subM2 = await SubcategoriaVehicular.create({ categoria_id: m2.id_categoria, nombre: 'M2', descripcion: 'Combis' });
      const subM3 = await SubcategoriaVehicular.create({ categoria_id: m3.id_categoria, nombre: 'M3', descripcion: 'Buses' });

      await Vehiculo.bulkCreate([
        { subcategoria_id: subLigero.id_subcategoria, tipo: 'auto' },
        { subcategoria_id: subLigero.id_subcategoria, tipo: 'taxi' },
        { subcategoria_id: subLigero.id_subcategoria, tipo: 'moto' },
        { subcategoria_id: subLigero.id_subcategoria, tipo: 'camioneta' },
        { subcategoria_id: subM2.id_subcategoria, tipo: 'combi' },
        { subcategoria_id: subM3.id_subcategoria, tipo: 'bus' },
        { subcategoria_id: subM3.id_subcategoria, tipo: 'bus SIT' }
      ]);
      console.log('Categorías y vehículos creados');
    }

    const puntoCount = await PuntoAforo.count();
    if (puntoCount === 0) {
      await PuntoAforo.bulkCreate([
        { nombre_punto: 'Av. Ejército - Puente Grau' },
        { nombre_punto: 'Av. Independencia - Goyeneche' },
        { nombre_punto: 'Av. La Marina - San Martín' },
        { nombre_punto: 'Calle Mercaderes - Plaza de Armas' },
        { nombre_punto: 'Av. Salaverry - Jorge Chávez' },
        { nombre_punto: 'Av. Ejército - Umacollo' }
      ]);
      console.log('Puntos de aforo creados');
    }

    console.log('Seed completado exitosamente');
    process.exit(0);
  } catch (error) {
    console.error('Error en seed:', error);
    process.exit(1);
  }
}

seed();
