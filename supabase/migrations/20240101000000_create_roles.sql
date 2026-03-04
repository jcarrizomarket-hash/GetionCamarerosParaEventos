-- Migration: create_roles
-- Creates the roles table used for waiter profile types (tipos de perfil)
-- and enables Row Level Security policies.
--
-- To apply:
--   supabase db push
-- or via the Supabase dashboard SQL editor.

-- ---------------------------------------------------------------------------
-- Table
-- ---------------------------------------------------------------------------

create table if not exists public.roles (
  id           serial        primary key,
  name         text          not null unique,          -- machine key, e.g. 'CAM'
  display_name text          not null,                 -- human label, e.g. 'Camarero'
  sort_order   integer       not null default 0,
  is_active    boolean       not null default true,
  created_at   timestamptz   not null default now()
);

comment on table  public.roles               is 'Waiter profile types (tipos de perfil / roles)';
comment on column public.roles.name          is 'Short machine-readable key used in camarero records (tipoPerfil)';
comment on column public.roles.display_name  is 'Human-readable label shown in the UI';
comment on column public.roles.sort_order    is 'Display order in dropdowns (lower = first)';
comment on column public.roles.is_active     is 'Only active roles are shown in the new-camarero form';

-- Seed the four default profile types previously hard-coded in the frontend
insert into public.roles (name, display_name, sort_order) values
  ('CAM', 'Camarero',  1),
  ('COC', 'Cocina',    2),
  ('PIC', 'Pica',      3),
  ('AZA', 'Azafata',   4)
on conflict (name) do update
  set display_name = excluded.display_name,
      sort_order   = excluded.sort_order;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table public.roles enable row level security;

-- Any authenticated user can read active roles (needed for the form dropdown)
create policy "authenticated users can read active roles"
  on public.roles
  for select
  to authenticated
  using (is_active = true);

-- Allow anonymous / anon-key reads so the form works before login too
create policy "anon users can read active roles"
  on public.roles
  for select
  to anon
  using (is_active = true);

-- Only service-role (admins) can insert / update / delete rows
-- (managed via Supabase dashboard or service-role key; no frontend policy needed)
