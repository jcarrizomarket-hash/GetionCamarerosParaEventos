-- Migración: Crear tabla KV store utilizada por la Edge Function
-- Esta tabla es el almacenamiento primario de todos los datos de la app
-- (camareros, coordinadores, clientes, pedidos, contadores, tokens QR)

CREATE TABLE IF NOT EXISTS public.kv_store_25b11ac0 (
  key  TEXT    NOT NULL PRIMARY KEY,
  value JSONB  NOT NULL
);

-- Índice para acelerar búsquedas por prefijo (getByPrefix usa LIKE 'prefix%')
CREATE INDEX IF NOT EXISTS idx_kv_store_key_prefix
  ON public.kv_store_25b11ac0 (key text_pattern_ops);

-- RLS: solo la service role puede leer/escribir (la Edge Function usa service role)
ALTER TABLE public.kv_store_25b11ac0 ENABLE ROW LEVEL SECURITY;

-- Ningún usuario anónimo ni autenticado accede directamente
-- (todo pasa por la Edge Function que usa SUPABASE_SERVICE_ROLE_KEY)
CREATE POLICY "Solo service role" ON public.kv_store_25b11ac0
  FOR ALL
  USING (false)
  WITH CHECK (false);
