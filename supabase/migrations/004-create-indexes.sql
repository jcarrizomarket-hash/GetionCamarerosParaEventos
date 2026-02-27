-- 004-create-indexes.sql
-- Optimización de queries críticas con índices de rendimiento

-- ============================================================
-- ÍNDICES PARA CAMAREROS
-- ============================================================

-- Búsqueda por nombre completo
CREATE INDEX IF NOT EXISTS idx_camareros_nombre
  ON camareros(nombre);

CREATE INDEX IF NOT EXISTS idx_camareros_apellido
  ON camareros(apellido);

-- Búsqueda por email (único)
CREATE UNIQUE INDEX IF NOT EXISTS idx_camareros_email
  ON camareros(email) WHERE email IS NOT NULL;

-- Búsqueda por estado (activo/inactivo)
CREATE INDEX IF NOT EXISTS idx_camareros_estado
  ON camareros(estado) WHERE estado IS NOT NULL;

-- ============================================================
-- ÍNDICES PARA PEDIDOS
-- ============================================================

-- Búsqueda por fecha del evento (query más frecuente)
CREATE INDEX IF NOT EXISTS idx_pedidos_fecha
  ON pedidos(fecha DESC);

-- Búsqueda por estado del pedido
CREATE INDEX IF NOT EXISTS idx_pedidos_estado
  ON pedidos(estado) WHERE estado IS NOT NULL;

-- Búsqueda por cliente
CREATE INDEX IF NOT EXISTS idx_pedidos_cliente_id
  ON pedidos(cliente_id) WHERE cliente_id IS NOT NULL;

-- Índice compuesto: fecha + estado (listado paginado)
CREATE INDEX IF NOT EXISTS idx_pedidos_fecha_estado
  ON pedidos(fecha DESC, estado);

-- ============================================================
-- ÍNDICES PARA ASIGNACIONES CAMARERO-PEDIDO
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_asignaciones_pedido_id
  ON asignaciones_camareros(pedido_id);

CREATE INDEX IF NOT EXISTS idx_asignaciones_camarero_id
  ON asignaciones_camareros(camarero_id);

-- Índice compuesto para evitar duplicados y acelerar lookups
CREATE UNIQUE INDEX IF NOT EXISTS idx_asignaciones_unique
  ON asignaciones_camareros(pedido_id, camarero_id);

-- ============================================================
-- ÍNDICES PARA COORDINADORES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_coordinadores_nombre
  ON coordinadores(nombre);

CREATE UNIQUE INDEX IF NOT EXISTS idx_coordinadores_email
  ON coordinadores(email) WHERE email IS NOT NULL;

-- ============================================================
-- ÍNDICES PARA CLIENTES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_clientes_nombre
  ON clientes(nombre);

CREATE UNIQUE INDEX IF NOT EXISTS idx_clientes_email
  ON clientes(email) WHERE email IS NOT NULL;

-- ============================================================
-- ÍNDICES PARA AUDIT TRAIL (optimizar consultas de auditoría)
-- ============================================================

-- Índice parcial: solo errores y cambios críticos recientes
CREATE INDEX IF NOT EXISTS idx_audit_trail_recent_changes
  ON audit_trail(created_at DESC, table_name)
  WHERE created_at > NOW() - INTERVAL '90 days';

-- ============================================================
-- ÍNDICES PARA ERROR LOGS
-- ============================================================

-- Errores no resueltos (más frecuente en dashboards)
CREATE INDEX IF NOT EXISTS idx_error_logs_unresolved
  ON error_logs(created_at DESC, severity)
  WHERE resolved = FALSE;
