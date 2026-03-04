-- Migration: create_especialidades
-- Crea la tabla de especialidades para reemplazar la constante ESPECIALIDADES
-- hardcodeada en el frontend.
--
-- Para aplicar:
--   supabase db push
-- o via el editor SQL del dashboard de Supabase.

-- ---------------------------------------------------------------------------
-- Table
-- ---------------------------------------------------------------------------

create table if not exists public.especialidades (
  id          serial        primary key,
  nombre      text          not null unique,
  sort_order  integer       not null default 0,
  is_active   boolean       not null default true,
  created_at  timestamptz   not null default now()
);

comment on table  public.especialidades            is 'Especialidades disponibles para el perfil de camarero';
comment on column public.especialidades.nombre     is 'Nombre de la especialidad mostrado en la UI';
comment on column public.especialidades.sort_order is 'Orden de aparición en el formulario (menor = primero)';
comment on column public.especialidades.is_active  is 'Solo las especialidades activas se muestran en el formulario';

-- Seed: los valores anteriormente hardcodeados en el frontend
insert into public.especialidades (nombre, sort_order) values
  ('Coctelería', 1),
  ('Banquetes',  2),
  ('Restaurant', 3),
  ('Buffet',     4),
  ('VIP',        5)
on conflict (nombre) do update
  set sort_order = excluded.sort_order;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table public.especialidades enable row level security;

-- Usuarios autenticados pueden leer especialidades activas
create policy "authenticated users can read active especialidades"
  on public.especialidades
  for select
  to authenticated
  using (is_active = true);

-- Usuarios anónimos también pueden leerlas
create policy "anon users can read active especialidades"
  on public.especialidades
  for select
  to anon
  using (is_active = true);

-- Solo service-role puede insertar / actualizar / eliminar
-- (gestionado vía dashboard de Supabase o service-role key)
