-- Migración: Crear tablas SQL relacionales para reemplazar el KV store
-- Idempotente: usa IF NOT EXISTS

-- =====================================================
-- Tabla camareros
-- =====================================================
CREATE TABLE IF NOT EXISTS public.camareros (
  id              uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
  numero          integer       NOT NULL UNIQUE,
  codigo          text,
  tipo_perfil     text          NOT NULL DEFAULT 'CAM',
  nombre          text          NOT NULL,
  apellido        text          NOT NULL,
  telefono        text,
  email           text,
  estado          text          NOT NULL DEFAULT 'activo',
  especialidades  text[]        DEFAULT '{}',
  experiencia     text,
  coordinador_id  uuid,
  comentarios     text,
  idiomas         text[]        DEFAULT '{}',
  otros_idiomas   text,
  certificaciones text[]        DEFAULT '{}',
  otras_certificaciones text,
  disponibilidad  jsonb         DEFAULT '[]',
  apercibimientos integer       NOT NULL DEFAULT 0,
  created_at      timestamptz   NOT NULL DEFAULT now(),
  updated_at      timestamptz   NOT NULL DEFAULT now()
);

ALTER TABLE public.camareros ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- Tabla coordinadores
-- =====================================================
CREATE TABLE IF NOT EXISTS public.coordinadores (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre      text        NOT NULL UNIQUE,
  telefono    text,
  email       text,
  activo      boolean     NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.coordinadores ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- Tabla clientes
-- =====================================================
CREATE TABLE IF NOT EXISTS public.clientes (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre      text        NOT NULL UNIQUE,
  telefono    text,
  email       text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- Tabla pedidos
-- =====================================================
CREATE TABLE IF NOT EXISTS public.pedidos (
  id                    uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  numero                text        UNIQUE,
  cliente               text        NOT NULL,
  lugar                 text        NOT NULL,
  ubicacion             text,
  dia_evento            date        NOT NULL,
  cantidad_camareros    integer     NOT NULL DEFAULT 1,
  hora_entrada          text        NOT NULL,
  hora_salida           text,
  total_horas           text,
  cantidad_camareros2   integer,
  hora_entrada2         text,
  hora_salida2          text,
  total_horas2          text,
  catering              text        NOT NULL DEFAULT 'no',
  tiempo_viaje          text,
  camisa                text        NOT NULL DEFAULT 'negra',
  notas                 text,
  coordinador_id        uuid,
  coordinador_nombre    text,
  asignaciones          jsonb       DEFAULT '[]',
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.pedidos ENABLE ROW LEVEL SECURITY;

-- Índices para búsqueda eficiente
CREATE INDEX IF NOT EXISTS idx_pedidos_dia_evento ON public.pedidos(dia_evento);
CREATE INDEX IF NOT EXISTS idx_pedidos_coordinador ON public.pedidos(coordinador_id);
CREATE INDEX IF NOT EXISTS idx_camareros_estado ON public.camareros(estado);
CREATE INDEX IF NOT EXISTS idx_camareros_tipo_perfil ON public.camareros(tipo_perfil);
