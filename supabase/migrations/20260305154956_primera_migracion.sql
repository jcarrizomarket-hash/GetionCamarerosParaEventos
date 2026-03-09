-- =========================
-- 0) Extensiones necesarias
-- =========================
create extension if not exists pgcrypto;

-- =========================
-- 1) Tipos y tablas core
-- =========================
do $$
begin
  if not exists (select 1 from pg_type where typname = 'app_role') then
    create type public.app_role as enum ('admin', 'coordinador', 'camarero');
  end if;
end$$;

create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

-- Perfil 1:1 con auth.users
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Relación usuario <-> organización con rol
create table if not exists public.memberships (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (organization_id, user_id)
);

-- Eventos (una org por evento)
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  starts_at timestamptz,
  ends_at timestamptz,
  location text,
  notes text,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Asignaciones (camarero = user_id con rol 'camarero')
create table if not exists public.assignments (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  staff_user_id uuid not null references public.profiles(id) on delete cascade,
  position text,               -- ej: barra, sala, runner
  check_in_at timestamptz,
  check_out_at timestamptz,
  status text not null default 'assigned', -- assigned/confirmed/cancelled/etc.
  notes text,
  created_at timestamptz not null default now(),
  unique (event_id, staff_user_id)
);

-- =========================
-- 2) Timestamps automáticos
-- =========================
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists trg_events_updated_at on public.events;
create trigger trg_events_updated_at
before update on public.events
for each row execute function public.set_updated_at();

-- =========================
-- 3) Auto-crear profile al registrarse (Auth)
-- =========================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, phone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.email),
    new.raw_user_meta_data->>'phone'
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

-- =========================
-- 4) Helpers de permisos (RLS)
-- =========================
create or replace function public.current_org_id()
returns uuid
language sql
stable
as $$
  select organization_id
  from public.memberships
  where user_id = auth.uid()
  limit 1
$$;

create or replace function public.has_role(required_role public.app_role)
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.memberships m
    where m.user_id = auth.uid()
      and m.role = required_role
  )
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
as $$ select public.has_role('admin') $$;

create or replace function public.is_coordinator_or_admin()
returns boolean
language sql
stable
as $$
  select public.has_role('admin') or public.has_role('coordinador')
$$;

-- =========================
-- 5) RLS ON + Policies
-- =========================
alter table public.profiles enable row level security;
alter table public.organizations enable row level security;
alter table public.memberships enable row level security;
alter table public.events enable row level security;
alter table public.assignments enable row level security;

-- PROFILES: cada uno ve y edita su perfil
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
on public.profiles for select
using (id = auth.uid());

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
on public.profiles for update
using (id = auth.uid())
with check (id = auth.uid());

-- ORGANIZATIONS: solo miembros pueden ver su org
drop policy if exists "org_select_member" on public.organizations;
create policy "org_select_member"
on public.organizations for select
using (
  exists (
    select 1 from public.memberships m
    where m.organization_id = organizations.id
      and m.user_id = auth.uid()
  )
);

-- MEMBERSHIPS:
-- - miembros pueden verse a sí mismos
-- - admin/coordinador pueden ver toda la org y gestionar membresías
drop policy if exists "memberships_select_self" on public.memberships;
create policy "memberships_select_self"
on public.memberships for select
using (user_id = auth.uid());

drop policy if exists "memberships_select_org_admin_coord" on public.memberships;
create policy "memberships_select_org_admin_coord"
on public.memberships for select
using (
  exists (
    select 1
    from public.memberships me
    where me.user_id = auth.uid()
      and me.organization_id = memberships.organization_id
      and (me.role = 'admin' or me.role = 'coordinador')
  )
);

drop policy if exists "memberships_manage_admin" on public.memberships;
create policy "memberships_manage_admin"
on public.memberships for all
using (
  exists (
    select 1
    from public.memberships me
    where me.user_id = auth.uid()
      and me.organization_id = memberships.organization_id
      and me.role = 'admin'
  )
)
with check (
  exists (
    select 1
    from public.memberships me
    where me.user_id = auth.uid()
      and me.organization_id = memberships.organization_id
      and me.role = 'admin'
  )
);

