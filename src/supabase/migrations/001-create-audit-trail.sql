-- Migration: 001-create-audit-trail
-- Description: Creates audit_trail table for tracking all data mutations

CREATE TABLE IF NOT EXISTS audit_trail (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  table_name TEXT NOT NULL,
  operation TEXT NOT NULL CHECK (operation IN ('INSERT', 'UPDATE', 'DELETE')),
  record_id TEXT,
  old_values JSONB,
  new_values JSONB,
  user_id UUID,
  user_email TEXT,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_audit_trail_table_name ON audit_trail(table_name);
CREATE INDEX idx_audit_trail_created_at ON audit_trail(created_at DESC);
CREATE INDEX idx_audit_trail_user_id ON audit_trail(user_id);

ALTER TABLE audit_trail ENABLE ROW LEVEL SECURITY;

CREATE POLICY "audit_trail_service_role_only" ON audit_trail
  FOR ALL TO service_role USING (true) WITH CHECK (true);

COMMENT ON TABLE audit_trail IS 'Audit log for all data mutations in the system';
