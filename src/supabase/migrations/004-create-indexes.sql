-- Migration: 004-create-indexes
-- Description: Performance optimization indexes

-- Camareros indexes
CREATE INDEX IF NOT EXISTS idx_camareros_activo ON camareros(activo) WHERE activo = true;
CREATE INDEX IF NOT EXISTS idx_camareros_tipo_perfil ON camareros(tipo_perfil);

-- Pedidos indexes
CREATE INDEX IF NOT EXISTS idx_pedidos_fecha ON pedidos(fecha DESC);
CREATE INDEX IF NOT EXISTS idx_pedidos_estado ON pedidos(estado);

-- Coordinadores indexes
CREATE INDEX IF NOT EXISTS idx_coordinadores_activo ON coordinadores(activo) WHERE activo = true;

COMMENT ON INDEX idx_camareros_activo IS 'Partial index for active waitstaff queries';
COMMENT ON INDEX idx_pedidos_fecha IS 'Index for date-based event queries';
