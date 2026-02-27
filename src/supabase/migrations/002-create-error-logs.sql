-- Migration 002: Create error logs table
-- Stores application errors from Edge Functions and frontend clients

CREATE TABLE IF NOT EXISTS error_logs (
  id            uuid          DEFAULT gen_random_uuid() PRIMARY KEY,
  severity      text          NOT NULL DEFAULT 'error'
                              CHECK (severity IN ('debug', 'info', 'warning', 'error', 'critical')),
  source        text          NOT NULL,  -- e.g. 'edge-function', 'frontend', 'cron'
  message       text          NOT NULL,
  stack_trace   text,
  context       jsonb,                   -- arbitrary key/value metadata
  user_id       uuid          REFERENCES auth.users(id) ON DELETE SET NULL,
  request_id    text,
  created_at    timestamptz   DEFAULT now() NOT NULL
);

-- Index for fast severity-based queries (e.g. alerts on 'critical')
CREATE INDEX IF NOT EXISTS idx_error_logs_severity
  ON error_logs (severity, created_at DESC);

-- Index for lookups by source service
CREATE INDEX IF NOT EXISTS idx_error_logs_source
  ON error_logs (source, created_at DESC);

-- Automatic partition cleanup: delete logs older than 90 days
-- (requires pg_cron; uncomment if available in your Supabase plan)
-- SELECT cron.schedule('purge-old-error-logs', '0 3 * * *',
--   $$DELETE FROM error_logs WHERE created_at < now() - interval '90 days'$$);

-- Enable RLS
ALTER TABLE error_logs ENABLE ROW LEVEL SECURITY;

-- Service role has full access; authenticated users can insert their own errors
CREATE POLICY "error_logs_service_full_access"
  ON error_logs
  FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "error_logs_user_insert"
  ON error_logs
  FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
