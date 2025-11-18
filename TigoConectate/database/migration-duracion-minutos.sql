-- Agregar columnas necesarias para el sistema de expiración de planes
-- duracion_minutos: Duración del plan en minutos (por defecto 10 minutos para demostración)
-- fecha_fin: Timestamp cuando expira el plan

ALTER TABLE contrataciones
ADD COLUMN IF NOT EXISTS duracion_minutos INTEGER DEFAULT 10,
ADD COLUMN IF NOT EXISTS fecha_fin TIMESTAMPTZ;

COMMENT ON COLUMN contrataciones.duracion_minutos IS 'Duración del plan en minutos (para demostración de expiración)';
COMMENT ON COLUMN contrataciones.fecha_fin IS 'Fecha y hora en que expira el plan contratado';
