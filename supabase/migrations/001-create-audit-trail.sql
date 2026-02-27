-- 001-create-audit-trail.sql
-- Tabla centralizada para auditoría de TODOS los cambios

CREATE TABLE IF NOT EXISTS audit_trail (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  table_name TEXT NOT NULL,
  operation TEXT NOT NULL CHECK (operation IN ('INSERT', 'UPDATE', 'DELETE')),
  record_id TEXT,
  old_values JSONB,
  new_values JSONB,
  changed_by UUID REFERENCES auth.users(id),
  changed_by_email TEXT,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Índices para consultas frecuentes
CREATE INDEX IF NOT EXISTS idx_audit_trail_table_name ON audit_trail(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_trail_changed_by ON audit_trail(changed_by);
CREATE INDEX IF NOT EXISTS idx_audit_trail_created_at ON audit_trail(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_trail_operation ON audit_trail(operation);

-- Habilitar RLS
ALTER TABLE audit_trail ENABLE ROW LEVEL SECURITY;

-- Solo admins pueden leer el audit trail
CREATE POLICY "Solo admins pueden leer audit_trail"
  ON audit_trail FOR SELECT
  USING (auth.jwt() ->> 'role' = 'admin');

-- Función genérica para registrar cambios en cualquier tabla
CREATE OR REPLACE FUNCTION fn_audit_trail()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_trail (
    table_name,
    operation,
    record_id,
    old_values,
    new_values,
    changed_by,
    changed_by_email
  ) VALUES (
    TG_TABLE_NAME,
    TG_OP,
    CASE
      WHEN TG_OP = 'DELETE' THEN OLD.id::TEXT
      ELSE NEW.id::TEXT
    END,
    CASE WHEN TG_OP IN ('UPDATE', 'DELETE') THEN row_to_json(OLD)::JSONB ELSE NULL END,
    CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN row_to_json(NEW)::JSONB ELSE NULL END,
    auth.uid(),
    auth.jwt() ->> 'email'
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Aplicar trigger a tablas principales
CREATE OR REPLACE TRIGGER trg_audit_camareros
  AFTER INSERT OR UPDATE OR DELETE ON camareros
  FOR EACH ROW EXECUTE FUNCTION fn_audit_trail();

CREATE OR REPLACE TRIGGER trg_audit_pedidos
  AFTER INSERT OR UPDATE OR DELETE ON pedidos
  FOR EACH ROW EXECUTE FUNCTION fn_audit_trail();

CREATE OR REPLACE TRIGGER trg_audit_coordinadores
  AFTER INSERT OR UPDATE OR DELETE ON coordinadores
  FOR EACH ROW EXECUTE FUNCTION fn_audit_trail();
