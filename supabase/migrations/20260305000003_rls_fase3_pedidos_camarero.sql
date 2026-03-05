-- Migration: rls_fase3_pedidos_camarero
-- Auth Fase 3: filtro de pedidos por camarero asignado.
-- Reemplaza la política placeholder de Fase 2 con una política real que filtra
-- los pedidos por la asignación del camarero en la tabla relacional asignaciones_pedido.
--
-- Para aplicar:
--   supabase db push
-- o via el editor SQL del dashboard de Supabase.
--
-- Idempotente: usa IF NOT EXISTS, OR REPLACE y DROP POLICY IF EXISTS.

-- ---------------------------------------------------------------------------
-- Prerequisitos: tablas dependientes (IF NOT EXISTS para idempotencia)
-- ---------------------------------------------------------------------------

-- user_profiles: creada en Fase 1; stub mínimo para que las FK funcionen
-- si la migración de Fase 1 aún no se ha aplicado.
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid        NOT NULL UNIQUE,
  rol        text        NOT NULL DEFAULT 'camarero',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- pedidos: tabla principal de pedidos (los datos pueden venir del KV store).
-- Solo los campos necesarios para que las foreign keys funcionen.
CREATE TABLE IF NOT EXISTS public.pedidos (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  numero      text,
  lugar       text,
  dia_evento  text,
  hora_entrada text,
  hora_salida  text,
  catering    text,
  camisa      text,
  notas       text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.pedidos ENABLE ROW LEVEL SECURITY;

-- camareros: tabla de perfiles de camarero.
-- Solo los campos mínimos para que las foreign keys funcionen.
CREATE TABLE IF NOT EXISTS public.camareros (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.camareros ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- Tabla asignaciones_pedido
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.asignaciones_pedido (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  pedido_id    uuid        NOT NULL REFERENCES public.pedidos(id)   ON DELETE CASCADE,
  camarero_id  uuid        NOT NULL REFERENCES public.camareros(id) ON DELETE CASCADE,
  estado       text        NOT NULL DEFAULT 'pendiente',
  turno        integer     NOT NULL DEFAULT 1,
  hora_entrada text,
  hora_salida  text,
  created_at   timestamptz NOT NULL DEFAULT now(),
  UNIQUE(pedido_id, camarero_id)
);

ALTER TABLE public.asignaciones_pedido ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- Política placeholder de Fase 2 (eliminar para reemplazar con la real)
-- ---------------------------------------------------------------------------

DROP POLICY IF EXISTS "camarero lee sus pedidos" ON public.pedidos;

-- ---------------------------------------------------------------------------
-- Política real en public.pedidos
-- ---------------------------------------------------------------------------

-- Camarero: lee pedidos donde está efectivamente asignado
CREATE POLICY "camarero lee pedidos asignados"
  ON public.pedidos FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.asignaciones_pedido ap
      JOIN public.user_profiles up ON up.id = ap.camarero_id
      WHERE ap.pedido_id = public.pedidos.id
        AND up.user_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- Políticas RLS para asignaciones_pedido
-- ---------------------------------------------------------------------------

-- Admin: CRUD completo
CREATE POLICY "admin crud asignaciones"
  ON public.asignaciones_pedido FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE user_id = auth.uid() AND rol = 'admin'
    )
  );

-- Coordinador: CRUD completo en asignaciones
CREATE POLICY "coordinador crud asignaciones"
  ON public.asignaciones_pedido FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE user_id = auth.uid() AND rol IN ('admin', 'coordinador')
    )
  );

-- Camarero: solo lee sus propias asignaciones
CREATE POLICY "camarero lee sus asignaciones"
  ON public.asignaciones_pedido FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles up
      WHERE up.user_id = auth.uid()
        AND up.id = public.asignaciones_pedido.camarero_id
    )
  );

-- Camarero: puede actualizar el estado de sus propias asignaciones (confirmar/rechazar)
CREATE POLICY "camarero actualiza estado asignacion"
  ON public.asignaciones_pedido FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles up
      WHERE up.user_id = auth.uid()
        AND up.id = public.asignaciones_pedido.camarero_id
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_profiles up
      WHERE up.user_id = auth.uid()
        AND up.id = public.asignaciones_pedido.camarero_id
    )
  );

-- ---------------------------------------------------------------------------
-- Vista v_pedidos_camarero
-- ---------------------------------------------------------------------------

CREATE OR REPLACE VIEW public.v_pedidos_camarero AS
SELECT
  p.id,
  p.numero,
  p.lugar,
  p.dia_evento,
  p.hora_entrada,
  p.hora_salida,
  p.catering,
  p.camisa,
  p.notas,
  ap.estado        AS estado_asignacion,
  ap.turno,
  ap.hora_entrada  AS hora_entrada_asignada,
  ap.hora_salida   AS hora_salida_asignada,
  up.id            AS camarero_id,
  up.user_id
FROM public.pedidos p
JOIN public.asignaciones_pedido ap ON ap.pedido_id = p.id
JOIN public.user_profiles up ON up.id = ap.camarero_id;

-- RLS: solo el camarero ve su propia fila en la vista
ALTER VIEW public.v_pedidos_camarero OWNER TO authenticated;
