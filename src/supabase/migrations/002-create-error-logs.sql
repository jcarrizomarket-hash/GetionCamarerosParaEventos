-- Migration: 002-create-error-logs
-- Description: Creates error_logs table for centralized error tracking

CREATE TABLE IF NOT EXISTS error_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  error_code TEXT,
  error_message TEXT NOT NULL,
  error_stack TEXT,
  context JSONB,
  severity TEXT NOT NULL DEFAULT 'error' CHECK (severity IN ('debug', 'info', 'warn', 'error', 'critical')),
  source TEXT,
  user_id UUID,
  request_id TEXT,
  resolved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  resolved_at TIMESTAMPTZ
);

CREATE INDEX idx_error_logs_severity ON error_logs(severity);
CREATE INDEX idx_error_logs_created_at ON error_logs(created_at DESC);
CREATE INDEX idx_error_logs_resolved ON error_logs(resolved);

ALTER TABLE error_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "error_logs_service_role_only" ON error_logs
  FOR ALL TO service_role USING (true) WITH CHECK (true);

COMMENT ON TABLE error_logs IS 'Centralized error logging for debugging and monitoring';
