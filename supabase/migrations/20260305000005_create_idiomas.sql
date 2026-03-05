-- Migration: create_idiomas
-- Crea la tabla de idiomas para reemplazar la constante IDIOMAS
-- hardcodeada en el frontend.
--
-- Para aplicar:
--   supabase db push
-- o via el editor SQL del dashboard de Supabase.

-- ---------------------------------------------------------------------------
-- Table
-- ---------------------------------------------------------------------------

create table if not exists public.idiomas (
  id          serial        primary key,
  name        text          not null unique,
  sort_order  integer       not null default 0,
  is_active   boolean       not null default true,
  created_at  timestamptz   not null default now()
);

comment on table  public.idiomas            is 'Idiomas disponibles para el perfil de camarero';
comment on column public.idiomas.name       is 'Nombre del idioma mostrado en la UI';
comment on column public.idiomas.sort_order is 'Orden de aparición en el formulario (menor = primero)';
comment on column public.idiomas.is_active  is 'Solo los idiomas activos se muestran en el formulario';
comment on column public.idiomas.created_at is 'Fecha de creación del registro';

-- Seed: los valores anteriormente hardcodeados en el frontend
insert into public.idiomas (name, sort_order) values
  ('Castellano', 1),
  ('Portugués',  2),
  ('Catalán',    3),
  ('Inglés',     4),
  ('Francés',    5),
  ('Alemán',     6),
  ('Italiano',   7)
on conflict (name) do update
  set sort_order = excluded.sort_order;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table public.idiomas enable row level security;

-- Usuarios autenticados pueden leer idiomas activos
create policy "authenticated users can read active idiomas"
  on public.idiomas
  for select
  to authenticated
  using (is_active = true);

-- Usuarios anónimos también pueden leerlos
create policy "anon users can read active idiomas"
  on public.idiomas
  for select
  to anon
  using (is_active = true);

-- Solo service-role puede insertar / actualizar / eliminar
