-- Migration 001: Create audit trail table
-- Tracks all create/update/delete operations for compliance and debugging

CREATE TABLE IF NOT EXISTS audit_trail (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name  TEXT        NOT NULL,
  operation   TEXT        NOT NULL CHECK (operation IN ('INSERT', 'UPDATE', 'DELETE')),
  record_id   UUID,
  old_data    JSONB,
  new_data    JSONB,
  user_id     UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  ip_address  INET,
  user_agent  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for fast lookups by table and record
CREATE INDEX IF NOT EXISTS idx_audit_trail_table_record
  ON audit_trail (table_name, record_id);

-- Index for chronological queries per user
CREATE INDEX IF NOT EXISTS idx_audit_trail_user_created
  ON audit_trail (user_id, created_at DESC);

-- Generic trigger function that populates the audit table
CREATE OR REPLACE FUNCTION fn_audit_trigger()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO audit_trail (table_name, operation, record_id, old_data, new_data, user_id)
  VALUES (
    TG_TABLE_NAME,
    TG_OP,
    CASE WHEN TG_OP = 'DELETE' THEN OLD.id ELSE NEW.id END,
    CASE WHEN TG_OP = 'INSERT' THEN NULL ELSE to_jsonb(OLD) END,
    CASE WHEN TG_OP = 'DELETE' THEN NULL ELSE to_jsonb(NEW) END,
    auth.uid()
  );
  RETURN NULL;
END;
$$;

-- Enable RLS so only authenticated service-role can read audit data
ALTER TABLE audit_trail ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_only" ON audit_trail
  USING (auth.role() = 'service_role');
