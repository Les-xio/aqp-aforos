-- ============================================
-- SCRIPT DE INICIALIZACIÓN: METRO AQP AFOROS
-- Conforme al Diagrama Entidad-Relación
-- ============================================

-- CREATE DATABASE aqp_aforo;

-- ============================================
-- TABLA: usuarios
-- ============================================
CREATE TABLE IF NOT EXISTS usuarios (
    id_usuario   SERIAL PRIMARY KEY,
    nombres      VARCHAR(100) NOT NULL,
    apellidos    VARCHAR(100) NOT NULL,
    dni          VARCHAR(8) NOT NULL UNIQUE,
    celular      VARCHAR(9) NOT NULL,
    correo       VARCHAR(150) NOT NULL UNIQUE,
    username     VARCHAR(50) NOT NULL UNIQUE,
    password     VARCHAR(255) NOT NULL,
    rol          VARCHAR(20) NOT NULL DEFAULT 'aforador'
                 CHECK (rol IN ('administrador', 'aforador')),
    activo       BOOLEAN DEFAULT TRUE,
    primer_login BOOLEAN DEFAULT TRUE,
    ultimo_login TIMESTAMP,
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABLA: categorias_vehiculares
-- ============================================
CREATE TABLE IF NOT EXISTS categorias_vehiculares (
    id_categoria SERIAL PRIMARY KEY,
    nombre       VARCHAR(100) NOT NULL UNIQUE,
    descripcion  TEXT,
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABLA: subcategorias_vehiculares
-- ============================================
CREATE TABLE IF NOT EXISTS subcategorias_vehiculares (
    id_subcategoria SERIAL PRIMARY KEY,
    categoria_id    INTEGER NOT NULL REFERENCES categorias_vehiculares(id_categoria)
                    ON DELETE RESTRICT ON UPDATE CASCADE,
    nombre          VARCHAR(100) NOT NULL,
    descripcion     TEXT,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABLA: vehiculos (SIN zona_vehiculo)
-- ============================================
CREATE TABLE IF NOT EXISTS vehiculos (
    id_vehiculo    SERIAL PRIMARY KEY,
    subcategoria_id INTEGER NOT NULL REFERENCES subcategorias_vehiculares(id_subcategoria)
                    ON DELETE RESTRICT ON UPDATE CASCADE,
    tipo           VARCHAR(50) NOT NULL,
    activo         BOOLEAN DEFAULT TRUE,
    created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABLA: puntos_aforo (SIN sentido)
-- ============================================
CREATE TABLE IF NOT EXISTS puntos_aforo (
    id_punto_aforo SERIAL PRIMARY KEY,
    nombre_punto   VARCHAR(200) NOT NULL,
    created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABLA: turnos (SIN punto_aforo_id)
-- ============================================
CREATE TABLE IF NOT EXISTS turnos (
    id_turno       SERIAL PRIMARY KEY,
    usuario_id     INTEGER NOT NULL REFERENCES usuarios(id_usuario)
                   ON DELETE RESTRICT ON UPDATE CASCADE,
    fecha_inicio   TIMESTAMP NOT NULL,
    fecha_fin      TIMESTAMP,
    activo         BOOLEAN DEFAULT TRUE,
    created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABLA: turnos_puntos (relación N:M)
-- ============================================
CREATE TABLE IF NOT EXISTS turnos_puntos (
    id_turno_punto  SERIAL PRIMARY KEY,
    turno_id        INTEGER NOT NULL REFERENCES turnos(id_turno)
                    ON DELETE CASCADE ON UPDATE CASCADE,
    punto_aforo_id  INTEGER NOT NULL REFERENCES puntos_aforo(id_punto_aforo)
                    ON DELETE RESTRICT ON UPDATE CASCADE,
    sentido         VARCHAR(10) NOT NULL
                    CHECK (sentido IN ('norte','sur','este','oeste','noreste','noroeste','sureste','suroeste')),
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (turno_id, punto_aforo_id, sentido)
);

-- ============================================
-- TABLA: franjas_horarias
-- ============================================
CREATE TABLE IF NOT EXISTS franjas_horarias (
    id_franja  SERIAL PRIMARY KEY,
    turno_id   INTEGER NOT NULL REFERENCES turnos(id_turno)
               ON DELETE CASCADE ON UPDATE CASCADE,
    inicio     TIMESTAMP NOT NULL,
    fin        TIMESTAMP NOT NULL,
    estado     VARCHAR(15) NOT NULL DEFAULT 'pendiente'
               CHECK (estado IN ('pendiente', 'completada', 'omitida')),
    motivo     VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_franja_horario CHECK (fin > inicio)
);

-- ============================================
-- TABLA: conteos_vehiculares
-- ============================================
CREATE TABLE IF NOT EXISTS conteos_vehiculares (
    id_conteo    SERIAL PRIMARY KEY,
    franja_id    INTEGER NOT NULL REFERENCES franjas_horarias(id_franja)
                 ON DELETE CASCADE ON UPDATE CASCADE,
    vehiculo_id  INTEGER NOT NULL REFERENCES vehiculos(id_vehiculo)
                 ON DELETE RESTRICT ON UPDATE CASCADE,
    cantidad     INTEGER DEFAULT 1 CHECK (cantidad > 0),
    accion       VARCHAR(2) DEFAULT '+1' CHECK (accion IN ('+1', '-1')),
    fecha_hora   TIMESTAMP NOT NULL,
    estado_sincronizacion VARCHAR(15) DEFAULT 'PENDIENTE'
                 CHECK (estado_sincronizacion IN ('PENDIENTE', 'SINCRONIZADO', 'ERROR')),
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABLA: conteos_ocupacion
-- ============================================
CREATE TABLE IF NOT EXISTS conteos_ocupacion (
    id_conteo_ocupacion SERIAL PRIMARY KEY,
    franja_id           INTEGER NOT NULL REFERENCES franjas_horarias(id_franja)
                        ON DELETE CASCADE ON UPDATE CASCADE,
    vehiculo_id         INTEGER NOT NULL REFERENCES vehiculos(id_vehiculo)
                        ON DELETE RESTRICT ON UPDATE CASCADE,
    ocupacion           VARCHAR(20) NOT NULL CHECK (ocupacion IN ('vacio','medio','lleno','rebosando')),
    cantidad            INTEGER DEFAULT 1 CHECK (cantidad > 0),
    fecha_hora          TIMESTAMP NOT NULL,
    estado_sincronizacion VARCHAR(15) DEFAULT 'PENDIENTE'
                        CHECK (estado_sincronizacion IN ('PENDIENTE', 'SINCRONIZADO', 'ERROR')),
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- EXTENSIÓN POSTGIS (datos geoespaciales)
-- ============================================
CREATE EXTENSION IF NOT EXISTS postgis;

-- ============================================
-- TABLA: evidencias_foto
-- ============================================
CREATE TABLE IF NOT EXISTS evidencias_foto (
    id_evidencia SERIAL PRIMARY KEY,
    franja_id    INTEGER NOT NULL REFERENCES franjas_horarias(id_franja)
                 ON DELETE CASCADE ON UPDATE CASCADE,
    usuario_id   INTEGER NOT NULL REFERENCES usuarios(id_usuario)
                 ON DELETE RESTRICT ON UPDATE CASCADE,
    foto_url     VARCHAR(500) NOT NULL,
    latitud      DECIMAL(10,7) NOT NULL,
    longitud     DECIMAL(10,7) NOT NULL,
    ubicacion    GEOGRAPHY(Point, 4326),
    fecha_hora   TIMESTAMP NOT NULL,
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABLA: paradas_subidas_bajadas
-- ============================================
CREATE TABLE IF NOT EXISTS paradas_subidas_bajadas (
    id_parada    SERIAL PRIMARY KEY,
    franja_id    INTEGER NOT NULL REFERENCES franjas_horarias(id_franja)
                 ON DELETE CASCADE ON UPDATE CASCADE,
    vehiculo_id  INTEGER NOT NULL REFERENCES vehiculos(id_vehiculo)
                 ON DELETE RESTRICT ON UPDATE CASCADE,
    suben        INTEGER DEFAULT 0 CHECK (suben >= 0),
    bajan        INTEGER DEFAULT 0 CHECK (bajan >= 0),
    insatisfechos INTEGER DEFAULT 0 CHECK (insatisfechos >= 0),
    fecha_hora   TIMESTAMP NOT NULL,
    estado_sincronizacion VARCHAR(15) DEFAULT 'PENDIENTE'
                 CHECK (estado_sincronizacion IN ('PENDIENTE', 'SINCRONIZADO', 'ERROR')),
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABLA: colas_vehiculares
-- ============================================
CREATE TABLE IF NOT EXISTS colas_vehiculares (
    id_cola      SERIAL PRIMARY KEY,
    franja_id    INTEGER NOT NULL REFERENCES franjas_horarias(id_franja)
                 ON DELETE CASCADE ON UPDATE CASCADE,
    cantidad_cola INTEGER NOT NULL CHECK (cantidad_cola >= 0),
    observaciones TEXT,
    fecha_hora   TIMESTAMP NOT NULL,
    estado_sincronizacion VARCHAR(15) DEFAULT 'PENDIENTE'
                 CHECK (estado_sincronizacion IN ('PENDIENTE', 'SINCRONIZADO', 'ERROR')),
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABLA: password_resets
-- ============================================
CREATE TABLE IF NOT EXISTS password_resets (
    id_reset   SERIAL PRIMARY KEY,
    id_usuario INTEGER NOT NULL REFERENCES usuarios(id_usuario)
               ON DELETE CASCADE ON UPDATE CASCADE,
    token      VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    usado      BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABLA: auditoria
-- ============================================
CREATE TABLE IF NOT EXISTS auditoria (
    id_auditoria SERIAL PRIMARY KEY,
    usuario_id   INTEGER REFERENCES usuarios(id_usuario)
                 ON DELETE SET NULL ON UPDATE CASCADE,
    accion       VARCHAR(100) NOT NULL,
    entidad      VARCHAR(100) NOT NULL,
    entidad_id   INTEGER,
    detalle      JSONB,
    direccion_ip VARCHAR(45),
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- ÍNDICES PARA RENDIMIENTO
-- ============================================
CREATE INDEX IF NOT EXISTS idx_turnos_usuario ON turnos(usuario_id);
CREATE INDEX IF NOT EXISTS idx_turnos_activo ON turnos(activo) WHERE activo = TRUE;
CREATE INDEX IF NOT EXISTS idx_turnos_puntos_turno ON turnos_puntos(turno_id);
CREATE INDEX IF NOT EXISTS idx_franjas_turno ON franjas_horarias(turno_id);
CREATE INDEX IF NOT EXISTS idx_franjas_estado ON franjas_horarias(estado);
CREATE INDEX IF NOT EXISTS idx_conteos_franja ON conteos_vehiculares(franja_id);
CREATE INDEX IF NOT EXISTS idx_conteos_ocupacion_franja ON conteos_ocupacion(franja_id);
CREATE INDEX IF NOT EXISTS idx_evidencias_franja ON evidencias_foto(franja_id);
CREATE INDEX IF NOT EXISTS idx_evidencias_ubicacion ON evidencias_foto USING GIST (ubicacion);
CREATE INDEX IF NOT EXISTS idx_subidas_franja ON paradas_subidas_bajadas(franja_id);
CREATE INDEX IF NOT EXISTS idx_colas_franja ON colas_vehiculares(franja_id);
CREATE INDEX IF NOT EXISTS idx_auditoria_fecha ON auditoria(created_at DESC);

-- ============================================
-- TRIGGER: sincronizar ubicacion con latitud/longitud
-- ============================================
CREATE OR REPLACE FUNCTION sync_evidencia_ubicacion()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.latitud IS NOT NULL AND NEW.longitud IS NOT NULL THEN
    NEW.ubicacion = ST_SetSRID(ST_MakePoint(NEW.longitud, NEW.latitud), 4326)::GEOGRAPHY;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_evidencia_ubicacion ON evidencias_foto;
CREATE TRIGGER trg_sync_evidencia_ubicacion
  BEFORE INSERT OR UPDATE OF latitud, longitud ON evidencias_foto
  FOR EACH ROW
  EXECUTE FUNCTION sync_evidencia_ubicacion();
