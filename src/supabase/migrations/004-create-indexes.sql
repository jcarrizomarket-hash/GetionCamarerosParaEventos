-- Migration 004: Performance indexes
-- Covering indexes for the most common query patterns in the application

-- ---------------------------------------------------------------
-- eventos
-- ---------------------------------------------------------------

-- List upcoming events ordered by date (most common home-page query)
CREATE INDEX IF NOT EXISTS idx_eventos_fecha
  ON eventos (fecha ASC)
  WHERE fecha >= CURRENT_DATE;

-- Filter events by status
CREATE INDEX IF NOT EXISTS idx_eventos_estado
  ON eventos (estado);

-- ---------------------------------------------------------------
-- camareros
-- ---------------------------------------------------------------

-- Look up waitstaff by availability status
CREATE INDEX IF NOT EXISTS idx_camareros_disponible
  ON camareros (disponible)
  WHERE disponible = TRUE;

-- Search by name (supports prefix searches via LIKE 'prefix%')
CREATE INDEX IF NOT EXISTS idx_camareros_nombre
  ON camareros (nombre text_pattern_ops);

-- ---------------------------------------------------------------
-- asignaciones
-- ---------------------------------------------------------------

-- Find all assignments for a specific event
CREATE INDEX IF NOT EXISTS idx_asignaciones_evento_id
  ON asignaciones (evento_id);

-- Find all events assigned to a specific waiter
CREATE INDEX IF NOT EXISTS idx_asignaciones_camarero_id
  ON asignaciones (camarero_id);

-- Composite index: event + waiter (enforces uniqueness and speeds joins)
CREATE UNIQUE INDEX IF NOT EXISTS idx_asignaciones_evento_camarero
  ON asignaciones (evento_id, camarero_id);

-- ---------------------------------------------------------------
-- audit_trail  (created in migration 001)
-- ---------------------------------------------------------------

-- Partial index: only retain non-SELECT operations for fast compliance queries
CREATE INDEX IF NOT EXISTS idx_audit_trail_write_ops
  ON audit_trail (created_at DESC)
  WHERE operation IN ('INSERT', 'UPDATE', 'DELETE');

-- ---------------------------------------------------------------
-- error_logs  (created in migration 002)
-- ---------------------------------------------------------------

-- Dashboard: recent unresolved critical errors
CREATE INDEX IF NOT EXISTS idx_error_logs_critical_recent
  ON error_logs (created_at DESC)
  WHERE severity = 'critical';
