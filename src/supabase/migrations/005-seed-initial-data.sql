-- Migration: 005-seed-initial-data
-- Description: Seed initial configuration data

-- Insert default system configuration if not exists
INSERT INTO error_logs (
  error_code,
  error_message,
  severity,
  source,
  context
) VALUES (
  'SYSTEM_INIT',
  'System initialized successfully',
  'info',
  'migration',
  '{"version": "2.2", "migration": "005-seed-initial-data"}'::jsonb
) ON CONFLICT DO NOTHING;

-- Insert audit trail entry for this migration
INSERT INTO audit_trail (
  table_name,
  operation,
  new_values
) VALUES (
  'system',
  'INSERT',
  '{"action": "seed_initial_data", "version": "2.2"}'::jsonb
);
