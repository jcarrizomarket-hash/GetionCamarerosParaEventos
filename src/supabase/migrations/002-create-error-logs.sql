-- Migration: 002-create-error-logs.sql
-- Description: Creates the error_logs table for application error tracking

CREATE TABLE IF NOT EXISTS error_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    error_code TEXT,
    error_message TEXT NOT NULL,
    error_stack TEXT,
    severity TEXT NOT NULL DEFAULT 'error' CHECK (severity IN ('debug', 'info', 'warning', 'error', 'critical')),
    source TEXT,
    user_id UUID REFERENCES auth.users(id),
    session_id TEXT,
    request_url TEXT,
    request_method TEXT,
    metadata JSONB,
    resolved BOOLEAN NOT NULL DEFAULT false,
    resolved_at TIMESTAMPTZ,
    resolved_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for queries by severity
CREATE INDEX IF NOT EXISTS idx_error_logs_severity
    ON error_logs(severity);

-- Index for unresolved errors
CREATE INDEX IF NOT EXISTS idx_error_logs_unresolved
    ON error_logs(created_at DESC)
    WHERE resolved = false;

-- Index for queries by user
CREATE INDEX IF NOT EXISTS idx_error_logs_user_id
    ON error_logs(user_id);

-- Index for time-based queries
CREATE INDEX IF NOT EXISTS idx_error_logs_created_at
    ON error_logs(created_at DESC);

-- Enable RLS
ALTER TABLE error_logs ENABLE ROW LEVEL SECURITY;

-- Admins can read all error logs
CREATE POLICY "error_logs_admin_read" ON error_logs
    FOR SELECT
    USING (auth.jwt() ->> 'role' = 'admin');

-- Any authenticated user can insert their own error logs
CREATE POLICY "error_logs_user_insert" ON error_logs
    FOR INSERT
    WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Admins can update (resolve) error logs
CREATE POLICY "error_logs_admin_update" ON error_logs
    FOR UPDATE
    USING (auth.jwt() ->> 'role' = 'admin');

-- Function to log errors
CREATE OR REPLACE FUNCTION log_error(
    p_error_message TEXT,
    p_severity TEXT DEFAULT 'error',
    p_error_code TEXT DEFAULT NULL,
    p_error_stack TEXT DEFAULT NULL,
    p_source TEXT DEFAULT NULL,
    p_metadata JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_error_id UUID;
BEGIN
    INSERT INTO error_logs (
        error_message,
        severity,
        error_code,
        error_stack,
        source,
        user_id,
        metadata
    ) VALUES (
        p_error_message,
        p_severity,
        p_error_code,
        p_error_stack,
        p_source,
        auth.uid(),
        p_metadata
    ) RETURNING id INTO v_error_id;

    RETURN v_error_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