-- EVENTS:
-- - miembros ven eventos de su org
-- - admin/coordinador crean/actualizan/borran
drop policy if exists "events_select_member" on public.events;
create policy "events_select_member"
on public.events for select
using (
  exists (
    select 1 from public.memberships m
    where m.organization_id = events.organization_id
      and m.user_id = auth.uid()
  )
);

drop policy if exists "events_manage_admin_coord" on public.events;
create policy "events_manage_admin_coord"
on public.events for insert
with check (
  exists (
    select 1 from public.memberships m
    where m.organization_id = events.organization_id
      and m.user_id = auth.uid()
      and (m.role = 'admin' or m.role = 'coordinador')
  )
);

drop policy if exists "events_update_admin_coord" on public.events;
create policy "events_update_admin_coord"
on public.events for update
using (
  exists (
    select 1 from public.memberships m
    where m.organization_id = events.organization_id
      and m.user_id = auth.uid()
      and (m.role = 'admin' or m.role = 'coordinador')
  )
)
with check (
  exists (
    select 1 from public.memberships m
    where m.organization_id = events.organization_id
      and m.user_id = auth.uid()
      and (m.role = 'admin' or m.role = 'coordinador')
  )
);

drop policy if exists "events_delete_admin_coord" on public.events;
create policy "events_delete_admin_coord"
on public.events for delete
using (
  exists (
    select 1 from public.memberships m
    where m.organization_id = events.organization_id
      and m.user_id = auth.uid()
      and (m.role = 'admin' or m.role = 'coordinador')
  )
);

-- ASSIGNMENTS:
-- - miembro (cualquiera) puede ver asignaciones de eventos de su org
-- - admin/coordinador gestionan asignaciones
-- - camarero puede ver sus propias asignaciones
drop policy if exists "assignments_select_org_member" on public.assignments;
create policy "assignments_select_org_member"
on public.assignments for select
using (
  exists (
    select 1
    from public.events e
    join public.memberships m on m.organization_id = e.organization_id
    where e.id = assignments.event_id
      and m.user_id = auth.uid()
  )
);

drop policy if exists "assignments_select_own" on public.assignments;
create policy "assignments_select_own"
on public.assignments for select
using (staff_user_id = auth.uid());

drop policy if exists "assignments_manage_admin_coord" on public.assignments;
create policy "assignments_manage_admin_coord"
on public.assignments for insert
with check (
  exists (
    select 1
    from public.events e
    join public.memberships m on m.organization_id = e.organization_id
    where e.id = assignments.event_id
      and m.user_id = auth.uid()
      and (m.role = 'admin' or m.role = 'coordinador')
  )
);

drop policy if exists "assignments_update_admin_coord" on public.assignments;
create policy "assignments_update_admin_coord"
on public.assignments for update
using (
  exists (
    select 1
    from public.events e
    join public.memberships m on m.organization_id = e.organization_id
    where e.id = assignments.event_id
      and m.user_id = auth.uid()
      and (m.role = 'admin' or m.role = 'coordinador')
  )
)
with check (
  exists (
    select 1
    from public.events e
    join public.memberships m on m.organization_id = e.organization_id
    where e.id = assignments.event_id
      and m.user_id = auth.uid()
      and (m.role = 'admin' or m.role = 'coordinador')
  )
);

drop policy if exists "assignments_delete_admin_coord" on public.assignments;
create policy "assignments_delete_admin_coord"
on public.assignments for delete
using (
  exists (
    select 1
    from public.events e
    join public.memberships m on m.organization_id = e.organization_id
    where e.id = assignments.event_id
      and m.user_id = auth.uid()
      and (m.role = 'admin' or m.role = 'coordinador')
  )
);

-- =========================
-- 6) Índices (performance)
-- =========================
create index if not exists idx_memberships_org_user on public.memberships (organization_id, user_id);
create index if not exists idx_memberships_user on public.memberships (user_id);
create index if not exists idx_events_org on public.events (organization_id);
create index if not exists idx_assignments_event on public.assignments (event_id);
create index if not exists idx_assignments_staff on public.assignments (staff_user_id);
