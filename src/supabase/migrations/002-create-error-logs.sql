-- Migration 002: Create error logs table
-- Captures runtime errors from Edge Functions and the frontend

CREATE TABLE IF NOT EXISTS error_logs (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  source      TEXT        NOT NULL,          -- 'edge_function' | 'frontend' | 'cron'
  severity    TEXT        NOT NULL CHECK (severity IN ('debug', 'info', 'warning', 'error', 'critical')),
  message     TEXT        NOT NULL,
  stack_trace TEXT,
  context     JSONB,                          -- arbitrary key/value metadata
  user_id     UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  request_id  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Fast retrieval of recent critical errors
CREATE INDEX IF NOT EXISTS idx_error_logs_severity_created
  ON error_logs (severity, created_at DESC);

-- Filter by source system
CREATE INDEX IF NOT EXISTS idx_error_logs_source_created
  ON error_logs (source, created_at DESC);

-- Automatically drop logs older than 90 days (requires pg_cron extension)
-- Uncomment after enabling pg_cron in Supabase dashboard:
-- SELECT cron.schedule(
--   'purge-old-error-logs',
--   '0 3 * * *',
--   $$DELETE FROM error_logs WHERE created_at < now() - INTERVAL '90 days'$$
-- );

-- RLS: service role writes; authenticated users can read their own errors
ALTER TABLE error_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_write" ON error_logs
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "user_read_own" ON error_logs
  FOR SELECT USING (auth.uid() = user_id);
