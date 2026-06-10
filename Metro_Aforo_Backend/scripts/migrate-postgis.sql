-- ============================================
-- MIGRACIÓN: Agregar PostGIS + columna ubicacion
-- Ejecutar solo una vez en BD existente
-- ============================================

CREATE EXTENSION IF NOT EXISTS postgis;

ALTER TABLE evidencias_foto ADD COLUMN IF NOT EXISTS ubicacion GEOGRAPHY(Point, 4326);

UPDATE evidencias_foto
SET ubicacion = ST_SetSRID(ST_MakePoint(longitud, latitud), 4326)::GEOGRAPHY
WHERE ubicacion IS NULL;

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

CREATE INDEX IF NOT EXISTS idx_evidencias_ubicacion ON evidencias_foto USING GIST (ubicacion);
