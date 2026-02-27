-- Migration: 003-create-rls-policies
-- Description: Enhanced RLS policies for all main tables

-- Enable RLS on main tables (if not already enabled)
DO $$
BEGIN
  -- These statements are wrapped in DO block to avoid errors if tables don't exist yet
  PERFORM 1;
END $$;

-- Camareros table policies
ALTER TABLE IF EXISTS camareros ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "camareros_authenticated_read" ON camareros;
CREATE POLICY "camareros_authenticated_read" ON camareros
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "camareros_service_role_write" ON camareros;
CREATE POLICY "camareros_service_role_write" ON camareros
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Pedidos table policies
ALTER TABLE IF EXISTS pedidos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "pedidos_authenticated_read" ON pedidos;
CREATE POLICY "pedidos_authenticated_read" ON pedidos
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "pedidos_service_role_write" ON pedidos;
CREATE POLICY "pedidos_service_role_write" ON pedidos
  FOR ALL TO service_role USING (true) WITH CHECK (true);
