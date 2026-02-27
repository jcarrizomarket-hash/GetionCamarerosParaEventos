-- Migration: 004-create-indexes.sql
-- Description: Performance indexes for core application tables

-- ============================================================
-- EVENTS table indexes
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_events_date
    ON events(event_date DESC);

CREATE INDEX IF NOT EXISTS idx_events_status
    ON events(status)
    WHERE status IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_events_created_at
    ON events(created_at DESC);

-- ============================================================
-- WAITSTAFF table indexes
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_waitstaff_user_id
    ON waitstaff(user_id);

CREATE INDEX IF NOT EXISTS idx_waitstaff_available
    ON waitstaff(available)
    WHERE available = true;

CREATE INDEX IF NOT EXISTS idx_waitstaff_email
    ON waitstaff(email);

-- ============================================================
-- ASSIGNMENTS table indexes
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_assignments_event_id
    ON assignments(event_id);

CREATE INDEX IF NOT EXISTS idx_assignments_waitstaff_id
    ON assignments(waitstaff_id);

CREATE INDEX IF NOT EXISTS idx_assignments_status
    ON assignments(status)
    WHERE status IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_assignments_event_waitstaff
    ON assignments(event_id, waitstaff_id);

-- ============================================================
-- AUDIT_TRAIL table - additional composite indexes
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_audit_trail_table_changed_at
    ON audit_trail(table_name, changed_at DESC);

-- ============================================================
-- ERROR_LOGS table - additional composite indexes
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_error_logs_severity_created
    ON error_logs(severity, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_error_logs_source_created
    ON error_logs(source, created_at DESC)
    WHERE source IS NOT NULL;
