-- Migration 003: Row-Level Security policies for application tables
-- Assumes tables: pedidos, camareros, eventos, notificaciones

-- ───────────────────────────────────────────────
-- pedidos
-- ───────────────────────────────────────────────
ALTER TABLE IF EXISTS pedidos ENABLE ROW LEVEL SECURITY;

-- Authenticated users can only see their own pedidos
DROP POLICY IF EXISTS "pedidos_owner_select" ON pedidos;
CREATE POLICY "pedidos_owner_select"
  ON pedidos FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "pedidos_owner_insert" ON pedidos;
CREATE POLICY "pedidos_owner_insert"
  ON pedidos FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "pedidos_owner_update" ON pedidos;
CREATE POLICY "pedidos_owner_update"
  ON pedidos FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "pedidos_owner_delete" ON pedidos;
CREATE POLICY "pedidos_owner_delete"
  ON pedidos FOR DELETE
  USING (auth.uid() = user_id);

-- ───────────────────────────────────────────────
-- camareros
-- ───────────────────────────────────────────────
ALTER TABLE IF EXISTS camareros ENABLE ROW LEVEL SECURITY;

-- All authenticated users can view camareros (public roster)
DROP POLICY IF EXISTS "camareros_authenticated_select" ON camareros;
CREATE POLICY "camareros_authenticated_select"
  ON camareros FOR SELECT
  USING (auth.role() = 'authenticated');

-- Only service role can mutate camareros
DROP POLICY IF EXISTS "camareros_service_mutate" ON camareros;
CREATE POLICY "camareros_service_mutate"
  ON camareros FOR ALL
  USING (auth.role() = 'service_role');

-- ───────────────────────────────────────────────
-- eventos
-- ───────────────────────────────────────────────
ALTER TABLE IF EXISTS eventos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "eventos_authenticated_select" ON eventos;
CREATE POLICY "eventos_authenticated_select"
  ON eventos FOR SELECT
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "eventos_owner_mutate" ON eventos;
CREATE POLICY "eventos_owner_mutate"
  ON eventos FOR ALL
  USING (auth.uid() = created_by OR auth.role() = 'service_role');

-- ───────────────────────────────────────────────
-- notificaciones
-- ───────────────────────────────────────────────
ALTER TABLE IF EXISTS notificaciones ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "notificaciones_owner_select" ON notificaciones;
CREATE POLICY "notificaciones_owner_select"
  ON notificaciones FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "notificaciones_service_insert" ON notificaciones;
CREATE POLICY "notificaciones_service_insert"
  ON notificaciones FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

DROP POLICY IF EXISTS "notificaciones_owner_update" ON notificaciones;
CREATE POLICY "notificaciones_owner_update"
  ON notificaciones FOR UPDATE
  USING (auth.uid() = user_id);
