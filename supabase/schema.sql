-- ============================================================================
-- Banupriya Portfolio — Supabase Centralized Database & RLS Schema
-- Run this entire script once in: Supabase Dashboard -> SQL Editor -> New Query
-- ============================================================================

-- 1. Admin Allowlist Table (restricts database write access to authorized admins only)
CREATE TABLE IF NOT EXISTS public.admin_users (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Allow an authenticated admin to verify their own row (required for admin check & RLS)
DROP POLICY IF EXISTS "Admins can read own admin record" ON public.admin_users;
CREATE POLICY "Admins can read own admin record"
  ON public.admin_users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- 2. Portfolio Content Table (stores all portfolio sections centrally)
CREATE TABLE IF NOT EXISTS public.portfolio_site (
  id text PRIMARY KEY DEFAULT 'main' CHECK (id = 'main'),
  profile jsonb NOT NULL DEFAULT '{}'::jsonb,
  about jsonb NOT NULL DEFAULT '{}'::jsonb,
  skills jsonb NOT NULL DEFAULT '[]'::jsonb,
  projects jsonb NOT NULL DEFAULT '[]'::jsonb,
  experience jsonb NOT NULL DEFAULT '[]'::jsonb,
  education jsonb NOT NULL DEFAULT '{}'::jsonb,
  certifications jsonb NOT NULL DEFAULT '[]'::jsonb,
  contact jsonb NOT NULL DEFAULT '{}'::jsonb,
  footer jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

ALTER TABLE public.portfolio_site ENABLE ROW LEVEL SECURITY;

-- Public visitors (and SSR) can read published portfolio content
DROP POLICY IF EXISTS "Public can read published portfolio" ON public.portfolio_site;
CREATE POLICY "Public can read published portfolio"
  ON public.portfolio_site
  FOR SELECT
  TO anon, authenticated
  USING (id = 'main');

-- Only authenticated users present in public.admin_users can insert
DROP POLICY IF EXISTS "Only authenticated admins can insert portfolio" ON public.portfolio_site;
CREATE POLICY "Only authenticated admins can insert portfolio"
  ON public.portfolio_site
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.admin_users au
      WHERE au.user_id = auth.uid()
    )
  );

-- Only authenticated users present in public.admin_users can update
DROP POLICY IF EXISTS "Only authenticated admins can update portfolio" ON public.portfolio_site;
CREATE POLICY "Only authenticated admins can update portfolio"
  ON public.portfolio_site
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users au
      WHERE au.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.admin_users au
      WHERE au.user_id = auth.uid()
    )
  );

-- Only authenticated users present in public.admin_users can delete
DROP POLICY IF EXISTS "Only authenticated admins can delete portfolio" ON public.portfolio_site;
CREATE POLICY "Only authenticated admins can delete portfolio"
  ON public.portfolio_site
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users au
      WHERE au.user_id = auth.uid()
    )
  );

-- Automatically update updated_at timestamp on changes
CREATE OR REPLACE FUNCTION public.set_portfolio_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_portfolio_site_updated_at ON public.portfolio_site;
CREATE TRIGGER trg_portfolio_site_updated_at
  BEFORE UPDATE ON public.portfolio_site
  FOR EACH ROW
  EXECUTE FUNCTION public.set_portfolio_updated_at();

-- ============================================================================
-- 3. Grant Admin Access to Your Supabase Auth User
-- After creating your user in: Authentication -> Users -> Add user
-- Run this (replace with your exact admin email):
--
-- INSERT INTO public.admin_users (user_id, email)
-- SELECT id, email FROM auth.users WHERE email = 'your-admin-email@example.com'
-- ON CONFLICT (user_id) DO NOTHING;
-- ============================================================================
