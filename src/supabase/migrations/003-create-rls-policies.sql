-- Migration: 003-create-rls-policies.sql
-- Description: Row Level Security policies for core application tables

-- ============================================================
-- EVENTS table RLS
-- ============================================================
ALTER TABLE IF EXISTS events ENABLE ROW LEVEL SECURITY;

-- All authenticated users can view events
CREATE POLICY IF NOT EXISTS "events_authenticated_read" ON events
    FOR SELECT
    USING (auth.role() = 'authenticated');

-- Only admins can create events
CREATE POLICY IF NOT EXISTS "events_admin_insert" ON events
    FOR INSERT
    WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- Only admins can update events
CREATE POLICY IF NOT EXISTS "events_admin_update" ON events
    FOR UPDATE
    USING (auth.jwt() ->> 'role' = 'admin');

-- Only admins can delete events
CREATE POLICY IF NOT EXISTS "events_admin_delete" ON events
    FOR DELETE
    USING (auth.jwt() ->> 'role' = 'admin');

-- ============================================================
-- WAITSTAFF table RLS
-- ============================================================
ALTER TABLE IF EXISTS waitstaff ENABLE ROW LEVEL SECURITY;

-- Waitstaff can view their own profile
CREATE POLICY IF NOT EXISTS "waitstaff_self_read" ON waitstaff
    FOR SELECT
    USING (auth.uid() = user_id OR auth.jwt() ->> 'role' = 'admin');

-- Admins can manage all waitstaff
CREATE POLICY IF NOT EXISTS "waitstaff_admin_all" ON waitstaff
    FOR ALL
    USING (auth.jwt() ->> 'role' = 'admin');

-- Waitstaff can update their own profile
CREATE POLICY IF NOT EXISTS "waitstaff_self_update" ON waitstaff
    FOR UPDATE
    USING (auth.uid() = user_id);

-- ============================================================
-- ASSIGNMENTS table RLS
-- ============================================================
ALTER TABLE IF EXISTS assignments ENABLE ROW LEVEL SECURITY;

-- Waitstaff can see their own assignments (via their waitstaff record)
CREATE POLICY IF NOT EXISTS "assignments_self_read" ON assignments
    FOR SELECT
    USING (
        auth.uid() IN (SELECT user_id FROM waitstaff WHERE id = assignments.waitstaff_id)
        OR auth.jwt() ->> 'role' = 'admin'
    );

-- Only admins can create assignments
CREATE POLICY IF NOT EXISTS "assignments_admin_insert" ON assignments
    FOR INSERT
    WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- Only admins can update assignments
CREATE POLICY IF NOT EXISTS "assignments_admin_update" ON assignments
    FOR UPDATE
    USING (auth.jwt() ->> 'role' = 'admin');

-- Only admins can delete assignments
CREATE POLICY IF NOT EXISTS "assignments_admin_delete" ON assignments
    FOR DELETE
    USING (auth.jwt() ->> 'role' = 'admin');

-- ============================================================
-- Helper function: check if current user is admin
-- ============================================================
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN auth.jwt() ->> 'role' = 'admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;
