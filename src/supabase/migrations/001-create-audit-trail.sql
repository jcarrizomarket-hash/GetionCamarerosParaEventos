-- Migration 001: Create audit trail table
-- Tracks all data-mutating operations for compliance and debugging

CREATE TABLE IF NOT EXISTS audit_trail (
  id            uuid          DEFAULT gen_random_uuid() PRIMARY KEY,
  table_name    text          NOT NULL,
  operation     text          NOT NULL CHECK (operation IN ('INSERT', 'UPDATE', 'DELETE')),
  row_id        uuid,
  old_data      jsonb,
  new_data      jsonb,
  changed_by    uuid          REFERENCES auth.users(id) ON DELETE SET NULL,
  changed_at    timestamptz   DEFAULT now() NOT NULL,
  ip_address    inet,
  user_agent    text
);

-- Index for fast lookup by table and operation
CREATE INDEX IF NOT EXISTS idx_audit_trail_table_op
  ON audit_trail (table_name, operation, changed_at DESC);

-- Index for lookups by actor
CREATE INDEX IF NOT EXISTS idx_audit_trail_changed_by
  ON audit_trail (changed_by, changed_at DESC);

-- Enable RLS so only service-role can read the full audit log
ALTER TABLE audit_trail ENABLE ROW LEVEL SECURITY;

-- Service role bypasses RLS; regular authenticated users cannot read audit rows
CREATE POLICY "audit_trail_service_only"
  ON audit_trail
  FOR ALL
  USING (auth.role() = 'service_role');

-- Generic trigger function that populates audit_trail
CREATE OR REPLACE FUNCTION fn_audit_trail()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO audit_trail (table_name, operation, row_id, old_data, new_data, changed_by)
  VALUES (
    TG_TABLE_NAME,
    TG_OP,
    CASE TG_OP WHEN 'DELETE' THEN (OLD.id)::uuid ELSE (NEW.id)::uuid END,
    CASE TG_OP WHEN 'INSERT' THEN NULL ELSE to_jsonb(OLD) END,
    CASE TG_OP WHEN 'DELETE' THEN NULL ELSE to_jsonb(NEW) END,
    auth.uid()
  );
  RETURN CASE WHEN TG_OP = 'DELETE' THEN OLD ELSE NEW END;
END;
$$;
