-- Migration: Create public.idiomas table
-- Replaces the hardcoded IDIOMAS constant in src/components/camareros/types.ts
-- with a database-backed list of languages.

CREATE TABLE IF NOT EXISTS public.idiomas (
  id          uuid        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code        text        NOT NULL,
  name        text        NOT NULL,
  native_name text,
  sort_order  integer     NOT NULL DEFAULT 0,
  is_active   boolean     NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT idiomas_code_key UNIQUE (code)
);

-- Enable Row Level Security
ALTER TABLE public.idiomas ENABLE ROW LEVEL SECURITY;

-- Policy: authenticated users may read active rows
CREATE POLICY "authenticated_select_active_idiomas"
  ON public.idiomas
  FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Seed data equivalent to the previous IDIOMAS constant
INSERT INTO public.idiomas (code, name, native_name, sort_order, is_active) VALUES
  ('cas', 'Castellano', 'Castellano',  1, true),
  ('por', 'Portugués',  'Português',   2, true),
  ('cat', 'Catalán',    'Català',      3, true),
  ('eng', 'Inglés',     'English',     4, true),
  ('fra', 'Francés',    'Français',    5, true),
  ('deu', 'Alemán',     'Deutsch',     6, true),
  ('ita', 'Italiano',   'Italiano',    7, true)
ON CONFLICT (code) DO NOTHING;
