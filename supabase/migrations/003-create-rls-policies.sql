-- 003-create-rls-policies.sql
-- Políticas de seguridad a nivel de fila (Row Level Security)

-- ============================================================
-- CAMAREROS
-- ============================================================

ALTER TABLE camareros ENABLE ROW LEVEL SECURITY;

-- Coordinadores y admins pueden ver todos los camareros
CREATE POLICY "Coordinadores pueden ver camareros"
  ON camareros FOR SELECT
  USING (
    auth.jwt() ->> 'role' IN ('admin', 'coordinador')
  );

-- Solo admins y coordinadores pueden crear camareros
CREATE POLICY "Coordinadores pueden crear camareros"
  ON camareros FOR INSERT
  WITH CHECK (
    auth.jwt() ->> 'role' IN ('admin', 'coordinador')
  );

-- Solo admins y coordinadores pueden actualizar camareros
CREATE POLICY "Coordinadores pueden actualizar camareros"
  ON camareros FOR UPDATE
  USING (
    auth.jwt() ->> 'role' IN ('admin', 'coordinador')
  );

-- Solo admins pueden eliminar camareros
CREATE POLICY "Solo admins pueden eliminar camareros"
  ON camareros FOR DELETE
  USING (
    auth.jwt() ->> 'role' = 'admin'
  );

-- ============================================================
-- PEDIDOS
-- ============================================================

ALTER TABLE pedidos ENABLE ROW LEVEL SECURITY;

-- Usuarios autenticados pueden ver pedidos
CREATE POLICY "Usuarios autenticados pueden ver pedidos"
  ON pedidos FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Coordinadores y admins pueden crear pedidos
CREATE POLICY "Coordinadores pueden crear pedidos"
  ON pedidos FOR INSERT
  WITH CHECK (
    auth.jwt() ->> 'role' IN ('admin', 'coordinador')
  );

-- Coordinadores pueden actualizar pedidos
CREATE POLICY "Coordinadores pueden actualizar pedidos"
  ON pedidos FOR UPDATE
  USING (
    auth.jwt() ->> 'role' IN ('admin', 'coordinador')
  );

-- Solo admins pueden eliminar pedidos
CREATE POLICY "Solo admins pueden eliminar pedidos"
  ON pedidos FOR DELETE
  USING (
    auth.jwt() ->> 'role' = 'admin'
  );

-- ============================================================
-- COORDINADORES
-- ============================================================

ALTER TABLE coordinadores ENABLE ROW LEVEL SECURITY;

-- Usuarios autenticados pueden ver coordinadores
CREATE POLICY "Usuarios autenticados pueden ver coordinadores"
  ON coordinadores FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Solo admins pueden gestionar coordinadores
CREATE POLICY "Solo admins pueden crear coordinadores"
  ON coordinadores FOR INSERT
  WITH CHECK (
    auth.jwt() ->> 'role' = 'admin'
  );

CREATE POLICY "Solo admins pueden actualizar coordinadores"
  ON coordinadores FOR UPDATE
  USING (
    auth.jwt() ->> 'role' = 'admin'
  );

CREATE POLICY "Solo admins pueden eliminar coordinadores"
  ON coordinadores FOR DELETE
  USING (
    auth.jwt() ->> 'role' = 'admin'
  );

-- ============================================================
-- CLIENTES
-- ============================================================

ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;

-- Usuarios autenticados pueden ver clientes
CREATE POLICY "Usuarios autenticados pueden ver clientes"
  ON clientes FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Coordinadores y admins pueden gestionar clientes
CREATE POLICY "Coordinadores pueden gestionar clientes"
  ON clientes FOR ALL
  USING (
    auth.jwt() ->> 'role' IN ('admin', 'coordinador')
  );
