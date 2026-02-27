-- Migration 004: Performance indexes
-- Add indexes on frequently-queried columns across application tables

-- ───────────────────────────────────────────────
-- pedidos
-- ───────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_pedidos_user_id
  ON pedidos (user_id);

CREATE INDEX IF NOT EXISTS idx_pedidos_estado
  ON pedidos (estado, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_pedidos_evento_id
  ON pedidos (evento_id);

-- ───────────────────────────────────────────────
-- camareros
-- ───────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_camareros_disponible
  ON camareros (disponible, nombre);

CREATE INDEX IF NOT EXISTS idx_camareros_evento_id
  ON camareros (evento_id);

-- ───────────────────────────────────────────────
-- eventos
-- ───────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_eventos_fecha
  ON eventos (fecha DESC);

CREATE INDEX IF NOT EXISTS idx_eventos_created_by
  ON eventos (created_by, fecha DESC);

-- ───────────────────────────────────────────────
-- notificaciones
-- ───────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_notificaciones_user_id
  ON notificaciones (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notificaciones_leido
  ON notificaciones (user_id, leido) WHERE leido = false;

-- ───────────────────────────────────────────────
-- audit_trail  (additional compound index)
-- ───────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_audit_trail_row_id
  ON audit_trail (row_id, changed_at DESC);
