require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const { sequelize } = require('./infrastructure/database/models');
const buildControllers = require('./presentation/controllers');
const buildRouters = require('./presentation/routers');
const { repositories, useCases } = require('./infrastructure/container');
const errorHandler = require('./presentation/middlewares/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(uploadsDir));

app.get('/health', (_req, res) => {
  res.json({ ok: true, message: 'API Metro AQP Aforos funcionando', timestamp: new Date().toISOString() });
});

const controllers = buildControllers(useCases, repositories);
const routers = buildRouters(controllers);

app.use('/api/auth', routers.authRouter);
app.use('/api/usuarios', routers.usuarioRouter);
app.use('/api/turnos', routers.turnoRouter);
app.use('/api/franjas', routers.franjaRouter);
app.use('/api/conteos-vehiculares', routers.conteoVehicularRouter);
app.use('/api/conteos-ocupacion', routers.conteoOcupacionRouter);
app.use('/api/puntos-aforo', routers.puntoAforoRouter);
app.use('/api/vehiculos', routers.vehiculoRouter);
app.use('/api/evidencias-foto', routers.evidenciaFotoRouter);
app.use('/api/subidas-bajadas', routers.subidasBajadasRouter);
app.use('/api/colas-vehiculares', routers.colaVehicularRouter);
app.use('/api/reportes', routers.reporteRouter);
app.use('/api/reniec', routers.reniecRouter);

app.use(errorHandler);

async function main() {
  try {
    await sequelize.authenticate();
    console.log('Conexión a PostgreSQL establecida');

    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: false });
      console.log('Modelos sincronizados');
    }

    app.listen(PORT, () => {
      console.log(`Servidor corriendo en puerto ${PORT}`);
      console.log(`Entorno: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('Error al iniciar:', error);
    process.exit(1);
  }
}

main();

module.exports = app;
