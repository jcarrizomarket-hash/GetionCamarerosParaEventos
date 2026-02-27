-- Migration: 001-create-audit-trail.sql
-- Description: Creates the audit_trail table for tracking all data changes

CREATE TABLE IF NOT EXISTS audit_trail (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name TEXT NOT NULL,
    operation TEXT NOT NULL CHECK (operation IN ('INSERT', 'UPDATE', 'DELETE')),
    record_id UUID,
    old_data JSONB,
    new_data JSONB,
    changed_by UUID REFERENCES auth.users(id),
    changed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    ip_address TEXT,
    user_agent TEXT
);

-- Index for efficient queries by table and operation
CREATE INDEX IF NOT EXISTS idx_audit_trail_table_operation
    ON audit_trail(table_name, operation);

-- Index for queries by record
CREATE INDEX IF NOT EXISTS idx_audit_trail_record_id
    ON audit_trail(record_id);

-- Index for queries by user
CREATE INDEX IF NOT EXISTS idx_audit_trail_changed_by
    ON audit_trail(changed_by);

-- Index for time-based queries
CREATE INDEX IF NOT EXISTS idx_audit_trail_changed_at
    ON audit_trail(changed_at DESC);

-- Enable RLS
ALTER TABLE audit_trail ENABLE ROW LEVEL SECURITY;

-- Only admins can read audit trail
CREATE POLICY "audit_trail_admin_read" ON audit_trail
    FOR SELECT
    USING (auth.jwt() ->> 'role' = 'admin');

-- System can insert audit records
CREATE POLICY "audit_trail_system_insert" ON audit_trail
    FOR INSERT
    WITH CHECK (true);

-- Function to record audit events
CREATE OR REPLACE FUNCTION record_audit_event()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        INSERT INTO audit_trail (table_name, operation, record_id, old_data, changed_by)
        VALUES (TG_TABLE_NAME, TG_OP, OLD.id, row_to_json(OLD)::jsonb, auth.uid());
        RETURN OLD;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO audit_trail (table_name, operation, record_id, old_data, new_data, changed_by)
        VALUES (TG_TABLE_NAME, TG_OP, NEW.id, row_to_json(OLD)::jsonb, row_to_json(NEW)::jsonb, auth.uid());
        RETURN NEW;
    ELSIF TG_OP = 'INSERT' THEN
        INSERT INTO audit_trail (table_name, operation, record_id, new_data, changed_by)
        VALUES (TG_TABLE_NAME, TG_OP, NEW.id, row_to_json(NEW)::jsonb, auth.uid());
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
