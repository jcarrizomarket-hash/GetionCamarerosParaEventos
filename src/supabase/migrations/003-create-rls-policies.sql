-- Migration 003: Row-Level Security (RLS) policies
-- Centralised security rules applied to all application tables

-- ---------------------------------------------------------------
-- Helper: ensure RLS is enabled on every table before adding policies
-- ---------------------------------------------------------------

-- eventos
ALTER TABLE IF EXISTS eventos ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "eventos_select_auth"
  ON eventos FOR SELECT
  USING (auth.role() IN ('authenticated', 'service_role'));

CREATE POLICY IF NOT EXISTS "eventos_insert_admin"
  ON eventos FOR INSERT
  WITH CHECK (auth.role() = 'service_role' OR
              EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY IF NOT EXISTS "eventos_update_admin"
  ON eventos FOR UPDATE
  USING (auth.role() = 'service_role' OR
         EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY IF NOT EXISTS "eventos_delete_admin"
  ON eventos FOR DELETE
  USING (auth.role() = 'service_role');

-- ---------------------------------------------------------------
-- camareros
-- ---------------------------------------------------------------

ALTER TABLE IF EXISTS camareros ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "camareros_select_auth"
  ON camareros FOR SELECT
  USING (auth.role() IN ('authenticated', 'service_role'));

CREATE POLICY IF NOT EXISTS "camareros_insert_admin"
  ON camareros FOR INSERT
  WITH CHECK (auth.role() = 'service_role' OR
              EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY IF NOT EXISTS "camareros_update_owner_or_admin"
  ON camareros FOR UPDATE
  USING (auth.uid() = user_id OR
         auth.role() = 'service_role' OR
         EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY IF NOT EXISTS "camareros_delete_admin"
  ON camareros FOR DELETE
  USING (auth.role() = 'service_role');

-- ---------------------------------------------------------------
-- asignaciones (event-staff assignments)
-- ---------------------------------------------------------------

ALTER TABLE IF EXISTS asignaciones ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "asignaciones_select_auth"
  ON asignaciones FOR SELECT
  USING (auth.role() IN ('authenticated', 'service_role'));

CREATE POLICY IF NOT EXISTS "asignaciones_write_admin"
  ON asignaciones FOR ALL
  USING (auth.role() = 'service_role' OR
         EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin'));

-- ---------------------------------------------------------------
-- user_profiles
-- ---------------------------------------------------------------

ALTER TABLE IF EXISTS user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "user_profiles_select_own"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id OR auth.role() = 'service_role');

CREATE POLICY IF NOT EXISTS "user_profiles_update_own"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id OR auth.role() = 'service_role');
