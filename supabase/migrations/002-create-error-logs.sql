-- 002-create-error-logs.sql
-- Almacenamiento de errores con contexto completo

CREATE TABLE IF NOT EXISTS error_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  error_code TEXT,
  error_message TEXT NOT NULL,
  error_stack TEXT,
  severity TEXT NOT NULL DEFAULT 'error' CHECK (severity IN ('debug', 'info', 'warning', 'error', 'critical')),
  context JSONB,
  user_id UUID REFERENCES auth.users(id),
  user_email TEXT,
  ip_address INET,
  user_agent TEXT,
  endpoint TEXT,
  http_method TEXT,
  request_body JSONB,
  resolved BOOLEAN DEFAULT FALSE,
  resolved_by UUID REFERENCES auth.users(id),
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Índices para consultas frecuentes
CREATE INDEX IF NOT EXISTS idx_error_logs_severity ON error_logs(severity);
CREATE INDEX IF NOT EXISTS idx_error_logs_created_at ON error_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_error_logs_resolved ON error_logs(resolved);
CREATE INDEX IF NOT EXISTS idx_error_logs_user_id ON error_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_error_logs_error_code ON error_logs(error_code);

-- Habilitar RLS
ALTER TABLE error_logs ENABLE ROW LEVEL SECURITY;

-- Solo admins pueden leer error_logs
CREATE POLICY "Solo admins pueden leer error_logs"
  ON error_logs FOR SELECT
  USING (auth.jwt() ->> 'role' = 'admin');

-- Las funciones del servidor pueden insertar errores
CREATE POLICY "Service role puede insertar error_logs"
  ON error_logs FOR INSERT
  WITH CHECK (true);

-- Función para registrar errores desde el backend
CREATE OR REPLACE FUNCTION fn_log_error(
  p_error_message TEXT,
  p_error_code TEXT DEFAULT NULL,
  p_error_stack TEXT DEFAULT NULL,
  p_severity TEXT DEFAULT 'error',
  p_context JSONB DEFAULT NULL,
  p_endpoint TEXT DEFAULT NULL,
  p_http_method TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO error_logs (
    error_message,
    error_code,
    error_stack,
    severity,
    context,
    user_id,
    user_email,
    endpoint,
    http_method
  ) VALUES (
    p_error_message,
    p_error_code,
    p_error_stack,
    p_severity,
    p_context,
    auth.uid(),
    auth.jwt() ->> 'email',
    p_endpoint,
    p_http_method
  ) RETURNING id INTO v_log_id;

  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
