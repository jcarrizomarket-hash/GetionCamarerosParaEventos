-- Script de migración: KV Store → Tablas SQL
-- Ejecutar en el SQL Editor de Supabase Dashboard
-- Es idempotente: usa INSERT ... ON CONFLICT DO UPDATE

-- =====================================================
-- CAMAREROS
-- =====================================================
INSERT INTO public.camareros (
  numero, codigo, tipo_perfil, nombre, apellido, telefono, email,
  estado, especialidades, experiencia, comentarios,
  idiomas, otros_idiomas, certificaciones, otras_certificaciones,
  disponibilidad, apercibimientos
)
SELECT
  (value->>'numero')::integer,
  value->>'codigo',
  COALESCE(value->>'tipoPerfil', 'CAM'),
  COALESCE(value->>'nombre', 'Sin nombre'),
  COALESCE(value->>'apellido', ''),
  value->>'telefono',
  value->>'email',
  COALESCE(value->>'estado', 'activo'),
  COALESCE((value->'especialidades')::text[], '{}'),
  value->>'experiencia',
  value->>'comentarios',
  COALESCE((value->'idiomas')::text[], '{}'),
  value->>'otrosIdiomas',
  COALESCE((value->'certificaciones')::text[], '{}'),
  value->>'otrasCertificaciones',
  COALESCE((value->'disponibilidad'), '[]'::jsonb),
  COALESCE((value->>'apercibimientos')::integer, 0)
FROM kv_store_25b11ac0
WHERE key LIKE 'camarero:%'
ON CONFLICT (numero) DO UPDATE SET
  nombre = EXCLUDED.nombre,
  apellido = EXCLUDED.apellido,
  telefono = EXCLUDED.telefono,
  email = EXCLUDED.email,
  estado = EXCLUDED.estado,
  especialidades = EXCLUDED.especialidades,
  experiencia = EXCLUDED.experiencia,
  comentarios = EXCLUDED.comentarios,
  idiomas = EXCLUDED.idiomas,
  otros_idiomas = EXCLUDED.otros_idiomas,
  certificaciones = EXCLUDED.certificaciones,
  otras_certificaciones = EXCLUDED.otras_certificaciones,
  disponibilidad = EXCLUDED.disponibilidad,
  apercibimientos = EXCLUDED.apercibimientos,
  updated_at = now();

-- =====================================================
-- COORDINADORES
-- =====================================================
INSERT INTO public.coordinadores (nombre, telefono, email, activo)
SELECT
  value->>'nombre',
  value->>'telefono',
  value->>'email',
  COALESCE((value->>'activo')::boolean, true)
FROM kv_store_25b11ac0
WHERE key LIKE 'coordinador:%'
ON CONFLICT (nombre) DO UPDATE SET
  telefono = EXCLUDED.telefono,
  email = EXCLUDED.email,
  activo = EXCLUDED.activo;

-- =====================================================
-- CLIENTES
-- =====================================================
INSERT INTO public.clientes (nombre, telefono, email)
SELECT
  value->>'nombre',
  value->>'telefono',
  value->>'email'
FROM kv_store_25b11ac0
WHERE key LIKE 'cliente:%'
ON CONFLICT (nombre) DO UPDATE SET
  telefono = EXCLUDED.telefono,
  email = EXCLUDED.email;

-- =====================================================
-- PEDIDOS
-- =====================================================
INSERT INTO public.pedidos (
  numero, cliente, lugar, ubicacion, dia_evento,
  cantidad_camareros, hora_entrada, hora_salida, total_horas,
  cantidad_camareros2, hora_entrada2, hora_salida2, total_horas2,
  catering, tiempo_viaje, camisa, notas,
  coordinador_nombre, asignaciones
)
SELECT
  value->>'numero',
  COALESCE(value->>'cliente', 'Sin cliente'),
  COALESCE(value->>'lugar', 'Sin lugar'),
  value->>'ubicacion',
  (value->>'diaEvento')::date,
  COALESCE((value->>'cantidadCamareros')::integer, 1),
  COALESCE(value->>'horaEntrada', '00:00'),
  value->>'horaSalida',
  value->>'totalHoras',
  (value->>'cantidadCamareros2')::integer,
  value->>'horaEntrada2',
  value->>'horaSalida2',
  value->>'totalHoras2',
  COALESCE(value->>'catering', 'no'),
  value->>'tiempoViaje',
  COALESCE(value->>'camisa', 'negra'),
  value->>'notas',
  value->>'coordinadorNombre',
  COALESCE((value->'asignaciones'), '[]'::jsonb)
FROM kv_store_25b11ac0
WHERE key LIKE 'pedido:%'
  AND value->>'diaEvento' IS NOT NULL
  AND value->>'diaEvento' ~ '^\d{4}-\d{2}-\d{2}$'
ON CONFLICT (numero) DO UPDATE SET
  cliente = EXCLUDED.cliente,
  lugar = EXCLUDED.lugar,
  dia_evento = EXCLUDED.dia_evento,
  asignaciones = EXCLUDED.asignaciones,
  updated_at = now();

-- =====================================================
-- RESUMEN
-- =====================================================
SELECT 
  'camareros' as tabla, count(*) as registros FROM public.camareros
UNION ALL
SELECT 'coordinadores', count(*) FROM public.coordinadores
UNION ALL
SELECT 'clientes', count(*) FROM public.clientes
UNION ALL
SELECT 'pedidos', count(*) FROM public.pedidos;
